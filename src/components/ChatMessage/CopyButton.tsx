import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface CopyButtonProps {
  text: string;
  className?: string;
}

export function CopyButton({ text, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <button
      onClick={handleCopy}
      aria-label="Copy message"
      className={cn(
        'p-1.5 rounded-md transition-all duration-150 cursor-pointer',
        'text-text-muted hover:text-text-secondary hover:bg-background-elevated',
        className
      )}
    >
      <span className="w-4 h-4 flex items-center justify-center">
        {copied ? (
          <Check size={13} className="text-success-500" />
        ) : (
          <Copy size={13} />
        )}
      </span>
    </button>
  );
}
