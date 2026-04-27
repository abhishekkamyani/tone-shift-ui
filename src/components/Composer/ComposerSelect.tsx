import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { AiTone } from '@/lib/mockAi';

const TONES: { value: AiTone; label: string; description: string; emoji: string }[] = [
  { value: 'Professional', label: 'Professional', description: 'Formal & precise', emoji: '💼' },
  { value: 'Casual',       label: 'Casual',       description: 'Relaxed & friendly', emoji: '😊' },
  { value: 'Creative',     label: 'Creative',     description: 'Imaginative & vivid', emoji: '🎨' },
  { value: 'Concise',      label: 'Concise',      description: 'Short & to the point', emoji: '⚡' },
  { value: 'Empathetic',   label: 'Empathetic',   description: 'Warm & understanding', emoji: '💙' },
];

interface ComposerSelectProps {
  value: AiTone;
  onChange: (tone: AiTone) => void;
}

export function ComposerSelect({ value, onChange }: ComposerSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = TONES.find(t => t.value === value) ?? TONES[0];

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
          'hover:border-primary-400 hover:text-text-primary transition-all duration-150 cursor-pointer whitespace-nowrap'
        )}
      >
        <span>{selected.emoji}</span>
        <span>{selected.label}</span>
        <span className="w-3 h-3 flex items-center justify-center">
          <ChevronDown size={12} className={cn('transition-transform', open && 'rotate-180')} />
        </span>
      </button>

      {open && (
        <div className={cn(
          'absolute bottom-full mb-2 left-0 z-50 w-52',
          'bg-background-surface border border-border rounded-xl overflow-hidden',
          'animate-slide-up'
        )}>
          {TONES.map(tone => (
            <button
              key={tone.value}
              type="button"
              onClick={() => { onChange(tone.value); setOpen(false); }}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors cursor-pointer',
                'hover:bg-background-elevated',
                tone.value === value && 'bg-primary-500/10 text-primary-500'
              )}
            >
              <span className="text-base">{tone.emoji}</span>
              <div>
                <div className="text-sm font-medium text-text-primary">{tone.label}</div>
                <div className="text-xs text-text-muted">{tone.description}</div>
              </div>
              {tone.value === value && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
