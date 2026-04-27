import { useCallback, useEffect, useRef, useState } from 'react';
import { formatTime } from '@/lib/utils';

interface UseAudioRecorderReturn {
  isRecording: boolean;
  recordingTime: string;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string>;
  error: string | null;
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resolveRef = useRef<((transcript: string) => void) | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearTimer();
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } catch (err) {
      setError('Microphone access denied. Please allow microphone permissions.');
      console.error('Audio recording error:', err);
    }
  }, []);

  const stopRecording = useCallback((): Promise<string> => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;

      clearTimer();
      setIsRecording(false);
      setRecordingSeconds(0);

      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== 'inactive') {
        recorder.onstop = () => {
          streamRef.current?.getTracks().forEach(t => t.stop());
          streamRef.current = null;
          mediaRecorderRef.current = null;
          // Simulate transcription after a short delay
          setTimeout(() => {
            resolve('This is a simulated voice transcription.');
          }, 600);
        };
        recorder.stop();
      } else {
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        mediaRecorderRef.current = null;
        setTimeout(() => resolve('This is a simulated voice transcription.'), 600);
      }
    });
  }, []);

  return {
    isRecording,
    recordingTime: formatTime(recordingSeconds),
    startRecording,
    stopRecording,
    error,
  };
}
