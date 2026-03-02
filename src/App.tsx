import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MapView } from './components/MapView';
import { AttackStatsPanel } from './components/AttackStatsPanel';
import { UltronChat } from './components/UltronChat';
import { InfrastructureLegend } from './components/InfrastructureLegend';
import { EventFeed } from './components/EventFeed';
import { BottomTicker } from './components/BottomTicker';
import { SocmintPanel } from './components/SocmintPanel';
import { LoginPage } from './components/LoginPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="h-screen flex flex-col bg-[var(--palantir-bg)] scanlines">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 flex min-h-0 p-2 gap-2">
        {/* Left sidebar - Attack stats + SOCMINT */}
        <aside className="w-80 flex-shrink-0 flex flex-col gap-2 min-h-0">
          {/* Attack Feed (compact with burger menu) */}
          <div className="flex-shrink-0 overflow-y-auto scrollbar-hide max-h-[50%]">
            <AttackStatsPanel />
          </div>
          {/* SOCMINT Panel */}
          <div className="flex-1 min-h-0">
            <SocmintPanel />
          </div>
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

        {/* Right - ULTRON Chat */}
        <aside className="w-96 flex-shrink-0">
          <div className="h-full">
            <UltronChat />
          </div>
        </aside>
      </main>

      {/* Bottom Ticker */}
      <BottomTicker />
    </div>
  );
}

export default App;
