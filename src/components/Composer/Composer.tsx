import { Send } from 'lucide-react';
import { useRef, useState, type KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';
import { ComposerSelect } from './ComposerSelect';
import { FormatSelect } from './FormatSelect';
import { VoiceButton } from './VoiceButton';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import type { AiTone, AiFormat } from '@/lib/mockAi';

interface ComposerProps {
  onSend: (text: string, tone: AiTone, format: AiFormat) => void;
  disabled?: boolean;
}

export function Composer({ onSend, disabled = false }: ComposerProps) {
  const [text, setText] = useState('');
  const [tone, setTone] = useState<AiTone>('Professional');
  const [format, setFormat] = useState<AiFormat>('Email');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isRecording, recordingTime, startRecording, stopRecording, error } = useAudioRecorder();

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed, tone, format);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  const handleVoiceStop = async () => {
    const transcript = await stopRecording();
    if (transcript) {
      onSend(transcript, tone, format);
    }
  };

  return (
    <div className="border-t border-border bg-background-surface px-4 py-3">
      {error && (
        <div className="mb-2 text-xs text-danger-500 bg-danger-50 dark:bg-danger-900/20 px-3 py-1.5 rounded-lg">
          {error}
        </div>
      )}

      <div
        className={cn(
          'flex flex-col gap-2 rounded-xl border transition-all duration-200',
          'bg-background border-border',
          disabled ? 'opacity-60' : 'focus-within:border-primary-400'
        )}
      >
        {/* Text area */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          disabled={disabled || isRecording}
          placeholder={
            isRecording
              ? 'Recording… press stop when done'
              : 'Message ToneShift… (Enter to send, Shift+Enter for newline)'
          }
          rows={1}
          className={cn(
            'w-full resize-none bg-transparent px-4 pt-3 pb-1 text-sm text-text-primary',
            'placeholder:text-text-muted outline-none leading-relaxed',
            'min-h-[44px] max-h-[160px]'
          )}
        />

        {/* Toolbar — two dropdowns + voice + send */}
        <div className="flex items-center justify-between px-3 pb-2 gap-2 flex-wrap">
          {/* Left: Tone + Format dropdowns side by side */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Tone Selector */}
            <ComposerSelect value={tone} onChange={setTone} />

            {/* Divider */}
            <span className="w-px h-4 bg-border flex-shrink-0" />

            {/* Format Selector */}
            <FormatSelect value={format} onChange={setFormat} />
          </div>

          {/* Right: Voice + Send */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <VoiceButton
              isRecording={isRecording}
              recordingTime={recordingTime}
              onStart={startRecording}
              onStop={handleVoiceStop}
              disabled={disabled}
            />

            <button
              type="button"
              onClick={handleSend}
              disabled={!text.trim() || disabled || isRecording}
              aria-label="Send message"
              className={cn(
                'w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150 cursor-pointer whitespace-nowrap',
                text.trim() && !disabled && !isRecording
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-background-elevated text-text-muted cursor-not-allowed'
              )}
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-text-muted mt-2">
        ToneShift can make mistakes. Consider checking important information.
      </p>
    </div>
  );
}
