import {
  LogOut,
  MessageSquarePlus,
  MessageSquare,
  Sparkles,
  X,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle/ThemeToggle';
import { useAuth0 } from '@auth0/auth0-react';
import { useCallback } from 'react';
import { toast } from 'sonner';

export interface ChatSession {
  id: string;
  title: string;
  preview: string;
  timestamp: Date;
  active?: boolean;
}

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
}

export function Sidebar({
  sessions,
  activeSessionId,
  onNewChat,
  onSelectSession,
  isOpen,
  onClose,
  userEmail,
}: SidebarProps) {
  const { logout } = useAuth0();
  const handleLogout = useCallback(() => {
    toast.success('Logging out...');
    logout({ 
      logoutParams: { 
        returnTo: window.location.origin // Redirects back to your home/login page
      } 
    });
  }, [logout]);
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          'fixed md:relative inset-y-0 left-0 z-40 md:z-auto',
          'w-64 flex flex-col h-full',
          'bg-background-surface border-r border-border',
          'transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500">
              <Sparkles size={14} className="text-white" />
            </div>
            <span className="font-semibold text-text-primary text-sm">ToneShift</span>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg hover:bg-background-elevated text-text-muted cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* New Chat */}
        <div className="px-3 py-3">
          <button
            onClick={onNewChat}
            className={cn(
              'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium',
              'bg-primary-600 text-white hover:bg-primary-700',
              'transition-colors duration-150 cursor-pointer whitespace-nowrap'
            )}
          >
            <MessageSquarePlus size={15} />
            <span>New Chat</span>
          </button>
        </div>

        {/* Chat history */}
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-text-muted text-xs">
              No conversations yet
            </div>
          ) : (
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-text-muted px-2 py-1.5 uppercase tracking-wider">
                Recent
              </p>
              {sessions.map(session => (
                <button
                  key={session.id}
                  onClick={() => { onSelectSession(session.id); onClose(); }}
                  className={cn(
                    'w-full flex items-start gap-2.5 px-3 py-2.5 rounded-lg text-left',
                    'transition-colors duration-150 cursor-pointer group',
                    session.id === activeSessionId
                      ? 'bg-primary-500/10 text-primary-500'
                      : 'text-text-secondary hover:bg-background-elevated hover:text-text-primary'
                  )}
                >
                  <span className="w-4 h-4 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <MessageSquare size={14} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{session.title}</div>
                    <div className="text-xs text-text-muted truncate mt-0.5">{session.preview}</div>
                  </div>
                  <span className="w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 flex-shrink-0">
                    <ChevronRight size={12} />
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-3 py-3 space-y-1">
          <ThemeToggle />

          {userEmail && (
            <div className="px-3 py-1.5 text-xs text-text-muted truncate">
              {userEmail}
            </div>
          )}

          <button
            onClick={handleLogout}
            className={cn(
              'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm',
              'text-text-secondary hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-900/20',
              'transition-colors duration-150 cursor-pointer whitespace-nowrap'
            )}
          >
            <span className="w-4 h-4 flex items-center justify-center">
              <LogOut size={14} />
            </span>
            <span>Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
