import { useState, useEffect, useCallback, useRef } from 'react';

export type OsintSource = 'reuters' | 'aljazeera' | 'dod' | 'idf' | 'ap' | 'centcom' | 'flightradar';
export type OsintPriority = 'flash' | 'immediate' | 'priority' | 'routine';

export interface OsintItem {
  id: string;
  source: OsintSource;
  title: string;
  summary: string;
  timestamp: number;
  priority: OsintPriority;
  region: string;
  url?: string;
}

const SOURCE_CONFIG: Record<OsintSource, { label: string; color: string }> = {
  reuters: { label: 'REUTERS', color: 'text-orange-400' },
  aljazeera: { label: 'AL JAZEERA', color: 'text-amber-400' },
  dod: { label: 'DOD.GOV', color: 'text-blue-400' },
  idf: { label: 'IDF.IL', color: 'text-cyan-400' },
  ap: { label: 'AP NEWS', color: 'text-green-400' },
  centcom: { label: 'CENTCOM', color: 'text-purple-400' },
  flightradar: { label: 'FR24/SIGINT', color: 'text-rose-400' },
};

export { SOURCE_CONFIG };

// VERIFIED HEADLINES ONLY — Sources: Reuters, Al Jazeera, IDF, Fox News
// NATO Admiralty Classification: A1-E6 (see useRealtimeStats.ts for legend)
const OSINT_HEADLINES: { source: OsintSource; title: string; summary: string; priority: OsintPriority; region: string }[] = [
  // Reuters confirmed — A2 (Completely reliable / Probably true)
  { source: 'reuters', title: 'Khamenei killed in coalition strikes on Iran', summary: '[A2] 40+ senior Iranian leaders killed in opening wave of Operation Epic Fury', priority: 'flash', region: 'Tehran, Iran' },
  { source: 'reuters', title: 'US forces hit 1,000+ targets in first 2 days', summary: '[A2] Massive air campaign across Iran — Trump says op could take four to five weeks', priority: 'flash', region: 'Iran' },
  { source: 'reuters', title: '9 Iranian naval ships sunk — naval HQ destroyed', summary: '[A2] Iranian naval presence denied in Gulf of Oman within 48 hours of first strikes', priority: 'flash', region: 'Gulf of Oman' },
  { source: 'reuters', title: '6 US aircrew killed in Kuwait friendly fire', summary: '[A2] F-15E Strike Eagles shot down by Kuwaiti Patriot battery — 6 aircrew KIA', priority: 'immediate', region: 'Kuwait' },
  { source: 'reuters', title: 'Oil hits $155/barrel as Iran strikes disrupt exports', summary: '[A2] Global energy crisis deepening — Strait of Hormuz contested — Iranian exports disrupted', priority: 'immediate', region: 'Global' },
  { source: 'reuters', title: '555 killed in Iran per Red Crescent', summary: '[B3] Iranian Red Crescent reports casualties — hard to verify independently in warzone', priority: 'immediate', region: 'Iran' },
  { source: 'reuters', title: 'IAEA: cannot rule out radiological release near nuclear sites', summary: '[A2] Iran IAEA ambassador confirms Natanz was targeted — no confirmed damage as of Mar 2', priority: 'priority', region: 'Iran' },
  { source: 'reuters', title: 'Congress debating war powers resolution', summary: '[A1] Bipartisan tensions over scope and authorization of Iran military operation', priority: 'routine', region: 'Washington DC' },
  // IDF confirmed — B2 (Usually reliable / Probably true — operational bias)
  { source: 'idf', title: 'IAF drops 1,200+ munitions across 24/31 Iranian provinces', summary: '[B2] 30+ separate strike operations against ballistic missile and air defense arrays', priority: 'flash', region: 'Israel / Iran' },
  { source: 'idf', title: 'IDF strikes and dismantles Iranian state broadcaster', summary: '[B2] Iranian state TV taken off air — 7 Iranian security leaders confirmed killed', priority: 'flash', region: 'Tehran, Iran' },
  { source: 'idf', title: 'Arrow-3 exo-atmospheric intercept confirmed over Jordan', summary: '[B2] Multi-layer defense system engaging Iranian ballistic missiles at all altitudes', priority: 'immediate', region: 'Israel / Jordan' },
  { source: 'idf', title: 'Israel: 9+ killed, 121 wounded from Iranian strikes', summary: '[B2] 40+ buildings damaged in Tel Aviv — warhead landed near Temple Mount', priority: 'flash', region: 'Israel' },
  // Al Jazeera confirmed — B2 (Usually reliable / Probably true)
  { source: 'aljazeera', title: 'Iran True Promise 4 launched — 27 US bases targeted', summary: '[B2] 7th/8th waves of retaliation ongoing — explosions in Dubai, Doha, Manama for 3 days', priority: 'flash', region: 'Gulf States' },
  { source: 'aljazeera', title: 'IRGC claims targeting USS Abraham Lincoln with 4 BMs', summary: '[D5] IRGC claim — no confirmation of hit — carrier group continuing operations', priority: 'immediate', region: 'Arabian Sea' },
  { source: 'aljazeera', title: 'UAE: 165 BM + 541 drones fired — 3 KIA 58 WIA', summary: '[A2] UAE MoD confirmed — 21 drones penetrated — Burj Al Arab fire — Jebel Ali Port fire', priority: 'flash', region: 'UAE' },
  { source: 'aljazeera', title: 'Kuwait: 97 BM + 283 drones intercepted — airport hit', summary: '[A2] Kuwait govt confirmed — airport damaged by drone — 1 KIA 32 WIA', priority: 'immediate', region: 'Kuwait' },
  { source: 'aljazeera', title: 'Bahrain: 5th Fleet HQ targeted — 45 missiles shot down', summary: '[B2] Mina Salman port fire — 1 worker killed — 4 total injured', priority: 'immediate', region: 'Bahrain' },
  { source: 'aljazeera', title: 'Qatar: 65 missiles + 12 drones — most intercepted', summary: '[B2] 16 people injured — explosions heard across Doha for 3 consecutive days', priority: 'priority', region: 'Qatar' },
  { source: 'aljazeera', title: 'Warhead lands near Temple Mount in Jerusalem', summary: '[B2] 40+ buildings damaged in Tel Aviv — Iranian strikes hitting Israeli cities', priority: 'flash', region: 'Israel' },
  { source: 'aljazeera', title: 'Strait of Hormuz declared closed by Iranian general', summary: '[B2/C3] Major shipping disruption — EW activity detected (Fox News)', priority: 'flash', region: 'Strait of Hormuz' },
  { source: 'aljazeera', title: 'Dubai International Airport damaged and shut down', summary: '[C3] Fox News confirmed — regional airspace closures — 3rd closure since Feb 28', priority: 'immediate', region: 'UAE' },
  { source: 'aljazeera', title: 'Hezbollah fires rockets at northern Israel', summary: '[B2] First attacks since Nov 2024 ceasefire — IDF retaliates Beirut suburbs', priority: 'flash', region: 'Lebanon / Israel' },
  { source: 'aljazeera', title: '31 killed, 149 wounded in Lebanon from Israeli strikes', summary: '[B2] Regional war expanding as Hezbollah joins Iran retaliation', priority: 'immediate', region: 'Lebanon' },
  { source: 'aljazeera', title: '158 students killed at elementary school in Minab', summary: '[D4] Iran state claim — not independently verified — deadliest civilian incident reported', priority: 'flash', region: 'Minab, Iran' },
  { source: 'aljazeera', title: 'Cyprus: drone hits British air base — limited damage', summary: '[B2] Drone impact at UK sovereign base area — no UK casualties reported', priority: 'priority', region: 'Cyprus' },
];

