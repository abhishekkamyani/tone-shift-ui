import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Sidebar, type ChatSession } from '@/components/Sidebar/Sidebar';
import { Composer } from '@/components/Composer/Composer';
import { ChatArea } from './components/ChatArea';
import { DashboardHeader } from './components/DashboardHeader';
import { generateAiResponse, type AiTone, type AiFormat } from '@/lib/mockAi';
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
  const [isTyping, setIsTyping] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [activeTone, setActiveTone] = useState<AiTone>('Professional');
  const [activeFormat, setActiveFormat] = useState<AiFormat>('Email');

  const activeConv = conversations.find(c => c.id === activeConvId) ?? conversations[0];

  const updateConversation = useCallback((id: string, updater: (prev: ConversationState) => ConversationState) => {
    setConversations(prev => prev.map(c => c.id === id ? updater(c) : c));
  }, []);

  const handleSend = useCallback(async (text: string, tone: AiTone, format: AiFormat) => {
    setActiveTone(tone);
    setActiveFormat(format);

    const userMsg: Message = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    // Append user message
    updateConversation(activeConvId, conv => ({
      ...conv,
      title: conv.messages.length === 0 ? text.slice(0, 40) + (text.length > 40 ? '…' : '') : conv.title,
      messages: [...conv.messages, userMsg],
    }));

    setIsTyping(true);

    try {
      const aiMsgId = generateId();

      // Add placeholder AI message for streaming
      const placeholderMsg: Message = {
        id: aiMsgId,
        role: 'ai',
        content: '',
        timestamp: new Date(),
      };

      updateConversation(activeConvId, conv => ({
        ...conv,
        messages: [...conv.messages, userMsg, placeholderMsg],
      }));

      setIsTyping(false);
      setStreamingMessageId(aiMsgId);

      await generateAiResponse(
        text,
        tone,
        (chunk) => {
          setConversations(prev =>
            prev.map(c =>
              c.id === activeConvId
                ? {
                  ...c,
                  messages: c.messages.map(m =>
                    m.id === aiMsgId ? { ...m, content: chunk } : m
                  ),
                }
                : c
            )
          );
        },
        format
      );

      setStreamingMessageId(null);
    } catch {
      setIsTyping(false);
      setStreamingMessageId(null);
      toast.error('Failed to get a response. Please try again.');
    }
  }, [activeConvId, updateConversation]);

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
      {/* Sidebar */}
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

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <DashboardHeader
          onMenuToggle={() => setSidebarOpen(prev => !prev)}
          activeTone={activeTone}
          activeFormat={activeFormat}
          chatTitle={activeConv?.title ?? 'New Chat'}
        />

        <ChatArea
          messages={activeConv?.messages ?? []}
          isTyping={isTyping}
          streamingMessageId={streamingMessageId}
          className="flex-1"
        />

        <Composer
          onSend={handleSend}
          disabled={isTyping || streamingMessageId !== null}
        />
      </div>
    </div>
  );
}

export default withAuthenticationRequired(DashboardPage);