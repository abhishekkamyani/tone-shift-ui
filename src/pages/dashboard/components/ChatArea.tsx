import { useEffect, useRef } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
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
  "I won't be able to make it to the meeting today because my car is having some issues.",
  "I have finished the report you asked for and I am sending it to your email right now.",
  "You did this part of the project wrong and it is causing a lot of problems for the team.",
  "I am just writing to say that I think it might be a good idea if we try to change our current plan."
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
          {/* Branding Section */}
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 shadow-xl shadow-primary-500/20">
              <Sparkles size={32} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-2 tracking-tight">Ready to shift your tone?</h2>
              <p className="text-sm text-text-secondary max-w-sm leading-relaxed">
                Paste your text below and choose a tone. Not sure where to start? Try one of these:
              </p>
            </div>
          </div>

          {/* Responsive Prompt Grid */}
          <div className="grid sm:grid-cols-2 gap-3 w-full max-w-2xl">
            {WELCOME_PROMPTS.map(prompt => (
              <button
                key={prompt}
                onClick={() => {/* Function to set your input state to this prompt */ }}
                className={cn(
                  'px-5 py-4 rounded-2xl border border-border bg-background-surface',
                  'text-sm text-text-secondary text-left transition-all duration-200',
                  'hover:border-primary-500/40 hover:bg-primary-500/5 hover:text-text-primary',
                  'active:scale-95 cursor-pointer flex items-center justify-between group'
                )}
              >
                {prompt}
                <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-primary-500" />
              </button>
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
