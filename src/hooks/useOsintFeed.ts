import { useState, useEffect, useCallback } from 'react';

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

const OSINT_HEADLINES: { source: OsintSource; title: string; summary: string; priority: OsintPriority; region: string }[] = [
  { source: 'reuters', title: 'US carrier strike groups converge on Persian Gulf', summary: 'CVN-72 Lincoln and CVN-78 Ford now operating within striking distance of Iranian targets', priority: 'flash', region: 'Persian Gulf' },
  { source: 'dod', title: 'Pentagon confirms F-22 deployment to Israel', summary: '12 F-22A Raptors at Ovda AB - first US offensive aircraft deployment on Israeli soil', priority: 'flash', region: 'Israel' },
  { source: 'aljazeera', title: 'Iran retaliates with missile barrage on Gulf bases', summary: 'Ballistic missiles and drones targeting NSA Bahrain, Al Udeid, Al Dhafra', priority: 'flash', region: 'Gulf States' },
  { source: 'centcom', title: 'CENTCOM confirms 67% intercept rate on Iranian salvos', summary: 'THAAD, Patriot PAC-3, SM-3 systems engaging across integrated defense network', priority: 'immediate', region: 'CENTCOM AOR' },
  { source: 'idf', title: 'IAF F-35I Adir sorties from Nevatim confirmed', summary: 'Multiple strike packages launched targeting Iranian nuclear infrastructure', priority: 'flash', region: 'Israel / Iran' },
  { source: 'ap', title: 'Isfahan nuclear facility struck - IAEA reports damage', summary: 'Uranium conversion facility at Isfahan shows significant structural damage on satellite imagery', priority: 'immediate', region: 'Isfahan, Iran' },
  { source: 'reuters', title: 'Gulf allies restrict US use of bases for Iran ops', summary: 'Saudi Arabia, UAE, Qatar limit offensive operations from their territory', priority: 'immediate', region: 'Gulf States' },
  { source: 'dod', title: 'B-2 Spirit bombers deploy GBU-57 MOP on Fordow', summary: 'Massive Ordnance Penetrators targeting underground enrichment facility', priority: 'flash', region: 'Fordow, Iran' },
  { source: 'flightradar', title: 'SIGINT: NOTAM blackout over eastern Mediterranean', summary: 'All civilian flights rerouted - military operations zone declared', priority: 'immediate', region: 'Eastern Med' },
  { source: 'centcom', title: 'Ohio-class SSGN launches Tomahawk salvo', summary: 'SSGN-729 USS Georgia fires 40+ TLAM at command and control targets', priority: 'flash', region: 'Arabian Sea' },
  { source: 'aljazeera', title: 'Iran IRGC claims downing of US drones over Isfahan', summary: 'S-300 and Bavar-373 systems reportedly engaging aerial targets', priority: 'priority', region: 'Isfahan, Iran' },
  { source: 'idf', title: 'Iron Dome intercepts Houthi drone targeting Eilat', summary: 'Ansar Allah drone launched from Yemen - third attempt in 48 hours', priority: 'priority', region: 'Red Sea / Israel' },
  { source: 'ap', title: 'Abadan refinery fire spreading after cruise missile hit', summary: '450,000 bpd facility burning - environmental disaster warning issued', priority: 'immediate', region: 'Abadan, Iran' },
  { source: 'reuters', title: 'Strait of Hormuz shipping halted amid mine threat', summary: 'IRGCN fast boats and mine-laying activity forces closure of strategic waterway', priority: 'flash', region: 'Strait of Hormuz' },
  { source: 'dod', title: '82nd Airborne elements inserted northern Iran', summary: 'Airborne forces securing strategic positions near Tabriz corridor', priority: 'flash', region: 'Northern Iran' },
  { source: 'centcom', title: 'Cyber Command confirms disruption of IRGC networks', summary: 'SCADA systems at Natanz, Arak, and Bushehr experiencing anomalies', priority: 'immediate', region: 'Iran' },
  { source: 'flightradar', title: 'KC-46A tanker orbits detected over Saudi Arabia', summary: 'Aerial refueling tracks consistent with long-range strike support', priority: 'priority', region: 'Saudi Arabia' },
  { source: 'aljazeera', title: 'Tehran declares state of emergency across 5 provinces', summary: 'Isfahan, Tehran, Khuzestan, Bushehr, and Fars provinces under martial law', priority: 'immediate', region: 'Iran' },
  { source: 'idf', title: 'Dolphin-class submarine reported in Arabian Sea', summary: 'Israeli nuclear-capable submarine providing second-strike deterrence', priority: 'priority', region: 'Arabian Sea' },
  { source: 'ap', title: 'Oil prices surge past $140/barrel on Hormuz closure', summary: 'Global markets in turmoil as 20% of world oil transit route blocked', priority: 'priority', region: 'Global' },
];

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
