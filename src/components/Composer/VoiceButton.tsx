import { Mic, MicOff, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceButtonProps {
  isRecording: boolean;
  recordingTime: string;
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
}

export function VoiceButton({
  isRecording,
  recordingTime,
  onStart,
  onStop,
  disabled = false,
}: VoiceButtonProps) {
  return (
    <button
      type="button"
      onClick={isRecording ? onStop : onStart}
      disabled={disabled}
      aria-label={isRecording ? 'Stop recording' : 'Start voice recording'}
      className={cn(
        'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap',
        isRecording
          ? 'bg-danger-500 text-white animate-recording-ring'
          : 'bg-background-elevated border border-border text-text-secondary hover:border-primary-400 hover:text-primary-500',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <span className="w-4 h-4 flex items-center justify-center">
        {isRecording ? <Square size={14} /> : <Mic size={14} />}
      </span>
      {isRecording && (
        <span className="text-xs font-mono">{recordingTime}</span>
      )}
      {!isRecording && (
        <span className="hidden sm:inline text-xs">Voice</span>
      )}
    </button>
  );
}
