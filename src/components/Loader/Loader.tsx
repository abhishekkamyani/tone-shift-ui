import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoaderProps {
  label?: string;
  fullScreen?: boolean;
}

export const Loader = ({ label = "Loading...", fullScreen = true }: LoaderProps) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center gap-4 bg-background",
      fullScreen ? "h-screen w-full" : "h-64 w-full"
    )}>
      <div className="relative">
        {/* Outer Glow Effect */}
        <div className="absolute inset-0 bg-primary-500/20 blur-xl rounded-full animate-pulse" />
        
        {/* Scaling Sparkle Icon */}
        <div className="relative w-16 h-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 shadow-xl shadow-primary-500/20 animate-bounce-subtle">
          <Sparkles size={32} className="text-white animate-pulse" />
        </div>
      </div>

      {/* Loading Text */}
      <p className="text-sm font-medium text-text-muted animate-pulse tracking-wide">
        {label}
      </p>

    </div>
  );
};