import { useState, useEffect, useRef, useCallback } from 'react';
import { generateEvent, type AttackEvent, type AttackType } from '../data/mockData';

const LIVE_API = 'http://localhost:3001/api/sources/headlines';

// Map RSS source names to display name + URL
const SOURCE_URLS: Record<string, { name: string; url: string }> = {
  'CENTCOM': { name: 'CENTCOM', url: 'https://www.centcom.mil' },
  'Reuters': { name: 'Reuters', url: 'https://www.reuters.com/world/middle-east/' },
  'Al Jazeera': { name: 'Al Jazeera', url: 'https://www.aljazeera.com/tag/iran/' },
  'AP': { name: 'AP News', url: 'https://apnews.com/hub/iran' },
  'IDF': { name: 'IDF', url: 'https://www.idf.il' },
  'DoD': { name: 'DoD', url: 'https://www.defense.gov' },
};

// Convert live headline to AttackEvent
function liveHeadlineToEvent(h: { title: string; source: string; pubDate: string; link?: string }): AttackEvent {
  const lower = h.title.toLowerCase();

  let type: AttackType = 'cruise';
  if (lower.includes('drone') || lower.includes('uav')) type = 'drone';
  else if (lower.includes('missile') || lower.includes('ballistic') || lower.includes('rocket')) type = 'ballistic';
  else if (lower.includes('cyber') || lower.includes('hack')) type = 'cyber';
  else if (lower.includes('artillery') || lower.includes('shell')) type = 'artillery';
  else if (lower.includes('sabotage') || lower.includes('explosion')) type = 'sabotage';

  let status: AttackEvent['status'] = 'ongoing';
  if (lower.includes('intercept') || lower.includes('shot down') || lower.includes('defended')) status = 'intercepted';
  else if (lower.includes('hit') || lower.includes('struck') || lower.includes('killed') || lower.includes('destroyed')) status = 'impact';
  else if (lower.includes('neutraliz')) status = 'neutralized';

  const srcInfo = SOURCE_URLS[h.source] || { name: h.source, url: '' };

  return {
    id: `live-evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: h.pubDate ? new Date(h.pubDate).getTime() || Date.now() : Date.now(),
    type,
    origin: h.source,
    target: 'Iran Theater',
    status,
    details: h.title,
    source: srcInfo.name,
    sourceUrl: h.link || srcInfo.url,
  };
}

export function useEventFeed(maxEvents = 50) {
  const [events, setEvents] = useState<AttackEvent[]>([]);
  const injectedRef = useRef<Set<string>>(new Set());

  // Inject live headlines as events every 60s
  const injectLiveEvents = useCallback(async () => {
    try {
      const res = await fetch(LIVE_API);
      if (!res.ok) return;
      const data = await res.json();
      const headlines: { title: string; source: string; pubDate: string }[] = data.items || [];
      if (headlines.length === 0) return;

      // Filter to conflict-relevant headlines only
      const relevant = headlines.filter(h => {
        const l = h.title.toLowerCase();
        return l.includes('iran') || l.includes('israel') || l.includes('military') || l.includes('strike')
          || l.includes('missile') || l.includes('kill') || l.includes('attack') || l.includes('war')
          || l.includes('drone') || l.includes('bomb') || l.includes('nuclear') || l.includes('hezbollah')
          || l.includes('gaza') || l.includes('gulf') || l.includes('navy') || l.includes('air force');
      });

      const newOnes = relevant.filter(h => !injectedRef.current.has(h.title));
      if (newOnes.length === 0) return;

      const toInject = newOnes.slice(0, 3).map(liveHeadlineToEvent);
      toInject.forEach(e => injectedRef.current.add(e.details.replace(/^\[LIVE [^\]]+\] /, '')));

      setEvents(prev => {
        const next = [...toInject, ...prev];
        return next.length > maxEvents ? next.slice(0, maxEvents) : next;
      });
    } catch { /* backend offline */ }
  }, [maxEvents]);

  useEffect(() => {
    // Seed with initial events
    const seed: AttackEvent[] = [];
    for (let i = 0; i < 8; i++) {
      const evt = generateEvent();
      evt.timestamp = Date.now() - (8 - i) * 5000;
      seed.push(evt);
    }
    setEvents(seed);

    // Inject live headlines
    injectLiveEvents();
    const liveInterval = setInterval(injectLiveEvents, 60_000);

    // Continue mock event generation
    const interval = setInterval(() => {
      if (Math.random() > 0.4) {
        const evt = generateEvent();
        setEvents((prev) => {
          const next = [evt, ...prev];
          return next.length > maxEvents ? next.slice(0, maxEvents) : next;
        });
      }
    }, 2000 + Math.random() * 4000);

    return () => {
      clearInterval(interval);
      clearInterval(liveInterval);
    };
  }, [maxEvents, injectLiveEvents]);

  return events;
}