// Map RSS source names to OsintSource keys
const SOURCE_MAP: Record<string, OsintSource> = {
  'CENTCOM': 'centcom',
  'Reuters': 'reuters',
  'Al Jazeera': 'aljazeera',
  'AP': 'ap',
  'IDF': 'idf',
  'DoD': 'dod',
};

function generateOsintItem(): OsintItem {
  const headline = OSINT_HEADLINES[Math.floor(Math.random() * OSINT_HEADLINES.length)];
  return {
    id: `osint-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    source: headline.source,
    title: headline.title,
    summary: headline.summary,
    timestamp: Date.now(),
    priority: headline.priority,
    region: headline.region,
  };
}

// Convert a live RSS headline to OsintItem
function liveHeadlineToOsint(h: { title: string; link: string; pubDate: string; source: string }): OsintItem {
  const source = SOURCE_MAP[h.source] || 'reuters';
  // Detect priority from keywords
  let priority: OsintPriority = 'routine';
  const lower = h.title.toLowerCase();
  if (lower.includes('breaking') || lower.includes('killed') || lower.includes('strike') || lower.includes('attack') || lower.includes('war')) priority = 'flash';
  else if (lower.includes('iran') || lower.includes('military') || lower.includes('missile') || lower.includes('nuclear')) priority = 'immediate';
  else if (lower.includes('middle east') || lower.includes('gulf') || lower.includes('israel') || lower.includes('hezbollah')) priority = 'priority';

  return {
    id: `live-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    source,
    title: h.title,
    summary: `[LIVE] ${h.source} — ${h.pubDate || 'just now'}`,
    timestamp: h.pubDate ? new Date(h.pubDate).getTime() || Date.now() : Date.now(),
    priority,
    region: 'Middle East',
    url: h.link,
  };
}

const LIVE_API = 'http://localhost:3001/api/sources/headlines';

export function useOsintFeed(maxItems = 30): OsintItem[] {
  const [items, setItems] = useState<OsintItem[]>(() => {
    const initial: OsintItem[] = [];
    for (let i = 0; i < 5; i++) {
      const item = generateOsintItem();
      item.timestamp = Date.now() - (5 - i) * 12000;
      initial.push(item);
    }
    return initial;
  });
  const injectedRef = useRef<Set<string>>(new Set());

  // Inject real headlines from backend RSS feeds
  const injectLiveHeadlines = useCallback(async () => {
    try {
      const res = await fetch(LIVE_API);
      if (!res.ok) return;
      const data = await res.json();
      const liveItems: { title: string; link: string; pubDate: string; source: string }[] = data.items || [];

      if (liveItems.length === 0) return;

      // Only inject headlines we haven't seen before
      const newItems = liveItems.filter(h => !injectedRef.current.has(h.title));
      if (newItems.length === 0) return;

      const osintItems = newItems.map(liveHeadlineToOsint);
      osintItems.forEach(i => injectedRef.current.add(i.title));

      setItems(prev => [...osintItems, ...prev].slice(0, maxItems));
    } catch { /* backend offline — continue with mock data */ }
  }, [maxItems]);

  // Poll for live headlines every 60s
  useEffect(() => {
    injectLiveHeadlines();
    const interval = setInterval(injectLiveHeadlines, 60_000);
    return () => clearInterval(interval);
  }, [injectLiveHeadlines]);

  // Continue generating mock OSINT items in between
  const addItem = useCallback(() => {
    setItems(prev => {
      const newItem = generateOsintItem();
      return [newItem, ...prev].slice(0, maxItems);
    });
  }, [maxItems]);

  useEffect(() => {
    const interval = setInterval(addItem, 8000 + Math.random() * 12000);
    return () => clearInterval(interval);
  }, [addItem]);

  return items;
}
