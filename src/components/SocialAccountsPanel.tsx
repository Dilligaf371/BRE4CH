import { useState, useEffect } from 'react';
import { MessageCircle, Camera, Globe, ExternalLink, LogIn, LogOut, ChevronUp, ChevronDown, Menu, User, Monitor, X, RefreshCw } from 'lucide-react';

// ─── Social account config ───
export interface SocialAccount {
  id: string;
  label: string;
  icon: typeof MessageCircle;
  color: string;
  bg: string;
  border: string;
  loginUrl: string;
  webUrl: string;
  iframeUrl: string;
  description: string;
}

export const SOCIAL_ACCOUNTS: SocialAccount[] = [
  {
    id: 'telegram',
    label: 'TELEGRAM',
    icon: MessageCircle,
    color: 'text-blue-400',
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/30',
    loginUrl: 'https://web.telegram.org/a/',
    webUrl: 'https://web.telegram.org/a/',
    iframeUrl: '/tg-embed/',
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
    iframeUrl: '/x-embed/',
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
    iframeUrl: '/snap-embed/',
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
  const [openEmbed, setOpenEmbed] = useState<string | null>(null);
  const [embedKey, setEmbedKey] = useState(0);

  useEffect(() => {
    localStorage.setItem('roar-social-collapsed', String(collapsed));
  }, [collapsed]);

  const toggleLogin = (id: string) => {
    const next = { ...loggedIn, [id]: !loggedIn[id] };
    setLoggedIn(next);
    saveLoggedIn(next);
    // Close embed if disconnecting
    if (loggedIn[id] && openEmbed === id) setOpenEmbed(null);
  };

  const toggleEmbed = (id: string) => {
    setOpenEmbed(prev => prev === id ? null : id);
    setEmbedKey(k => k + 1);
  };

  const connectedCount = SOCIAL_ACCOUNTS.filter(a => loggedIn[a.id]).length;

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
            {connectedCount}/{SOCIAL_ACCOUNTS.length}
          </span>
          <div className={`w-1.5 h-1.5 rounded-full ${connectedCount > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
        </div>
      </div>

      {!collapsed && (
        <div className="p-2 space-y-1.5">
          {SOCIAL_ACCOUNTS.map(account => {
            const Icon = account.icon;
            const isConnected = !!loggedIn[account.id];
            const isEmbedOpen = openEmbed === account.id;

            return (
              <div key={account.id} className="space-y-0">
                {/* Account card */}
                <div
                  className={`px-2.5 py-2 rounded-lg border transition-all ${
                    isConnected
                      ? `${account.border} ${account.bg}`
                      : 'border-[var(--palantir-border)] bg-black/20'
                  } ${isEmbedOpen ? 'rounded-b-none' : ''}`}
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
                        <>
                          <button
                            onClick={() => toggleEmbed(account.id)}
                            className={`p-1.5 rounded transition-colors ${isEmbedOpen ? 'bg-white/10 ' + account.color : 'hover:bg-white/10 ' + account.color}`}
                            title={isEmbedOpen ? `Close ${account.label}` : `Open ${account.label}`}
                          >
                            {isEmbedOpen ? <ChevronUp className="w-3 h-3" /> : <Monitor className="w-3 h-3" />}
                          </button>
                          <a
                            href={account.webUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`p-1.5 rounded hover:bg-white/10 transition-colors ${account.color}`}
                            title={`Open ${account.label} in new tab`}
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </>
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

                {/* Inline iframe — directly below the account card */}
                {isEmbedOpen && (
                  <div className={`border border-t-0 ${account.border} rounded-b-lg overflow-hidden`}>
                    {/* Mini toolbar */}
                    <div className={`flex items-center gap-1.5 px-2 py-1 ${account.bg} border-b ${account.border}`}>
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[8px] font-mono text-[var(--palantir-text-muted)] flex-1">
                        LIVE EMBED
                      </span>
                      <button
                        onClick={() => setEmbedKey(k => k + 1)}
                        className="p-0.5 rounded hover:bg-white/10 transition-colors text-[var(--palantir-text-muted)] hover:text-white"
                        title="Refresh"
                      >
                        <RefreshCw className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setOpenEmbed(null)}
                        className="p-0.5 rounded hover:bg-red-500/20 transition-colors text-[var(--palantir-text-muted)] hover:text-red-400"
                        title="Close"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    {/* Iframe */}
                    <iframe
                      key={embedKey}
                      src={account.iframeUrl}
                      className="w-full border-0"
                      style={{ height: '500px' }}
                      title={`${account.label} embedded`}
                      allow="clipboard-read; clipboard-write; camera; microphone"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {collapsed && (
        <div className="px-3 py-2 flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${connectedCount > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
          <span className="text-[9px] font-mono text-[var(--palantir-text-muted)]">
            {connectedCount}/{SOCIAL_ACCOUNTS.length} connected —
            {SOCIAL_ACCOUNTS.map(a => `${loggedIn[a.id] ? '●' : '○'} ${a.label.split(' ')[0]}`).join(' / ')}
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
