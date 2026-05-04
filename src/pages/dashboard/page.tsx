import { useState, useCallback, useMemo, useEffect } from 'react';
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
import { useParams, useNavigate } from 'react-router-dom'; // <-- NEW IMPORTS

function DashboardPage() {
  const isMobile = useMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const { dbUser } = useAuthSync();
  const queryClient = useQueryClient();

  // --- URL ROUTING REPLACES useState ---
  const { chatId } = useParams();
  const navigate = useNavigate();
  const activeChatId = chatId || null; // If undefined, it's null (New Chat mode)

  // --- 1. CORE STATE ---
  const [activeTone, setActiveTone] = useState<AiTone>('Professional');
  const [activeFormat, setActiveFormat] = useState<AiFormat>('Email');
  const [interactionId, setInteractionId] = useState<string>('');

  // --- 2. OPTIMISTIC/STREAMING STATE ---
  const [optimisticUserMsg, setOptimisticUserMsg] = useState<Message | null>(null);
  const [streamedAiContent, setStreamedAiContent] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);

  // --- 3. QUERIES ---
  const { data: chats = [], isSuccess: chatsLoaded, isRefetching: isRefetchingNewChats } = useQuery({
    queryKey: ['chats'],
    queryFn: chatApi.getChats,
    enabled: !!dbUser,
  });

  // --- SECURITY GUARD ---
  // If the user tries to load a URL for a chat they don't own, kick them out to a New Chat.
  useEffect(() => {
    if (activeChatId && chatsLoaded  && !isRefetchingNewChats) {
      const userOwnsChat = chats.some(c => c._id === activeChatId);
      if (!userOwnsChat) {
        toast.error("Chat not found or access denied.");
        navigate('/dashboard', { replace: true });
      }
    }
  }, [activeChatId, chats, chatsLoaded, navigate]);

  const shiftToneMutation = useMutation({
    mutationFn: shiftTextTone,
  });

  const { data: dbMessages = [] } = useQuery({
    queryKey: ['messages', activeChatId],
    queryFn: () => chatApi.getMessages(activeChatId!),
    // 🚨 Pause fetching while streaming, and keep the cache staleTime to Infinity!
    enabled: !!activeChatId && !!dbUser && !shiftToneMutation.isPending && !isStreaming,
    staleTime: Infinity,
  });


  // --- 5. EVENT HANDLERS ---
  const handleSelectChat = useCallback((id: string) => {
    navigate(`/dashboard/${id}`); // <-- Navigate to the chat URL
    if (isMobile) setSidebarOpen(false);
  }, [navigate, isMobile]);

  const handleNewChat = useCallback(() => {
    navigate('/dashboard'); // <-- Navigate to base URL for new chat
    if (isMobile) setSidebarOpen(false);
  }, [navigate, isMobile]);

  const handleSend = useCallback((text: string, tone: AiTone, format: AiFormat) => {
    if (!text.trim()) return;

    setActiveTone(tone);
    setActiveFormat(format);

    // 1. Generate consistent ID for this interaction
    const newInteractionId = Date.now().toString();
    setInteractionId(newInteractionId);

    const tempUserMsg: Message = {
      id: `temp-user-${newInteractionId}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
      chatId: activeChatId || undefined,
    };

    setOptimisticUserMsg(tempUserMsg);
    setStreamedAiContent('');
    setIsStreaming(true);

    shiftToneMutation.mutate(
      { originalText: text, targetTone: tone, format, chatId: activeChatId || undefined },
      {
        onSuccess: async (data) => {
          const currentChatId = data.chatId || activeChatId;

          // 2. If new chat, update URL silently so back button works!
          if (!activeChatId && currentChatId) {
            navigate(`/dashboard/${currentChatId}`, { replace: true });
          }

          // 3. Instantly update the sidebar list
          queryClient.invalidateQueries({ queryKey: ['chats'] });

          // 4. Simulate the typewriter streaming effect
          const words = data.shiftedText.split(' ');
          let currentText = '';

          for (let i = 0; i < words.length; i++) {
            currentText += words[i] + (i === words.length - 1 ? '' : ' ');
            setStreamedAiContent(currentText);
            await new Promise(resolve => setTimeout(resolve, 30));
          }

          // 5. Streaming done! Inject perfectly matched IDs into the cache
          queryClient.setQueryData(['messages', currentChatId], (old: any) => {
            const previousMessages = old || [];
            return [
              ...previousMessages,
              {
                _id: `temp-user-${newInteractionId}`, // Exact match!
                chatId: currentChatId,
                role: 'user',
                content: text,
                createdAt: new Date().toISOString()
              },
              {
                _id: `temp-ai-${newInteractionId}`,   // Exact match!
                chatId: currentChatId,
                role: 'ai',
                content: data.shiftedText,
                createdAt: new Date().toISOString()
              }
            ];
          });

          // 6. Safely clear temp states. No invalidation = No flicker!
          setOptimisticUserMsg(null);
          setStreamedAiContent('');
          setIsStreaming(false);
        },
        onError: (error) => {
          toast.error('Failed to shift tone. Please try again.');
          console.error(error);
          setOptimisticUserMsg(null);
          setIsStreaming(false);
        }
      }
    );
  }, [activeChatId, navigate, shiftToneMutation, queryClient]);


  // --- 6. DERIVED STATE FOR UI ---
  const activeChat = chats.find(c => c._id === activeChatId);

  // Combine DB messages with optimistic/streaming ones
  const displayMessages = useMemo(() => {
    const formattedDbMessages: Message[] = dbMessages.map((msg: any) => ({
      id: msg._id,
      role: msg.role,
      content: msg.content,
      timestamp: new Date(msg.createdAt),
      chatId: msg.chatId
    }));

    let current = [...formattedDbMessages];

    if (optimisticUserMsg) {
      current.push(optimisticUserMsg);
    }
    if (isStreaming && streamedAiContent) {
      current.push({
        id: `temp-ai-${interactionId}`,
        role: 'ai',
        content: streamedAiContent,
        timestamp: new Date(),
        chatId: activeChatId || undefined,
      });
    }

    return current;
  }, [dbMessages, optimisticUserMsg, isStreaming, streamedAiContent, activeChatId, interactionId]);

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
          isTyping={shiftToneMutation.isPending && !streamedAiContent}
          streamingMessageId={isStreaming ? `temp-ai-${interactionId}` : null}
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

export default withAuthenticationRequired(DashboardPage, {
  onRedirecting: () => <div className="flex h-screen items-center justify-center">Redirecting to login...</div>,
});