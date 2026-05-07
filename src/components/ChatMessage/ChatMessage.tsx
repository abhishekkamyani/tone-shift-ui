import { formatTimestamp } from '@/lib/utils';
import { CopyButton } from './CopyButton';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // <-- NEW
import remarkBreaks from 'remark-breaks'; // <-- NEW

export interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  chatId?: string;
}

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
}

export function ChatMessage({ message, isStreaming = false }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex items-start gap-3 animate-fade-in', isUser ? 'flex-row-reverse' : 'flex-row')}>
      {/* Avatar */}
      <div className={cn('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold',
          isUser ? 'bg-gradient-to-br from-secondary-500 to-primary-600 text-white' : 'bg-gradient-to-br from-primary-500 to-secondary-500 text-white'
        )}>
        {isUser ? 'U' : 'AI'}
      </div>

      {/* Bubble */}
      <div className={cn('flex flex-col gap-1 max-w-[75%]', isUser ? 'items-end' : 'items-start')}>
        <div className={cn('px-4 py-3 rounded-2xl text-sm leading-relaxed',
            isUser ? 'bg-gradient-to-br from-primary-600 to-secondary-600 text-white rounded-tr-sm' : 'bg-background-surface border border-border text-text-primary rounded-tl-sm'
          )}>
          
          {isUser ? (
            <div className="whitespace-pre-wrap">{message.content}</div>
          ) : (
            // THE FIX: Added remarkPlugins to handle LLM line-breaks perfectly
            <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:p-0 prose-headings:font-bold prose-headings:mt-4 prose-headings:mb-2 prose-ul:my-2 prose-li:my-0">
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}

          {/* {isStreaming && (
            <span className="inline-block w-0.5 h-4 bg-primary-400 ml-0.5 animate-pulse align-middle" />
          )} */}
        </div>

        {/* Footer */}
        <div className={cn('flex items-center gap-1', isUser ? 'flex-row-reverse' : 'flex-row')}>
          <span className="text-xs text-text-muted px-1">
            {formatTimestamp(message.timestamp)}
          </span>
          {!isUser && !isStreaming && <CopyButton text={message.content} />}
        </div>
      </div>
    </div>
  );
}