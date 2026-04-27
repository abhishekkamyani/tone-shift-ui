import { ArrowRight, Sparkles, Zap, Mic, Palette, Shield } from 'lucide-react';
import { useState } from 'react';
import { AuthCard } from '@/components/Auth/AuthCard';
import { ThemeToggle } from '@/components/ThemeToggle/ThemeToggle';
import { cn } from '@/lib/utils';
import { useAuth0 } from '@auth0/auth0-react';

const FEATURES = [
  {
    icon: Zap,
    title: 'Multiple AI Tones',
    description: 'Switch between Professional, Casual, Creative, Concise, and Empathetic modes instantly.',
    color: 'text-warning-500',
    bg: 'bg-warning-500/10',
  },
  {
    icon: Mic,
    title: 'Voice Input',
    description: 'Speak your thoughts and let ToneShift transcribe and respond in your chosen tone.',
    color: 'text-success-500',
    bg: 'bg-success-500/10',
  },
  {
    icon: Palette,
    title: 'Beautiful Themes',
    description: 'Seamlessly switch between light and dark mode for a comfortable experience.',
    color: 'text-primary-500',
    bg: 'bg-primary-500/10',
  },
  {
    icon: Shield,
    title: 'Secure Auth',
    description: 'Enterprise-grade authentication powered by Auth0 keeps your data safe.',
    color: 'text-secondary-500',
    bg: 'bg-secondary-500/10',
  },
];

const TONES = [
  { label: 'Professional', emoji: '💼', color: 'border-secondary-400 text-secondary-600 dark:text-secondary-300' },
  { label: 'Casual', emoji: '😊', color: 'border-success-400 text-success-600 dark:text-success-300' },
  { label: 'Creative', emoji: '🎨', color: 'border-warning-400 text-warning-600 dark:text-warning-300' },
  { label: 'Concise', emoji: '⚡', color: 'border-primary-400 text-primary-600 dark:text-primary-300' },
  { label: 'Empathetic', emoji: '💙', color: 'border-danger-400 text-danger-600 dark:text-danger-300' },
];

export default function LandingPage() {
  const [loginLoading, setLoginLoading] = useState(false);
  const { loginWithRedirect, isLoading } = useAuth0();

  const handleLogin = () => {
    loginWithRedirect({
      appState: { returnTo: '/dashboard' }
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="font-bold text-text-primary text-lg">ToneShift</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle compact />
            <button
              onClick={handleLogin}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex-1 flex items-center justify-center pt-24 pb-16 px-6 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary-500/10 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-secondary-500/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary-400/5 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: copy */}
          <div className="flex flex-col gap-6 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary-300/40 bg-primary-500/10 text-primary-600 dark:text-primary-300 text-xs font-medium w-fit">
              <Sparkles size={12} />
              <span>AI-Powered Chat Interface</span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold text-text-primary leading-tight">
              Chat in any{' '}
              <span className="text-gradient">tone</span>
              {' '}you need
            </h1>

            <p className="text-lg text-text-secondary leading-relaxed max-w-lg">
              ToneShift adapts your AI conversations to match the moment — professional reports,
              casual chats, creative brainstorms, or empathetic support. All in one place.
            </p>

            {/* Tone pills */}
            <div className="flex flex-wrap gap-2">
              {TONES.map(tone => (
                <span
                  key={tone.label}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium',
                    tone.color
                  )}
                >
                  <span>{tone.emoji}</span>
                  <span>{tone.label}</span>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <button
                onClick={handleLogin}
                disabled={loginLoading}
                className={cn(
                  'flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold',
                  'bg-gradient-to-r from-primary-600 to-secondary-600 text-white',
                  'hover:from-primary-700 hover:to-secondary-700',
                  'transition-all duration-200 cursor-pointer whitespace-nowrap',
                  loginLoading && 'opacity-70 cursor-not-allowed'
                )}
              >
                {loginLoading ? 'Redirecting…' : 'Start for Free'}
                {!loginLoading && <ArrowRight size={16} />}
              </button>
              <span className="text-xs text-text-muted">No credit card required</span>
            </div>
          </div>

          {/* Right: Auth card */}
          <div className="flex justify-center lg:justify-end animate-slide-up">
            <AuthCard onLogin={handleLogin} loading={loginLoading} />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-background-surface border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary mb-3">
              Everything you need to communicate better
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto">
              Powerful features designed to make every conversation more effective and natural.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(feature => (
              <div
                key={feature.title}
                className="flex flex-col gap-4 p-6 rounded-2xl border border-border bg-background hover:border-primary-300/50 transition-colors duration-200"
              >
                <div className={cn('w-10 h-10 flex items-center justify-center rounded-xl', feature.bg)}>
                  <feature.icon size={20} className={feature.color} />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary text-sm mb-1">{feature.title}</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="p-8 rounded-2xl bg-gradient-to-br from-primary-600 to-secondary-600 text-white">
            <Sparkles size={32} className="mx-auto mb-4 opacity-80" />
            <h2 className="text-2xl font-bold mb-3">Ready to shift your tone?</h2>
            <p className="text-white/80 text-sm mb-6">
              Join thousands of users who communicate smarter with ToneShift.
            </p>
            <button
              onClick={handleLogin}
              className="px-8 py-3 rounded-xl bg-white text-primary-700 font-semibold text-sm hover:bg-white/90 transition-colors cursor-pointer whitespace-nowrap"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background-elevated py-6 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 flex items-center justify-center rounded-md bg-gradient-to-br from-primary-500 to-secondary-500">
              <Sparkles size={10} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-text-primary">ToneShift</span>
          </div>
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} ToneShift. Built with AI.
          </p>
        </div>
      </footer>
    </div>
  );
}
