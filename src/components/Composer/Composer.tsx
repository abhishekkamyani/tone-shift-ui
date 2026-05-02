import { Send } from 'lucide-react';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';
import { ComposerSelect } from './ComposerSelect';
import { FormatSelect } from './FormatSelect';
import { VoiceButton } from './VoiceButton';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import type { AiTone, AiFormat } from '@/lib/mockAi';
import { useMutation } from '@tanstack/react-query';
import { transcribeVoiceNote } from '@/lib/aiApis';
import { toast } from 'sonner';

interface ComposerProps {
  onSend: (text: string, tone: AiTone, format: AiFormat) => void;
  disabled?: boolean;
}

// Helper function to convert Blob to Base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // We only want the raw Base64 data, so we strip the data:audio prefix
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export function Composer({ onSend, disabled = false }: ComposerProps) {
  const [text, setText] = useState('');
  const [tone, setTone] = useState<AiTone>('Professional');
  const [format, setFormat] = useState<AiFormat>('Email');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // const { isRecording, recordingTime, startRecording, stopRecording, error } = useAudioRecorder();
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // --- Timer Logic for VoiceButton ---
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // --- TanStack Mutation for Transcription ---
  const transcribeMutation = useMutation({
    mutationFn: transcribeVoiceNote,
    onSuccess: (data) => {
      setText((prev) => (prev ? `${prev} ${data.text}` : data.text));
      toast.success('Voice note transcribed!');
    },
    onError: () => {
      toast.error('Failed to transcribe audio.');
    }
  });
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

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });
        const base64Audio = await blobToBase64(audioBlob);

        transcribeMutation.mutate({
          audioBase64: base64Audio,
          mimeType: audioBlob.type
        });

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone error:', err);
      toast.error('Microphone access denied or unavailable.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };


  const isTranscribing = transcribeMutation.isPending;

  return (
    <div className="border-t border-border bg-background-surface px-4 py-3">
      {/* {error && (
        <div className="mb-2 text-xs text-danger-500 bg-danger-50 dark:bg-danger-900/20 px-3 py-1.5 rounded-lg">
          {error}
        </div>
      )} */}

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
              recordingTime={formatTime(recordingSeconds)}
              onStart={handleStartRecording}
              onStop={handleStopRecording}
              disabled={disabled || isTranscribing}
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
