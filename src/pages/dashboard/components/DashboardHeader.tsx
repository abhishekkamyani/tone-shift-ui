import { type ReactNode } from 'react';
import { Menu, Sparkles, Mail, MessageCircle, Linkedin, Ticket, Hash, Twitter } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AiTone, AiFormat } from '@/lib/mockAi';

const TONE_LABELS: Record<AiTone, { emoji: string; label: string }> = {
  Professional: { emoji: '💼', label: 'Professional' },
  Casual:       { emoji: '😊', label: 'Casual' },
  Creative:     { emoji: '🎨', label: 'Creative' },
  Concise:      { emoji: '⚡', label: 'Concise' },
  Empathetic:   { emoji: '💙', label: 'Empathetic' },
};

const FORMAT_ICONS: Record<AiFormat, ReactNode> = {
  Email:           <Mail size={11} />,
  WhatsApp:        <MessageCircle size={11} />,
  'LinkedIn Post': <Linkedin size={11} />,
  'Jira Ticket':   <Ticket size={11} />,
  'Slack Message': <Hash size={11} />,
  Tweet:           <Twitter size={11} />,
};

interface DashboardHeaderProps {
  onMenuToggle: () => void;
  activeTone: AiTone;
  activeFormat: AiFormat;
  chatTitle: string;
}

export function DashboardHeader({ onMenuToggle, activeTone, activeFormat, chatTitle }: DashboardHeaderProps) {
  const tone = TONE_LABELS[activeTone];

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-background-surface flex-shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 rounded-lg hover:bg-background-elevated text-text-muted cursor-pointer"
          aria-label="Toggle sidebar"
        >
          <Menu size={18} />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 flex items-center justify-center rounded-md bg-gradient-to-br from-primary-500 to-secondary-500 md:hidden">
            <Sparkles size={12} className="text-white" />
          </div>
          <h1 className={cn('text-sm font-semibold text-text-primary truncate max-w-[200px] sm:max-w-xs')}>
            {chatTitle}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Tone badge */}
        <span className={cn(
          'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
          'bg-primary-500/10 text-primary-600 dark:text-primary-300 border border-primary-300/30'
        )}>
          <span>{tone.emoji}</span>
          <span className="hidden sm:inline">{tone.label}</span>
        </span>

        {/* Format badge */}
        <span className={cn(
          'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
          'bg-secondary-500/10 text-secondary-600 dark:text-secondary-300 border border-secondary-300/30'
        )}>
          <span className="w-3 h-3 flex items-center justify-center">{FORMAT_ICONS[activeFormat]}</span>
          <span className="hidden sm:inline">{activeFormat}</span>
        </span>
      </div>
    </header>
  );
}
