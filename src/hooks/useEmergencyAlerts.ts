import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * UAE NCEMA / Ministry of Interior Emergency Alert System
 * Based on the real alert system deployed Feb 28-Mar 1, 2026 during Iranian missile strikes.
 *
 * Sources:
 * - Gulf News: "UAE issues emergency alert to residents" (gulfnews.com)
 * - The National: "Iran strikes UAE: how to stay safe as emergency alerts issued"
 * - Khaleej Times: "UAE thwarts Iranian missiles: Residents receive safety alerts"
 * - Al Arabiya: "UAE Residents Receive Missile Attack Warning Alert"
 *
 * Real alert text (MoI, Feb 28 2026):
 * "Due to the current situation of potential missile threats, seek immediate shelter
 *  in the closest secure building and steer away from windows, doors and open areas.
 *  Await further instructions."
 */

export type AlertLevel = 'EXTREME' | 'SEVERE' | 'MODERATE';

// Alert authority — matches real UAE entities
export type AlertAuthority = 'NCEMA' | 'MOI' | 'MOD' | 'CENTCOM' | 'IDF' | 'COALITION';

export interface EmergencyAlert {
  id: string;
  level: AlertLevel;
  headline: string;
  headlineAr?: string;       // Arabic headline
  body: string;
  bodyAr?: string;           // Arabic body
  source: string;
  sourceUrl?: string;        // Clickable source URL
  authority: AlertAuthority;
  timestamp: number;         // When alert was issued
  region: string;
  dismissed: boolean;
  readAt: number | null;     // When operator marked as read (null = unread)
  expiresAt: number;
}

// Keywords that trigger EXTREME alerts
const EXTREME_KEYWORDS = [
  'nuclear', 'radiological', 'wmd', 'chemical weapon',
  'khamenei killed', 'leader killed', 'capital struck',
  'strait of hormuz closed', 'temple mount',
  'mass casualty', 'nato article 5',
];

// Keywords that trigger SEVERE alerts
const SEVERE_KEYWORDS = [
  'killed', 'strike', 'attack', 'war', 'breaking',
  'missile', 'drone', 'shot down', 'friendly fire',
  'airport shut', 'airport hit', 'warhead',
  'hezbollah', 'retaliation', 'sunk',
];

// Keywords for MODERATE alerts
const MODERATE_KEYWORDS = [
  'iran', 'military', 'bomb', 'explosion',
  'airspace closed', 'intercepted', 'escalation',
  'casualties', 'wounded', 'deployment',
];

function detectAlertLevel(title: string): AlertLevel | null {
  const lower = title.toLowerCase();
  for (const kw of EXTREME_KEYWORDS) {
    if (lower.includes(kw)) return 'EXTREME';
  }
  for (const kw of SEVERE_KEYWORDS) {
    if (lower.includes(kw)) return 'SEVERE';
  }
  for (const kw of MODERATE_KEYWORDS) {
    if (lower.includes(kw)) return 'MODERATE';
  }
  return null;
}

function detectRegion(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes('tehran') || lower.includes('isfahan') || lower.includes('natanz')) return 'IRAN';
  if (lower.includes('israel') || lower.includes('tel aviv') || lower.includes('jerusalem')) return 'ISRAEL';
  if (lower.includes('dubai') || lower.includes('uae') || lower.includes('abu dhabi')) return 'UAE';
  if (lower.includes('kuwait')) return 'KUWAIT';
  if (lower.includes('bahrain')) return 'BAHRAIN';
  if (lower.includes('qatar') || lower.includes('doha')) return 'QATAR';
  if (lower.includes('lebanon') || lower.includes('beirut')) return 'LEBANON';
  if (lower.includes('cyprus')) return 'CYPRUS';
  if (lower.includes('strait') || lower.includes('hormuz')) return 'STRAIT OF HORMUZ';
  if (lower.includes('gulf')) return 'PERSIAN GULF';
  return 'MIDDLE EAST THEATER';
}

function detectAuthority(region: string, source: string): AlertAuthority {
  if (region === 'UAE') return 'MOI';
  if (source.includes('CENTCOM') || source.includes('DoD')) return 'CENTCOM';
  if (source.includes('IDF')) return 'IDF';
  if (region === 'KUWAIT' || region === 'BAHRAIN' || region === 'QATAR') return 'NCEMA';
  return 'COALITION';
}

const ALERT_DURATION: Record<AlertLevel, number> = {
  EXTREME: 120_000,   // 2 min — stays until read
  SEVERE: 90_000,     // 1.5 min
  MODERATE: 60_000,   // 1 min
};

