import { useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { chatApi, shiftTextTone } from '@/lib/aiApis';
import { Sidebar } from '@/components/Sidebar/Sidebar';
import { Composer } from '@/components/Composer/Composer';
import { ChatArea } from './components/ChatArea';
import { DashboardHeader } from './components/DashboardHeader';
import { type AiTone, type AiFormat } from '@/lib/mockAi';
import { useMobile } from '@/hooks/useMobile';
import type { Message } from '@/components/ChatMessage/ChatMessage';
import { useAuthSync } from '@/hooks/useAuthSync';
import { withAuthenticationRequired } from '@auth0/auth0-react';

function DashboardPage() {
  const isMobile = useMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const { dbUser } = useAuthSync();
  const queryClient = useQueryClient();

  // --- 1. CORE STATE ---
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeTone, setActiveTone] = useState<AiTone>('Professional');
  const [activeFormat, setActiveFormat] = useState<AiFormat>('Email');
  const [interactionId, setInteractionId] = useState<string>('');

  // --- 2. OPTIMISTIC/STREAMING STATE ---
  // Instead of a complex array, we just hold the "current interaction" in memory 
  // until it finishes saving to the database.
  const [pendingUserText, setPendingUserText] = useState<string | null>(null);
  const [streamingAiText, setStreamingAiText] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);


  // MUTATIONS & HANDLERS ---
  const shiftToneMutation = useMutation({
    mutationFn: shiftTextTone,
  });

  const { data: chats = [] } = useQuery({
    queryKey: ['chats'],
    queryFn: chatApi.getChats,
    enabled: !!dbUser,
  });

  const { data: backendMessages = [] } = useQuery({
    queryKey: ['messages', activeChatId],
    queryFn: () => chatApi.getMessages(activeChatId!),
    enabled: !!activeChatId && !shiftToneMutation.isPending && !isStreaming,
    staleTime: Infinity,
  });


  const handleSend = useCallback(async (text: string, tone: AiTone, format: AiFormat) => {
    // 1. Generate a unique ID for this specific message round
    const currentInteractionId = Date.now().toString();
    setInteractionId(currentInteractionId);

    setActiveTone(tone);
    setActiveFormat(format);
    setPendingUserText(text);
    setStreamingAiText('');

    shiftToneMutation.mutate(
      { originalText: text, targetTone: tone, format, chatId: activeChatId || undefined },
      {
        onSuccess: async (data) => {
          const currentChatId = data.chatId || activeChatId;
          if (!activeChatId && currentChatId) {
            setActiveChatId(currentChatId);
          }

          queryClient.invalidateQueries({ queryKey: ['chats'] });
          setIsStreaming(true);

          const words = data.shiftedText.split(' ');
          let currentText = '';

          for (let i = 0; i < words.length; i++) {
            currentText += words[i] + (i === words.length - 1 ? '' : ' ');
            setStreamingAiText(currentText);
            await new Promise(resolve => setTimeout(resolve, 30));
          }

          // 2. Inject into cache using the EXACT same IDs as displayMessages!
          queryClient.setQueryData(['messages', currentChatId], (old: any) => {
            const previousMessages = old || [];
            return [
              ...previousMessages,
              {
                _id: `user-${currentInteractionId}`, // <-- Perfectly matches!
                chatId: currentChatId,
                role: 'user',
                content: text,
                createdAt: new Date().toISOString()
              },
              {
                _id: `ai-${currentInteractionId}`,   // <-- Perfectly matches!
                chatId: currentChatId,
                role: 'ai',
                content: data.shiftedText,
                createdAt: new Date().toISOString()
              }
            ];
          });

          // 3. Clear streaming state. 
          setIsStreaming(false);
          setPendingUserText(null);
          setStreamingAiText('');

          // 🚨 NOTICE: We REMOVED queryClient.invalidateQueries!
          // We trust our cache now. No background fetch means no ID swapping, which means zero flickering!
        },
        onError: () => {
          toast.error("Failed to process message.");
          setPendingUserText(null);
        }
      }
    );
  }, [activeChatId, shiftToneMutation, queryClient]);

  const handleSelectChat = (id: string) => {
    setActiveChatId(id);
    setPendingUserText(null); // Clear any streaming text if they switch chats fast
    setStreamingAiText('');
    if (isMobile) setSidebarOpen(false);
  };

  const handleNewChat = () => {
    setActiveChatId(null);
    setPendingUserText(null);
    setStreamingAiText('');
    if (isMobile) setSidebarOpen(false);
  };

  // --- 5. UI MAPPERS ---

  // Combine real database messages with the current pending/streaming interaction
  const displayMessages: Message[] = useMemo(() => {
    const messages = backendMessages.map(m => ({
      id: m._id,
      role: m.role as 'user' | 'ai',
      content: m.content,
      timestamp: new Date(m.createdAt),
      chatId: m.chatId
    }));

    if (pendingUserText) {
      // 🚨 USE interactionId HERE
      messages.push({ id: `user-${interactionId}`, role: 'user', content: pendingUserText, timestamp: new Date() });

      if (isStreaming) {
        // 🚨 AND HERE
        messages.push({ id: `ai-${interactionId}`, role: 'ai', content: streamingAiText, timestamp: new Date() });
      }
    }
    return messages;
  }, [backendMessages, pendingUserText, isStreaming, streamingAiText, interactionId]);

  const activeChat = chats.find(c => c._id === activeChatId);

  const sidebarSessions = useMemo(() => chats.map(chat => ({
    id: chat._id,
    title: chat.title,
    preview: "Click to view conversation",
    timestamp: new Date(chat.createdAt),
    active: chat._id === activeChatId
  })), [chats, activeChatId]);

  if (!dbUser) return <div className="flex h-screen items-center justify-center">Loading your profile...</div>;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        sessions={sidebarSessions}
        activeSessionId={activeChatId}
        onNewChat={handleNewChat}
        onSelectSession={handleSelectChat}
        onLogout={() => toast.success('Logged out successfully')}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userEmail={dbUser.email || "User"}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full">
        <DashboardHeader
          onMenuToggle={() => setSidebarOpen(prev => !prev)}
          activeTone={activeTone}
          activeFormat={activeFormat}
          chatTitle={activeChat?.title ?? 'New Chat'}
        />

        <ChatArea
          messages={displayMessages}
          // Only show typing indicator when waiting for API, hide it once streaming starts
          isTyping={shiftToneMutation.isPending}
          streamingMessageId={isStreaming ? 'temp-ai' : null}
          className="flex-1"
        />

        <Composer
          onSend={handleSend}
          disabled={shiftToneMutation.isPending || isStreaming}
        />
      </div>
    </div>
  );
}

export default withAuthenticationRequired(DashboardPage);