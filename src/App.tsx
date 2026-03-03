import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MapView } from './components/MapView';
import { AttackStatsPanel } from './components/AttackStatsPanel';
import { UltronChat } from './components/UltronChat';
import { JarvisChat } from './components/JarvisChat';
import { InfrastructureLegend } from './components/InfrastructureLegend';
import { EventFeed } from './components/EventFeed';
import { BottomTicker } from './components/BottomTicker';
import { SocmintPanel } from './components/SocmintPanel';
import { SocialAccountsPanel } from './components/SocialAccountsPanel';
import { SheltersPanel } from './components/SheltersPanel';
import { LoginPage } from './components/LoginPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeAgent, setActiveAgent] = useState<'ultron' | 'c2'>(() => {
    try {
      const stored = localStorage.getItem('roar-active-agent');
      if (stored === 'ultron' || stored === 'c2') return stored;
    } catch { /* ignore */ }
    return 'ultron';
  });

  useEffect(() => {
    const auth = localStorage.getItem('breach-auth');
    if (auth) {
      try {
        const parsed = JSON.parse(auth);
        // Session valid for 24h
        if (parsed.ts && Date.now() - parsed.ts < 24 * 60 * 60 * 1000) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('breach-auth');
        }
      } catch {
        localStorage.removeItem('breach-auth');
      }
    }
  }, []);

  // Persist active agent tab
  useEffect(() => {
    localStorage.setItem('roar-active-agent', activeAgent);
  }, [activeAgent]);


  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="h-screen flex flex-col bg-[var(--palantir-bg)] scanlines">
      {/* Header */}
      <Header onLogout={() => {
        localStorage.removeItem('breach-auth');
        setIsAuthenticated(false);
      }} />

      {/* Main Content */}
      <main className="flex-1 flex min-h-0 p-2 gap-2">
        {/* Left sidebar - Attack stats + SOCMINT */}
        <aside className="w-80 flex-shrink-0 overflow-y-auto scrollbar-hide min-h-0 space-y-2">
          <AttackStatsPanel />
          <SocmintPanel />
          <SocialAccountsPanel />
          <SheltersPanel />
        </aside>

        {/* Center - Map + Event Feed */}
        <section className="flex-1 min-w-0 flex flex-col gap-2">
          {/* Map */}
          <div className="flex-1 min-h-0 relative">
            <MapView />
            <InfrastructureLegend />
          </div>
          {/* Event Feed with tabs (Events / OSINT / Live TV) */}
          <div className="h-56 flex-shrink-0">
            <EventFeed />
          </div>
        </section>

        {/* Right - AI Agents */}
        <aside className="w-96 flex-shrink-0 flex flex-col min-h-0">
          {/* Agent Tabs */}
          <div className="flex border border-[var(--palantir-border)] rounded-t-lg overflow-hidden flex-shrink-0">
            <button
              onClick={() => setActiveAgent('ultron')}
              className={`flex-1 px-3 py-1.5 text-xs font-mono font-bold transition-colors ${
                activeAgent === 'ultron'
                  ? 'bg-amber-500/20 text-amber-400 border-b-2 border-amber-500'
                  : 'bg-[var(--palantir-surface)] text-[var(--palantir-text-muted)] hover:text-amber-400/60'
              }`}
            >
              ULTRON
            </button>
            <button
              onClick={() => setActiveAgent('c2')}
              className={`flex-1 px-3 py-1.5 text-xs font-mono font-bold transition-colors ${
                activeAgent === 'c2'
                  ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-500'
                  : 'bg-[var(--palantir-surface)] text-[var(--palantir-text-muted)] hover:text-blue-400/60'
              }`}
            >
              C2
            </button>
          </div>
          {/* Both agents rendered, inactive hidden */}
          <div className={`flex-1 min-h-0 ${activeAgent === 'ultron' ? '' : 'hidden'}`}>
            <UltronChat />
          </div>
          <div className={`flex-1 min-h-0 ${activeAgent === 'c2' ? '' : 'hidden'}`}>
            <JarvisChat />
          </div>
        </aside>
      </main>

      {/* Bottom Ticker */}
      <BottomTicker />

    </div>
  );
}

export default App;
