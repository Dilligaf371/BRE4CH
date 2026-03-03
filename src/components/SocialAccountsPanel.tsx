import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { MessageCircle, Camera, Globe, ExternalLink, LogIn, LogOut, ChevronUp, Menu, User, X, Maximize2, Minimize2, RefreshCw } from 'lucide-react';

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
  iframeUrl: string;
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
  const [activeIframe, setActiveIframe] = useState<string | null>(null);
  const [iframeMaximized, setIframeMaximized] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);
  const [iframeLoading, setIframeLoading] = useState(false);
  const [iframeFailed, setIframeFailed] = useState(false);
  const [popupRef, setPopupRef] = useState<Window | null>(null);

  useEffect(() => {
    localStorage.setItem('roar-social-collapsed', String(collapsed));
  }, [collapsed]);

  // ESC to close iframe overlay
  useEffect(() => {
    if (!activeIframe) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveIframe(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeIframe]);

  const toggleLogin = (id: string) => {
    const next = { ...loggedIn, [id]: !loggedIn[id] };
    setLoggedIn(next);
    saveLoggedIn(next);
  };

  const openIframe = useCallback((accountId: string) => {
    setActiveIframe(accountId);
    setIframeMaximized(true);
    setIframeLoading(true);
    setIframeFailed(false);
  }, []);

  const closeIframe = useCallback(() => {
    setActiveIframe(null);
    setIframeLoading(false);
    setIframeFailed(false);
    if (popupRef && !popupRef.closed) popupRef.close();
    setPopupRef(null);
  }, [popupRef]);

  const refreshIframe = useCallback(() => {
    setIframeKey(k => k + 1);
    setIframeLoading(true);
    setIframeFailed(false);
  }, []);

  const openAsPopup = useCallback((account: SocialAccount) => {
    const w = window.open(account.webUrl, `${account.id}-popup`, 'width=1200,height=800,menubar=no,toolbar=no,location=yes,status=no');
    if (w) setPopupRef(w);
  }, []);

  const connectedCount = ACCOUNTS.filter(a => loggedIn[a.id]).length;
  const activeAccount = ACCOUNTS.find(a => a.id === activeIframe);

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
                      <>
                        <button
                          onClick={() => openIframe(account.id)}
                          className={`p-1.5 rounded hover:bg-white/10 transition-colors ${account.color}`}
                          title={`Open ${account.label} embed`}
                        >
                          <Maximize2 className="w-3 h-3" />
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

      {/* ─── Iframe Overlay Portal ─── */}
      {activeAccount && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div
            className={`flex flex-col bg-[#0a0f1a] border border-[var(--palantir-border)] rounded-lg overflow-hidden shadow-2xl shadow-black/50 transition-all duration-300 ${
              iframeMaximized
                ? 'w-[95vw] h-[92vh]'
                : 'w-[700px] h-[500px]'
            }`}
          >
            {/* Toolbar */}
            <div className={`flex items-center gap-3 px-4 py-2.5 border-b border-[var(--palantir-border)] ${activeAccount.bg} flex-shrink-0`}>
              <div className={`w-7 h-7 rounded flex items-center justify-center ${activeAccount.bg} border ${activeAccount.border}`}>
                {(() => { const Icon = activeAccount.icon; return <Icon className={`w-4 h-4 ${activeAccount.color}`} />; })()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono font-bold tracking-wider ${activeAccount.color}`}>
                    {activeAccount.label}
                  </span>
                  <span className="text-[7px] font-mono font-bold text-green-400 bg-green-500/20 px-1.5 py-0.5 rounded tracking-wider">
                    EMBEDDED
                  </span>
                </div>
                <span className="text-[9px] font-mono text-[var(--palantir-text-muted)]">
                  {activeAccount.iframeUrl}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={refreshIframe}
                  className="p-1.5 rounded hover:bg-white/10 transition-colors text-[var(--palantir-text-muted)] hover:text-white"
                  title="Refresh"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIframeMaximized(!iframeMaximized)}
                  className="p-1.5 rounded hover:bg-white/10 transition-colors text-[var(--palantir-text-muted)] hover:text-white"
                  title={iframeMaximized ? 'Reduce' : 'Maximize'}
                >
                  {iframeMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <a
                  href={activeAccount.webUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded hover:bg-white/10 transition-colors text-[var(--palantir-text-muted)] hover:text-white"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={closeIframe}
                  className="p-1.5 rounded hover:bg-red-500/20 transition-colors text-[var(--palantir-text-muted)] hover:text-red-400"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Iframe */}
            <div className="flex-1 relative bg-[#0e1621]">
              {/* Loading overlay */}
              {iframeLoading && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0e1621]">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${activeAccount.bg} border ${activeAccount.border} mb-4`}>
                    {(() => { const Icon = activeAccount.icon; return <Icon className={`w-6 h-6 ${activeAccount.color}`} />; })()}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                    <span className="text-xs font-mono text-[var(--palantir-text-muted)]">LOADING {activeAccount.label}...</span>
                  </div>
                  <div className="w-48 h-0.5 bg-white/10 rounded overflow-hidden">
                    <div className="h-full bg-cyan-500/60 rounded animate-[loading_2s_ease-in-out_infinite]" style={{ width: '60%' }} />
                  </div>
                </div>
              )}

              {/* Fallback for blocked sites */}
              {iframeFailed && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0e1621]">
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${activeAccount.bg} border ${activeAccount.border} mb-4`}>
                    {(() => { const Icon = activeAccount.icon; return <Icon className={`w-8 h-8 ${activeAccount.color}`} />; })()}
                  </div>
                  <span className="text-sm font-mono text-[var(--palantir-text)] mb-2">IFRAME BLOCKED</span>
                  <span className="text-[10px] font-mono text-[var(--palantir-text-muted)] mb-6 text-center max-w-md">
                    {activeAccount.label} blocks direct iframe embedding. Use popup mode for full functionality.
                  </span>
                  <button
                    onClick={() => openAsPopup(activeAccount)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${activeAccount.border} ${activeAccount.bg} ${activeAccount.color} text-xs font-mono font-bold tracking-wider hover:brightness-125 transition-all`}
                  >
                    <ExternalLink className="w-4 h-4" />
                    OPEN AS POPUP
                  </button>
                </div>
              )}

              <iframe
                key={iframeKey}
                src={activeAccount.iframeUrl}
                className="w-full h-full border-0"
                title={`${activeAccount.label} embedded`}
                allow="clipboard-read; clipboard-write; camera; microphone"
                referrerPolicy="no-referrer"
                onLoad={() => setIframeLoading(false)}
                onError={() => { setIframeLoading(false); setIframeFailed(true); }}
              />
            </div>

            {/* Status bar */}
            <div className="flex items-center gap-2 px-4 py-1.5 border-t border-[var(--palantir-border)] bg-[#0a0f1a] flex-shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[9px] font-mono text-[var(--palantir-text-muted)]">
                LIVE EMBED // {activeAccount.label} // ESC TO CLOSE
              </span>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
