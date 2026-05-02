import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query'; 
import { shiftTextTone } from '@/lib/aiApis'; 
import { Sidebar, type ChatSession } from '@/components/Sidebar/Sidebar';
import { Composer } from '@/components/Composer/Composer';
import { ChatArea } from './components/ChatArea';
import { DashboardHeader } from './components/DashboardHeader';
import { type AiTone, type AiFormat } from '@/lib/mockAi'; 
import { generateId } from '@/lib/utils';
import { useMobile } from '@/hooks/useMobile';
import type { Message } from '@/components/ChatMessage/ChatMessage';
import { useAuthSync } from '@/hooks/useAuthSync';
import { withAuthenticationRequired } from '@auth0/auth0-react';

interface ConversationState {
  id: string;
  title: string;
  messages: Message[];
}

const INITIAL_SESSION_ID = generateId();

function DashboardPage() {
  const isMobile = useMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const { dbUser } = useAuthSync();

  const [conversations, setConversations] = useState<ConversationState[]>([
    { id: INITIAL_SESSION_ID, title: 'New Chat', messages: [] },
  ]);
  const [activeConvId, setActiveConvId] = useState<string>(INITIAL_SESSION_ID);

  // We can remove isTyping state because React Query handles 'isPending' for us!
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [activeTone, setActiveTone] = useState<AiTone>('Professional');
  const [activeFormat, setActiveFormat] = useState<AiFormat>('Email');

  const activeConv = conversations.find(c => c.id === activeConvId) ?? conversations[0];

  const updateConversation = useCallback((id: string, updater: (prev: ConversationState) => ConversationState) => {
    setConversations(prev => prev.map(c => c.id === id ? updater(c) : c));
  }, []);

  // --- REACT QUERY MUTATION ---
  const shiftToneMutation = useMutation({
    mutationFn: shiftTextTone,
    onError: (error) => {
      console.error(error);
      setStreamingMessageId(null);
      toast.error('Failed to get a response from the server. Please try again.');
    }
  });

  const handleSend = useCallback(async (text: string, tone: AiTone, format: AiFormat) => {
    setActiveTone(tone);
    setActiveFormat(format);

    const userMsg: Message = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    // 1. Append ONLY the user message. 
    // React Query's 'isPending' will automatically show the '...' typing indicator.
    updateConversation(activeConvId, conv => ({
      ...conv,
      title: conv.messages.length === 0 ? text.slice(0, 40) + (text.length > 40 ? '…' : '') : conv.title,
      messages: [...conv.messages, userMsg],
    }));

    // 2. Call the backend API
    shiftToneMutation.mutate(
      { originalText: text, targetTone: tone, format },
      {
        onSuccess: async (data) => {
          const aiMsgId = generateId();

          // 3. The API responded! Now we inject the AI message bubble to start streaming
          updateConversation(activeConvId, conv => ({
            ...conv,
            messages: [...conv.messages, { id: aiMsgId, role: 'ai', content: '', timestamp: new Date() }],
          }));

          // 4. Simulate streaming the response for that premium UI feel
          const words = data.shiftedText.split(' ');
          let currentText = '';

          for (let i = 0; i < words.length; i++) {
            // Ensure we don't add a trailing space on the very last word
            currentText += words[i] + (i === words.length - 1 ? '' : ' ');

            setConversations(prev =>
              prev.map(c =>
                c.id === activeConvId
                  ? {
                    ...c,
                    messages: c.messages.map(m =>
                      m.id === aiMsgId ? { ...m, content: currentText } : m
                    ),
                  }
                  : c
              )
            );
            await new Promise(resolve => setTimeout(resolve, 1));
          }
        }
      }
    );
  }, [activeConvId, updateConversation, shiftToneMutation]);

  const handleNewChat = useCallback(() => {
    const newId = generateId();
    setConversations(prev => [
      { id: newId, title: 'New Chat', messages: [] },
      ...prev,
    ]);
    setActiveConvId(newId);
    if (isMobile) setSidebarOpen(false);
  }, [isMobile]);

  const handleLogout = () => {
    toast.success('Logged out successfully');
  };

  const sessions: ChatSession[] = conversations.map(c => ({
    id: c.id,
    title: c.title,
    preview: c.messages.length > 0
      ? c.messages[c.messages.length - 1].content.slice(0, 50) + '…'
      : 'No messages yet',
    timestamp: c.messages.length > 0
      ? c.messages[c.messages.length - 1].timestamp
      : new Date(),
    active: c.id === activeConvId,
  }));

  if (!dbUser) return <div>Loading your profile...</div>;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        sessions={sessions}
        activeSessionId={activeConvId}
        onNewChat={handleNewChat}
        onSelectSession={setActiveConvId}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userEmail="user@example.com"
      />

      <div className="flex-1 flex flex-col min-w-0 h-full">
        <DashboardHeader
          onMenuToggle={() => setSidebarOpen(prev => !prev)}
          activeTone={activeTone}
          activeFormat={activeFormat}
          chatTitle={activeConv?.title ?? 'New Chat'}
        />

        <ChatArea
          messages={activeConv?.messages ?? []}
          isTyping={shiftToneMutation.isPending} // Using React Query's built-in state!
          streamingMessageId={streamingMessageId}
          className="flex-1"
        />

        <Composer
          onSend={handleSend}
          disabled={shiftToneMutation.isPending || streamingMessageId !== null}
        />
      </div>
    </div>
  );
}

export default withAuthenticationRequired(DashboardPage);