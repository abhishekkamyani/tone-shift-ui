import { ChevronDown, Mail, MessageCircle, Linkedin, Ticket, Hash, Twitter } from 'lucide-react';
import { useState, useRef, useEffect, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { AiFormat } from '@/lib/mockAi';

interface FormatOption {
  value: AiFormat;
  label: string;
  description: string;
  icon: ReactNode;
}

const FORMAT_OPTIONS: FormatOption[] = [
  {
    value: 'Email',
    label: 'Email',
    description: 'Formal email message',
    icon: <Mail size={14} />,
  },
  {
    value: 'WhatsApp',
    label: 'WhatsApp',
    description: 'Casual chat message',
    icon: <MessageCircle size={14} />,
  },
  {
    value: 'LinkedIn Post',
    label: 'LinkedIn Post',
    description: 'Professional network post',
    icon: <Linkedin size={14} />,
  },
  {
    value: 'Jira Ticket',
    label: 'Jira Ticket',
    description: 'Issue tracker ticket',
    icon: <Ticket size={14} />,
  },
  {
    value: 'Slack Message',
    label: 'Slack Message',
    description: 'Team channel message',
    icon: <Hash size={14} />,
  },
  {
    value: 'Tweet',
    label: 'Tweet / X Post',
    description: 'Short social post',
    icon: <Twitter size={14} />,
  },
];

interface FormatSelectProps {
  value: AiFormat;
  onChange: (format: AiFormat) => void;
}

export function FormatSelect({ value, onChange }: FormatSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = FORMAT_OPTIONS.find(f => f.value === value) ?? FORMAT_OPTIONS[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium',
          'border border-border bg-background-elevated text-text-secondary',
          'hover:border-secondary-400 hover:text-text-primary transition-all duration-150 cursor-pointer whitespace-nowrap'
        )}
      >
        <span className="w-3.5 h-3.5 flex items-center justify-center text-secondary-500">
          {selected.icon}
        </span>
        <span>{selected.label}</span>
        <span className="w-3 h-3 flex items-center justify-center">
          <ChevronDown size={12} className={cn('transition-transform', open && 'rotate-180')} />
        </span>
      </button>

      {open && (
        <div
          className={cn(
            'absolute bottom-full mb-2 left-0 z-50 w-56',
            'bg-background-surface border border-border rounded-xl overflow-hidden',
            'animate-slide-up'
          )}
        >
          {FORMAT_OPTIONS.map(fmt => (
            <button
              key={fmt.value}
              type="button"
              onClick={() => { onChange(fmt.value); setOpen(false); }}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors cursor-pointer',
                'hover:bg-background-elevated',
                fmt.value === value && 'bg-secondary-500/10 text-secondary-500'
              )}
            >
              <span
                className={cn(
                  'w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0',
                  fmt.value === value
                    ? 'bg-secondary-500/20 text-secondary-500'
                    : 'bg-background-elevated text-text-muted'
                )}
              >
                {fmt.icon}
              </span>
              <div className="min-w-0">
                <div className="text-sm font-medium text-text-primary">{fmt.label}</div>
                <div className="text-xs text-text-muted">{fmt.description}</div>
              </div>
              {fmt.value === value && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-secondary-500 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