const LIVE_API = 'http://localhost:3001/api/sources/headlines';

// ──── VERIFIED MOCK ALERTS ────
// Based on real events reported by Reuters, Al Jazeera, IDF, Fox News
// Each alert has a sourceUrl for clickable source attribution
type MockAlert = Omit<EmergencyAlert, 'id' | 'timestamp' | 'dismissed' | 'expiresAt' | 'readAt'>;

const MOCK_ALERTS: MockAlert[] = [
  // REAL UAE MoI alert — exact text from Feb 28, 2026 (Gulf News, Khaleej Times, The National)
  {
    level: 'EXTREME',
    headline: 'POTENTIAL MISSILE THREAT — SEEK IMMEDIATE SHELTER',
    headlineAr: 'تهديد صاروخي محتمل — اطلبوا المأوى فوراً',
    body: 'Due to the current situation of potential missile threats, seek immediate shelter in the closest secure building and steer away from windows, doors and open areas. Await further instructions. — Ministry of Interior',
    bodyAr: 'نظراً للوضع الراهن من التهديدات الصاروخية المحتملة، اطلبوا المأوى فوراً في أقرب مبنى آمن وابتعدوا عن النوافذ والأبواب والمناطق المكشوفة. انتظروا المزيد من التعليمات.',
    source: 'UAE Ministry of Interior [A1]',
    sourceUrl: 'https://gulfnews.com/uae/government/uae-issues-emergency-alert-to-residents-1.1741097823344',
    authority: 'MOI',
    region: 'UAE',
  },
  // UAE MoD confirmed stats (Al Jazeera / UAE MoD)
  {
    level: 'EXTREME',
    headline: 'UAE AIR DEFENSE: 165 BM + 541 DRONES DETECTED INBOUND',
    headlineAr: 'الدفاع الجوي الإماراتي: رصد 165 صاروخ باليستي و 541 طائرة مسيّرة',
    body: 'UAE air force and air defence systems engaging 165 ballistic missiles, 2 cruise missiles, and 541 drones. 21 drones penetrated defenses. 3 KIA, 58 WIA. Debris fires at Jebel Ali Port and Burj Al Arab contained. — UAE Ministry of Defence',
    bodyAr: 'القوات الجوية وأنظمة الدفاع الجوي الإماراتية تتعامل مع 165 صاروخاً باليستياً وصاروخين مجنحين و541 طائرة مسيّرة.',
    source: 'UAE MoD / Al Jazeera [A2]',
    sourceUrl: 'https://www.aljazeera.com/news/2026/3/1/iran-strikes-uae-what-we-know',
    authority: 'MOD',
    region: 'UAE',
  },
  // NCEMA shelter-in-place (The National, Gulf News)
  {
    level: 'SEVERE',
    headline: 'SHELTER IN PLACE — REMAIN INDOORS',
    headlineAr: 'احتموا في مكانكم — ابقوا في الداخل',
    body: 'The safety and security of all in the UAE is the highest priority. Remain indoors or in a safe place. Stay away from windows. Limit movement unless necessary. Do not approach debris or unidentified objects. Report via 999. — NCEMA',
    bodyAr: 'سلامة وأمن الجميع في الإمارات هي الأولوية القصوى. ابقوا في الداخل أو في مكان آمن. ابتعدوا عن النوافذ. لا تقتربوا من الحطام أو الأجسام المجهولة. أبلغوا عبر 999.',
    source: 'NCEMA [A1]',
    sourceUrl: 'https://www.thenationalnews.com/uae/2026/03/01/iran-strikes-uae-emergency-alerts/',
    authority: 'NCEMA',
    region: 'UAE',
  },
  // UAE airspace closure (Fox News / Al Jazeera)
  {
    level: 'EXTREME',
    headline: 'UAE AIRSPACE CLOSED — ALL FLIGHTS SUSPENDED',
    headlineAr: 'إغلاق المجال الجوي الإماراتي — تعليق جميع الرحلات',
    body: 'UAE Civil Aviation Authority orders immediate closure of all airspace. All flights at DXB and DWC suspended until further notice. Schools across Dubai adopt distance learning until Mar 4. — Gulf News / Fox News',
    source: 'UAE GCAA / Fox News [C3]',
    sourceUrl: 'https://www.foxnews.com/world/iran-war-uae-airspace-closed',
    authority: 'NCEMA',
    region: 'UAE',
  },
  // Strait of Hormuz closure (Al Jazeera / Fox News)
  {
    level: 'EXTREME',
    headline: 'STRAIT OF HORMUZ DECLARED CLOSED',
    headlineAr: 'إعلان إغلاق مضيق هرمز',
    body: 'Iranian military command has declared the Strait of Hormuz closed to all maritime traffic. Electronic warfare activity detected. Global oil supply disrupted. Oil at $155/barrel. — Al Jazeera / Fox News',
    bodyAr: 'أعلنت القيادة العسكرية الإيرانية إغلاق مضيق هرمز أمام جميع حركة الملاحة البحرية. رُصد نشاط حرب إلكترونية.',
    source: 'Al Jazeera / Fox News [B2/C3]',
    sourceUrl: 'https://www.aljazeera.com/news/2026/3/1/strait-of-hormuz-closed',
    authority: 'COALITION',
    region: 'STRAIT OF HORMUZ',
  },
  // Ballistic missile launch (CENTCOM / IDF)
  {
    level: 'EXTREME',
    headline: 'BALLISTIC MISSILE LAUNCH DETECTED — IRAN',
    body: 'Multiple ballistic missiles launched from western Iran. Arrow-3 and THAAD systems tracking. Impact estimate: 8-12 minutes. Shelter in place immediately.',
    source: 'CENTCOM / IDF [B2]',
    sourceUrl: 'https://www.centcom.mil/MEDIA/PRESS-RELEASES/',
    authority: 'CENTCOM',
    region: 'IRAN → ISRAEL',
  },
  // Kuwait airport hit (Al Jazeera)
  {
    level: 'SEVERE',
    headline: 'KUWAIT AIRPORT HIT BY DRONE — 1 KIA 32 WIA',
    headlineAr: 'إصابة مطار الكويت بطائرة مسيّرة',
    body: '97 ballistic missiles and 283 drones intercepted by Kuwait air defense. Single drone penetrated — Kuwait International Airport damaged. 1 killed, 32 wounded. Flights suspended. — Al Jazeera / Kuwait govt',
    source: 'Al Jazeera / Kuwait govt [A2]',
    sourceUrl: 'https://www.aljazeera.com/news/2026/3/1/kuwait-airport-drone-strike',
    authority: 'NCEMA',
    region: 'KUWAIT',
  },
  // Hezbollah attacks (IDF / Al Jazeera)
  {
    level: 'SEVERE',
    headline: 'HEZBOLLAH ROCKET BARRAGE — NORTHERN ISRAEL',
    body: 'Mass rocket launch from southern Lebanon targeting northern Israeli cities. Iron Dome activating. First attacks since November 2024 ceasefire. 31 killed, 149 wounded in Lebanon from IDF retaliatory strikes. — IDF / Al Jazeera',
    source: 'IDF / Al Jazeera [B2]',
    sourceUrl: 'https://www.aljazeera.com/news/2026/3/1/hezbollah-rockets-northern-israel',
    authority: 'IDF',
    region: 'LEBANON → ISRAEL',
  },
  // Natanz strike (Reuters / IAEA)
  {
    level: 'EXTREME',
    headline: 'NUCLEAR FACILITY STRIKE — NATANZ',
    body: 'Iran IAEA ambassador confirms Natanz enrichment facility targeted. IAEA: no confirmed damage as of Mar 2 but "cannot rule out radiological release." Monitoring ongoing. — Reuters / IAEA',
    source: 'Reuters / IAEA [A2]',
    sourceUrl: 'https://www.reuters.com/world/middle-east/iran-natanz-nuclear-facility-strike-2026-03-02/',
    authority: 'COALITION',
    region: 'IRAN',
  },
  // Friendly fire (Reuters)
  {
    level: 'SEVERE',
    headline: '6 US AIRCREW KIA — FRIENDLY FIRE INCIDENT',
    body: 'F-15E Strike Eagles shot down by Kuwaiti Patriot battery. 6 US aircrew killed. Investigation underway. Coalition air operations continuing. — Reuters',
    source: 'Reuters [A2]',
    sourceUrl: 'https://www.reuters.com/world/middle-east/us-jets-friendly-fire-kuwait-2026-03-01/',
    authority: 'CENTCOM',
    region: 'KUWAIT',
  },
  // Cyber attack
  {
    level: 'SEVERE',
    headline: 'CYBER ATTACK ON COALITION C4ISR NETWORKS',
    body: 'Iranian state-sponsored APT group detected attacking coalition command and control networks. CYBERCOM activating defensive protocols. No operational impact reported.',
    source: 'CYBERCOM [A2]',
    sourceUrl: 'https://www.cybercom.mil/Media/News/',
    authority: 'CENTCOM',
    region: 'CENTCOM AOR',
  },
];

