import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
  compact?: boolean;
}

export function ThemeToggle({ className, compact = false }: ThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'relative flex items-center gap-2 rounded-lg transition-all duration-200',
        'text-text-secondary hover:text-text-primary',
        compact
          ? 'p-2 hover:bg-background-elevated'
          : 'px-3 py-2 hover:bg-background-elevated text-sm font-medium',
        className
      )}
    >
      <span className="w-5 h-5 flex items-center justify-center">
        {isDark ? (
          <Sun size={16} className="text-warning-400" />
        ) : (
          <Moon size={16} className="text-primary-500" />
        )}
      </span>
      {!compact && (
        <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
      )}
    </button>
  );
}
