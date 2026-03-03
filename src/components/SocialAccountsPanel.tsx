import { useState, useEffect } from 'react';
import { MessageCircle, Camera, Globe, ExternalLink, LogIn, LogOut, ChevronUp, Menu, User } from 'lucide-react';

// ─── Social account config ───
interface SocialAccount {
  id: string;
  label: string;
  icon: typeof MessageCircle;
  color: string;
  bg: string;
  border: string;
  loginUrl: string;
  webUrl: string;
  description: string;
}

const ACCOUNTS: SocialAccount[] = [
  {
    id: 'telegram',
    label: 'TELEGRAM',
    icon: MessageCircle,
    color: 'text-blue-400',
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/30',
    loginUrl: 'https://web.telegram.org',
    webUrl: 'https://web.telegram.org',
    description: 'Telegram Web — Access groups, channels & DMs',
  },
  {
    id: 'x',
    label: 'X (TWITTER)',
    icon: Globe,
    color: 'text-gray-300',
    bg: 'bg-gray-500/20',
    border: 'border-gray-500/30',
    loginUrl: 'https://x.com/login',
    webUrl: 'https://x.com',
    description: 'X — Monitor feeds, lists & DMs',
  },
  {
    id: 'snapchat',
    label: 'SNAPCHAT',
    icon: Camera,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-500/30',
    loginUrl: 'https://web.snapchat.com',
    webUrl: 'https://web.snapchat.com',
    description: 'Snapchat Web — Access snaps & stories',
  },
];

// ─── Persist logged-in state ───
function loadLoggedIn(): Record<string, boolean> {
  try {
    const stored = localStorage.getItem('roar-social-logged');
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return {};
}

function saveLoggedIn(state: Record<string, boolean>) {
  try { localStorage.setItem('roar-social-logged', JSON.stringify(state)); } catch { /* ignore */ }
}

export function SocialAccountsPanel() {
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('roar-social-collapsed') === 'true'; } catch { return false; }
  });
  const [loggedIn, setLoggedIn] = useState<Record<string, boolean>>(loadLoggedIn);

  useEffect(() => {
    localStorage.setItem('roar-social-collapsed', String(collapsed));
  }, [collapsed]);

  const toggleLogin = (id: string) => {
    const next = { ...loggedIn, [id]: !loggedIn[id] };
    setLoggedIn(next);
    saveLoggedIn(next);
  };

  const connectedCount = ACCOUNTS.filter(a => loggedIn[a.id]).length;

  return (
    <div className="flex flex-col bg-[var(--palantir-surface)] border border-[var(--palantir-border)] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-[var(--palantir-border)] flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-white/5 transition-colors"
          title={collapsed ? 'Expand panel' : 'Collapse panel'}
        >
          {collapsed ? <Menu className="w-3.5 h-3.5 text-cyan-400" /> : <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />}
        </button>
        <User className="w-4 h-4 text-cyan-400" />
        <span className="font-semibold text-xs uppercase tracking-wider text-[var(--palantir-text)]">
          ACCOUNTS
        </span>
        <span className="text-[9px] font-mono text-[var(--palantir-text-muted)]">Social Access</span>
        <div className="ml-auto flex items-center gap-1.5">
          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${connectedCount > 0 ? 'text-green-400 bg-green-500/20' : 'text-[var(--palantir-text-muted)] bg-white/5'}`}>
            {connectedCount}/{ACCOUNTS.length}
          </span>
          <div className={`w-1.5 h-1.5 rounded-full ${connectedCount > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
        </div>
      </div>

      {!collapsed && (
        <div className="p-2 space-y-1.5">
          {ACCOUNTS.map(account => {
            const Icon = account.icon;
            const isConnected = !!loggedIn[account.id];

            return (
              <div
                key={account.id}
                className={`px-2.5 py-2 rounded-lg border transition-all ${
                  isConnected
                    ? `${account.border} ${account.bg}`
                    : 'border-[var(--palantir-border)] bg-black/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded flex items-center justify-center ${account.bg}`}>
                      <Icon className={`w-3 h-3 ${account.color}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-mono font-bold tracking-wider ${isConnected ? account.color : 'text-[var(--palantir-text)]'}`}>
                          {account.label}
                        </span>
                        {isConnected && (
                          <span className="text-[7px] font-mono font-bold text-green-400 bg-green-500/20 px-1 py-0.5 rounded tracking-wider">
                            CONNECTED
                          </span>
                        )}
                      </div>
                      <p className="text-[8px] font-mono text-[var(--palantir-text-muted)] leading-relaxed">
                        {account.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {isConnected && (
                      <a
                        href={account.webUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-1.5 rounded hover:bg-white/10 transition-colors ${account.color}`}
                        title={`Open ${account.label}`}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <button
                      onClick={() => {
                        if (!isConnected) {
                          window.open(account.loginUrl, '_blank', 'noopener,noreferrer');
                        }
                        toggleLogin(account.id);
                      }}
                      className={`flex items-center gap-1 px-2 py-1 rounded border text-[8px] font-mono font-bold tracking-wider transition-all ${
                        isConnected
                          ? 'border-red-500/30 text-red-400 hover:bg-red-500/20'
                          : `${account.border} ${account.color} hover:brightness-125`
                      }`}
                      title={isConnected ? 'Disconnect' : 'Login'}
                    >
                      {isConnected ? (
                        <>
                          <LogOut className="w-2.5 h-2.5" />
                          OFF
                        </>
                      ) : (
                        <>
                          <LogIn className="w-2.5 h-2.5" />
                          LOGIN
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {collapsed && (
        <div className="px-3 py-2 flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${connectedCount > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
          <span className="text-[9px] font-mono text-[var(--palantir-text-muted)]">
            {connectedCount}/{ACCOUNTS.length} connected —
            {ACCOUNTS.map(a => `${loggedIn[a.id] ? '●' : '○'} ${a.label.split(' ')[0]}`).join(' / ')}
          </span>
        </div>
      )}

      {/* Footer */}
      {!collapsed && (
        <div className="px-3 py-1.5 border-t border-[var(--palantir-border)] flex items-center gap-2 flex-shrink-0">
          <div className={`w-1.5 h-1.5 rounded-full ${connectedCount > 0 ? 'bg-cyan-500 animate-pulse' : 'bg-gray-500'}`} />
          <span className="text-[9px] font-mono text-[var(--palantir-text-muted)]">
            SOCIAL ACCESS // {connectedCount} ACTIVE SESSION{connectedCount !== 1 ? 'S' : ''}
          </span>
        </div>
      )}
    </div>
  );
}
