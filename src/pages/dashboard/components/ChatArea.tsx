import { useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { ChatMessage, type Message } from '@/components/ChatMessage/ChatMessage';
import { TypingIndicator } from '@/components/ChatMessage/TypingIndicator';
import { cn } from '@/lib/utils';

interface ChatAreaProps {
  messages: Message[];
  isTyping: boolean;
  streamingMessageId: string | null;
  className?: string;
}

const WELCOME_PROMPTS = [
  'Write a professional email to my team',
  'Explain quantum computing casually',
  'Brainstorm creative startup ideas',
  'Summarize this text concisely',
];

export function ChatArea({ messages, isTyping, streamingMessageId, className }: ChatAreaProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const isEmpty = messages.length === 0;

  return (
    <div className={cn('flex-1 overflow-y-auto', className)}>
      {isEmpty ? (
        <div className="h-full flex flex-col items-center justify-center px-6 py-12 gap-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500">
              <Sparkles size={32} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary mb-2">How can I help you today?</h2>
              <p className="text-sm text-text-secondary max-w-sm">
                Choose a tone from the composer below and start a conversation. I adapt to your needs.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 w-full max-w-lg">
            {WELCOME_PROMPTS.map(prompt => (
              <div
                key={prompt}
                className={cn(
                  'px-4 py-3 rounded-xl border border-border bg-background-surface',
                  'text-sm text-text-secondary text-left cursor-default',
                  'hover:border-primary-300/50 hover:text-text-primary transition-colors'
                )}
              >
                {prompt}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="px-4 py-6 space-y-6 max-w-3xl mx-auto w-full">
          {messages.map(msg => (
            <ChatMessage
              key={msg.id}
              message={msg}
              isStreaming={msg.id === streamingMessageId}
            />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
