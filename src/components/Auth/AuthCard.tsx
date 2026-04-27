import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuthCardProps {
  onLogin: () => void;
  loading?: boolean;
}

export function AuthCard({ onLogin, loading = false }: AuthCardProps) {
  return (
    <div className={cn(
      'w-full max-w-sm mx-auto',
      'bg-background-surface border border-border rounded-2xl p-8',
      'flex flex-col items-center gap-6'
    )}>
      {/* Logo */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500">
          <Sparkles size={28} className="text-white" />
        </div>
        <div className="text-center">
          <h1 className="text-xl font-bold text-text-primary">ToneShift</h1>
          <p className="text-sm text-text-muted mt-1">AI-powered conversations</p>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-border" />

      {/* CTA */}
      <div className="w-full flex flex-col gap-3">
        <button
          onClick={onLogin}
          disabled={loading}
          className={cn(
            'w-full py-3 px-6 rounded-xl text-sm font-semibold',
            'bg-gradient-to-r from-primary-600 to-secondary-600 text-white',
            'hover:from-primary-700 hover:to-secondary-700',
            'transition-all duration-200 cursor-pointer whitespace-nowrap',
            loading && 'opacity-70 cursor-not-allowed'
          )}
        >
          {loading ? 'Redirecting…' : 'Log In / Sign Up'}
        </button>
        <p className="text-center text-xs text-text-muted">
          Secure authentication powered by Auth0
        </p>
      </div>
    </div>
  );
}