// Load read alert IDs from localStorage to prevent re-showing
function loadReadAlerts(): Set<string> {
  try {
    const stored = localStorage.getItem('roar-read-alerts');
    if (stored) return new Set(JSON.parse(stored));
  } catch { /* ignore */ }
  return new Set();
}

function saveReadAlerts(readSet: Set<string>) {
  try {
    localStorage.setItem('roar-read-alerts', JSON.stringify([...readSet]));
  } catch { /* ignore */ }
}

// Check if a timestamp is from today (within last 24h)
function isToday(ts: number): boolean {
  const now = Date.now();
  return now - ts < 24 * 60 * 60 * 1000;
}

export function useEmergencyAlerts() {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const seenRef = useRef<Set<string>>(new Set());
  const readHeadlinesRef = useRef<Set<string>>(loadReadAlerts());

  // Monitor LIVE headlines only — no mock alerts, no replays
  // Only today's headlines generate alerts
  const checkLiveHeadlines = useCallback(async () => {
    try {
      const res = await fetch(LIVE_API);
      if (!res.ok) return;
      const data = await res.json();
      const headlines: { title: string; source: string; pubDate: string; link?: string }[] = data.items || [];

      const newAlerts: EmergencyAlert[] = [];

      for (const h of headlines) {
        if (seenRef.current.has(h.title)) continue;
        if (readHeadlinesRef.current.has(h.title.toUpperCase())) continue;

        // Only process today's headlines
        const pubTime = h.pubDate ? new Date(h.pubDate).getTime() : 0;
        if (pubTime && !isToday(pubTime)) continue;

        const level = detectAlertLevel(h.title);
        if (!level) continue;

        seenRef.current.add(h.title);
        const region = detectRegion(h.title);
        const timestamp = pubTime || Date.now();

        newAlerts.push({
          id: `ea-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          level,
          headline: h.title.toUpperCase(),
          body: h.title,
          source: `${h.source} [LIVE]`,
          sourceUrl: h.link || undefined,
          authority: detectAuthority(region, h.source),
          timestamp,
          region,
          dismissed: false,
          readAt: null,
          expiresAt: Date.now() + ALERT_DURATION[level],
        });
      }

      if (newAlerts.length > 0) {
        const sorted = newAlerts.sort((a, b) => {
          const order: Record<AlertLevel, number> = { EXTREME: 0, SEVERE: 1, MODERATE: 2 };
          return order[a.level] - order[b.level];
        });
        setAlerts(prev => [...sorted.slice(0, 3), ...prev].slice(0, 20));
      }
    } catch { /* backend offline */ }
  }, []);

  // Poll every 45s for new alert-worthy headlines
  useEffect(() => {
    // First check after 3s, then every 45s
    const timeout = setTimeout(checkLiveHeadlines, 3000);
    const interval = setInterval(checkLiveHeadlines, 45_000);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [checkLiveHeadlines]);

  // Auto-dismiss expired alerts ONLY if they have been read
  useEffect(() => {
    const interval = setInterval(() => {
      setAlerts(prev => {
        const now = Date.now();
        const updated = prev.map(a =>
          // Only auto-dismiss if read AND expired
          !a.dismissed && a.readAt !== null && now > a.expiresAt
            ? { ...a, dismissed: true }
            : a
        );
        if (updated.some((a, i) => a.dismissed !== prev[i].dismissed)) return updated;
        return prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Mark alert as read — operator acknowledges the alert
  const markAsRead = useCallback((id: string) => {
    setAlerts(prev => prev.map(a => {
      if (a.id === id && a.readAt === null) {
        // Persist headline as read so it never re-appears
        readHeadlinesRef.current.add(a.headline);
        saveReadAlerts(readHeadlinesRef.current);
        return { ...a, readAt: Date.now(), expiresAt: Date.now() + 10_000 }; // 10s after read to fade out
      }
      return a;
    }));
  }, []);

  const dismissAlert = useCallback((id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, dismissed: true } : a));
  }, []);

  const dismissAll = useCallback(() => {
    setAlerts(prev => prev.map(a => ({ ...a, dismissed: true })));
  }, []);

  const activeAlerts = alerts.filter(a => !a.dismissed);

  return {
    alerts,
    activeAlerts,
    dismissAlert,
    dismissAll,
    markAsRead,
    activeCount: activeAlerts.length,
  };
}
