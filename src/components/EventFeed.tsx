import { useState, useEffect } from 'react';
import { AlertTriangle, Shield, Crosshair, Cpu, Bomb, Rocket, Tv, Newspaper, Globe, MapPin, Menu, ChevronUp, Wrench, ExternalLink, Satellite, Plane, Radio, Building2, MessageCircle, Search, Zap, ShieldCheck, ShieldAlert, CheckCircle2, XCircle, HelpCircle, Loader2, WifiOff, RefreshCw } from 'lucide-react';
import { useEventFeed } from '../hooks/useEventFeed';
import { useOsintFeed, SOURCE_CONFIG } from '../hooks/useOsintFeed';
import { useLiveuamap } from '../hooks/useLiveuamap';
import type { AttackEvent } from '../data/mockData';
import type { OsintItem, OsintPriority } from '../hooks/useOsintFeed';

type FeedTab = 'events' | 'osint' | 'streams' | 'tools';

const TYPE_CONFIG: Record<string, { icon: typeof AlertTriangle; color: string; bg: string }> = {
  ballistic: { icon: Rocket, color: 'text-orange-400', bg: 'bg-orange-500/20' },
  drone: { icon: Crosshair, color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
  cyber: { icon: Cpu, color: 'text-purple-400', bg: 'bg-purple-500/20' },
  artillery: { icon: Bomb, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  cruise: { icon: Rocket, color: 'text-rose-400', bg: 'bg-rose-500/20' },
  sabotage: { icon: Shield, color: 'text-teal-400', bg: 'bg-teal-500/20' },
};

const STATUS_COLORS: Record<string, string> = {
  intercepted: 'text-green-400 bg-green-500/20 border-green-500/30',
  impact: 'text-red-400 bg-red-500/20 border-red-500/30',
  ongoing: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
  neutralized: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
};

const PRIORITY_STYLES: Record<OsintPriority, string> = {
  flash: 'text-red-400 bg-red-500/20 border-red-500/30',
  immediate: 'text-orange-400 bg-orange-500/20 border-orange-500/30',
  priority: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
  routine: 'text-[var(--palantir-text-muted)] bg-white/5 border-white/10',
};

// ─── FUSION COMBO: 4 primary tools for tightest real-time picture ───
// Verified OSINT Twitter sources aggregated under Intel Fusion
const INTEL_FUSION_SOURCES = [
  { handle: '@CENTCOM', url: 'https://x.com/CENTCOM', label: 'US CENTCOM', color: 'text-green-400', type: 'OFFICIAL' },
  { handle: '@IDF', url: 'https://x.com/IDF', label: 'IDF Official', color: 'text-cyan-400', type: 'OFFICIAL' },
  { handle: '@Conflicts', url: 'https://x.com/Conflicts', label: 'Aurora Intel', color: 'text-amber-400', type: 'AGGREGATOR' },
  { handle: '@IntelCrab', url: 'https://x.com/IntelCrab', label: 'IntelCrab', color: 'text-orange-400', type: 'OSINT' },
  { handle: '@Archer83Able', url: 'https://x.com/Archer83Able', label: 'Archer', color: 'text-orange-400', type: 'OSINT' },
  { handle: '@OSINT_2000s', url: 'https://x.com/OSINT_2000s', label: 'SAT Imagery', color: 'text-purple-400', type: 'IMINT' },
];

const FUSION_COMBO = [
  {
    name: 'Intel Fusion',
    url: '', // Aggregator — no single URL, see INTEL_FUSION_SOURCES
    icon: Radio,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/40',
    glow: 'shadow-red-500/10',
    role: 'MULTI-SOURCE AGGREGATOR',
    desc: 'Verified OSINT Twitter feeds — @CENTCOM, @IDF, @Conflicts, @IntelCrab, @Archer83Able, @OSINT_2000s',
    feeds: ['Strike alerts', 'Intercept reports', 'SAT imagery'],
    isFusionAggregator: true as const,
  },
  {
    name: 'Liveuamap',
    url: 'https://liveuamap.com/en/middleeast',
    icon: Globe,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/40',
    glow: 'shadow-amber-500/10',
    role: 'GEOINT',
    desc: 'Live interactive strike map — all events geolocated in real-time',
    feeds: ['Geolocated strikes', 'Troop movements', 'Airspace events'],
  },
  {
    name: 'ADS-B Exchange',
    url: 'https://globe.adsbexchange.com',
    icon: Plane,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/40',
    glow: 'shadow-blue-500/10',
    role: 'SIGINT / AIS',
    desc: 'Unfiltered military transponders — tankers, AWACS, ISR, fighters over AOR',
    feeds: ['KC-135/KC-46 tanker tracks', 'E-3 AWACS orbits', 'RQ-4 ISR patterns'],
  },
  {
    name: 'Sentinel Hub',
    url: 'https://apps.sentinel-hub.com',
    icon: Satellite,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/40',
    glow: 'shadow-cyan-500/10',
    role: 'IMINT / SAR',
    desc: 'EU Copernicus satellite imagery — BDA, fire detection, infrared analysis',
    feeds: ['Sentinel-2 optical', 'Sentinel-1 SAR', 'Fire/thermal anomaly'],
  },
];

// Cross-ref matrix: govt sources used to validate/filter OSINT claims
const CROSSREF_SOURCES = [
  {
    name: 'CENTCOM',
    url: 'https://x.com/CENTCOM',
    classification: 'A1',
    reliability: 'CONFIRMED',
    color: 'text-green-400',
    icon: CheckCircle2,
    desc: 'Official US strike confirmations — highest reliability for coalition ops',
  },
  {
    name: 'IDF Spokesperson',
    url: 'https://x.com/IDF',
    classification: 'B2',
    reliability: 'PROBABLE',
    color: 'text-cyan-400',
    icon: ShieldCheck,
    desc: 'Israeli operational updates — reliable for IAF/Arrow intercepts, operational bias',
  },
  {
    name: 'Reuters',
    url: 'https://www.reuters.com',
    classification: 'A2',
    reliability: 'VERIFIED',
    color: 'text-orange-400',
    icon: CheckCircle2,
    desc: 'Wire service — gold standard for casualty counts and confirmed events',
  },
  {
    name: 'Al Jazeera',
    url: 'https://www.aljazeera.com',
    classification: 'B2',
    reliability: 'PROBABLE',
    color: 'text-amber-400',
    icon: ShieldCheck,
    desc: 'Regional perspective — strong on Gulf state attacks and civilian impact',
  },
  {
    name: 'IRNA (Iran)',
    url: 'https://en.irna.ir',
    classification: 'D4',
    reliability: 'DOUBTFUL',
    color: 'text-red-400',
    icon: ShieldAlert,
    desc: 'Iranian state media — biased, use for narrative analysis only',
  },
  {
    name: 'IRGC Claims',
    url: '#',
    classification: 'D5',
    reliability: 'UNVERIFIED',
    color: 'text-red-500',
    icon: XCircle,
    desc: '27 bases / USS Lincoln claims — no independent confirmation',
  },
];

// Disinfo filter: key claims cross-referenced against govt sources
const DISINFO_MATRIX: { claim: string; sources: { name: string; status: 'confirmed' | 'denied' | 'unverified' | 'partial' }[]; verdict: 'CONFIRMED' | 'PARTIALLY CONFIRMED' | 'UNVERIFIED' | 'LIKELY DISINFO' }[] = [
  {
    claim: 'Khamenei killed in strikes',
    sources: [
      { name: 'Reuters', status: 'confirmed' },
      { name: 'CENTCOM', status: 'unverified' },
      { name: 'IRNA', status: 'denied' },
    ],
    verdict: 'PARTIALLY CONFIRMED',
  },
  {
    claim: '1,000+ targets hit in 48h',
    sources: [
      { name: 'Reuters', status: 'confirmed' },
      { name: 'CENTCOM', status: 'confirmed' },
    ],
    verdict: 'CONFIRMED',
  },
  {
    claim: '9 Iranian naval ships sunk',
    sources: [
      { name: 'Reuters', status: 'confirmed' },
      { name: 'CENTCOM', status: 'confirmed' },
    ],
    verdict: 'CONFIRMED',
  },
  {
    claim: 'IRGC hit USS Abraham Lincoln',
    sources: [
      { name: 'IRGC', status: 'confirmed' },
      { name: 'CENTCOM', status: 'denied' },
      { name: 'Reuters', status: 'unverified' },
    ],
    verdict: 'LIKELY DISINFO',
  },
  {
    claim: '27 US bases targeted',
    sources: [
      { name: 'IRGC', status: 'confirmed' },
      { name: 'CENTCOM', status: 'partial' },
      { name: 'Al Jazeera', status: 'partial' },
    ],
    verdict: 'PARTIALLY CONFIRMED',
  },
  {
    claim: '158 students killed in Minab',
    sources: [
      { name: 'IRNA', status: 'confirmed' },
      { name: 'Reuters', status: 'unverified' },
      { name: 'CENTCOM', status: 'denied' },
    ],
    verdict: 'UNVERIFIED',
  },
  {
    claim: 'Strait of Hormuz closed',
    sources: [
      { name: 'Al Jazeera', status: 'confirmed' },
      { name: 'CENTCOM', status: 'partial' },
    ],
    verdict: 'PARTIALLY CONFIRMED',
  },
  {
    claim: 'Natanz nuclear site targeted',
    sources: [
      { name: 'IAEA', status: 'confirmed' },
      { name: 'Reuters', status: 'confirmed' },
      { name: 'CENTCOM', status: 'unverified' },
    ],
    verdict: 'CONFIRMED',
  },
];

const VERDICT_STYLES: Record<string, string> = {
  'CONFIRMED': 'text-green-400 bg-green-500/20 border-green-500/30',
  'PARTIALLY CONFIRMED': 'text-amber-400 bg-amber-500/20 border-amber-500/30',
  'UNVERIFIED': 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
  'LIKELY DISINFO': 'text-red-400 bg-red-500/20 border-red-500/30',
};

const SOURCE_STATUS_ICON: Record<string, { icon: typeof CheckCircle2; color: string }> = {
  confirmed: { icon: CheckCircle2, color: 'text-green-400' },
  denied: { icon: XCircle, color: 'text-red-400' },
  unverified: { icon: HelpCircle, color: 'text-yellow-400' },
  partial: { icon: ShieldAlert, color: 'text-amber-400' },
};

// Other OSINT tools (secondary)
const OTHER_TOOLS = [
  {
    category: 'REAL-TIME INTEL',
    icon: Radio,
    color: 'text-red-400',
    borderColor: 'border-red-500/30',
    tools: [
      { name: '@Conflicts (Aurora Intel)', url: 'https://x.com/Conflicts', desc: 'Top neutral aggregator — fastest conflict updates' },
      { name: '@IntelCrab', url: 'https://x.com/IntelCrab', desc: 'Verified community OSINT — strike alerts' },
      { name: '@Archer83Able', url: 'https://x.com/Archer83Able', desc: 'Verified community OSINT — BDA + analysis' },
      { name: '@OSINT_2000s', url: 'https://x.com/OSINT_2000s', desc: 'Satellite imagery analysis' },
      { name: '@sentdefender', url: 'https://x.com/sentdefender', desc: 'Rapid strike notifications' },
    ],
  },
  {
    category: 'FLIGHT / SAT',
    icon: Plane,
    color: 'text-blue-400',
    borderColor: 'border-blue-500/30',
    tools: [
      { name: 'Flightradar24', url: 'https://www.flightradar24.com', desc: 'Civil airspace closures' },
      { name: 'Planet Labs', url: 'https://www.planet.com', desc: 'Commercial sat, daily refresh' },
      { name: 'Zoom Earth', url: 'https://zoom.earth', desc: 'Weather + flight overlay' },
    ],
  },
  {
    category: 'TELEGRAM',
    icon: MessageCircle,
    color: 'text-purple-400',
    borderColor: 'border-purple-500/30',
    tools: [
      { name: 'ME Spectator', url: 'https://t.me/Middle_East_Spectator', desc: 'Arab/Persian sources' },
      { name: 'Intel Slava Z', url: 'https://t.me/inlovaZ', desc: 'RU perspective — biased' },
    ],
  },
  {
    category: 'ANALYSIS',
    icon: Search,
    color: 'text-amber-400',
    borderColor: 'border-amber-500/30',
    tools: [
      { name: 'Bellingcat', url: 'https://www.bellingcat.com', desc: 'Forensic analysis + debunking' },
      { name: 'ACLED Crisis Map', url: 'https://acleddata.com/dashboard', desc: 'Conflict event database' },
      { name: 'ISW Iran', url: 'https://www.understandingwar.org', desc: 'Strategic analysis, daily' },
    ],
  },
];

function ToolsView() {
  const [showCrossRef, setShowCrossRef] = useState(true);
  const [showOtherTools, setShowOtherTools] = useState(false);
  const [showLiveFeed, setShowLiveFeed] = useState(true);
  const liveuamap = useLiveuamap('middleeast', 15);

  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-0 scrollbar-hide">
      {/* ─── FUSION COMBO HEADER ─── */}
      <div className="px-2.5 py-2 rounded-lg bg-gradient-to-r from-amber-500/10 via-red-500/5 to-cyan-500/10 border border-amber-500/40">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">FUSION COMBO</span>
          <span className="text-[8px] font-mono text-[var(--palantir-text-muted)] bg-amber-500/20 px-1.5 rounded">4 TOOLS</span>
          <span className="text-[8px] font-mono text-green-400 ml-auto">ACTIVE</span>
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        </div>
        <p className="text-[8px] font-mono text-[var(--palantir-text-muted)] leading-relaxed">
          Tightest real-time picture — SIGINT + GEOINT + IMINT fused. Cross-ref govt sources to filter disinfo.
        </p>
      </div>

      {/* ─── LIVEUAMAP LIVE FEED ─── */}
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 overflow-hidden">
        <button
          onClick={() => setShowLiveFeed(!showLiveFeed)}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-white/5 transition-colors"
        >
          <Globe className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-wider">LIVEUAMAP FEED</span>
          {liveuamap.loading ? (
            <Loader2 className="w-3 h-3 text-amber-400 animate-spin" />
          ) : liveuamap.error ? (
            <>
              <WifiOff className="w-3 h-3 text-red-400" />
              <span className="text-[7px] font-mono text-red-400">OFFLINE</span>
            </>
          ) : (
            <>
              <span className="text-[7px] font-mono text-[var(--palantir-text-muted)] bg-amber-500/20 px-1.5 rounded">{liveuamap.events.length} EVENTS</span>
              {liveuamap.cached && <span className="text-[6px] font-mono text-yellow-400">CACHED</span>}
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse ml-auto" />
              <span className="text-[7px] font-mono text-green-400">LIVE</span>
            </>
          )}
          <ChevronUp className={`w-3 h-3 text-amber-400 ${!liveuamap.error && !liveuamap.loading ? '' : 'ml-auto'} transition-transform ${showLiveFeed ? '' : 'rotate-180'}`} />
        </button>

        {showLiveFeed && (
          <div className="px-2 pb-2 space-y-1">
            {liveuamap.loading && (
              <div className="flex items-center justify-center gap-2 py-3">
                <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                <span className="text-[9px] font-mono text-[var(--palantir-text-muted)]">Connecting to Liveuamap API...</span>
              </div>
            )}

            {liveuamap.error && (
              <div className="flex items-center gap-2 px-2.5 py-2 rounded bg-red-500/10 border border-red-500/20">
                <WifiOff className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] font-mono text-red-400 font-bold">API CONNECTION FAILED</span>
                  <p className="text-[8px] font-mono text-[var(--palantir-text-muted)]">{liveuamap.error}</p>
                  <p className="text-[7px] font-mono text-[var(--palantir-text-muted)] mt-0.5">Ensure backend server is running on port 3001. Use manual links below.</p>
                </div>
              </div>
            )}

            {!liveuamap.loading && !liveuamap.error && liveuamap.events.length === 0 && (
              <div className="text-center py-3">
                <span className="text-[9px] font-mono text-[var(--palantir-text-muted)]">No events returned — API key may need activation</span>
              </div>
            )}

            {liveuamap.events.slice(0, 8).map((evt) => (
              <div key={evt.id} className="flex items-start gap-2 px-2 py-1.5 rounded bg-black/20 border border-[var(--palantir-border)]/20 hover:border-amber-500/30 transition-all group">
                <MapPin className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-mono text-[var(--palantir-text)] leading-tight truncate group-hover:text-white">{evt.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[7px] font-mono text-[var(--palantir-text-muted)]">{evt.lat.toFixed(2)}°N {evt.lng.toFixed(2)}°E</span>
                    {evt.time && <span className="text-[7px] font-mono text-amber-400/60">{evt.time}</span>}
                    {evt.source && evt.source !== 'liveuamap' && (
                      <span className="text-[6px] font-mono text-[var(--palantir-text-muted)] bg-white/5 px-1 rounded">{evt.source}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {liveuamap.events.length > 8 && (
              <div className="text-center pt-0.5">
                <a href="https://liveuamap.com/en/middleeast" target="_blank" rel="noopener noreferrer"
                  className="text-[7px] font-mono text-amber-400 hover:text-amber-300">
                  +{liveuamap.events.length - 8} more — open full map
                </a>
              </div>
            )}

            {liveuamap.lastFetch && (
              <div className="flex items-center gap-1.5 px-1 pt-0.5 border-t border-amber-500/10">
                <RefreshCw className="w-2.5 h-2.5 text-[var(--palantir-text-muted)]" />
                <span className="text-[6px] font-mono text-[var(--palantir-text-muted)]">
                  Last update: {new Date(liveuamap.lastFetch).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} — auto-refresh 90s
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── 4 FUSION TOOLS ─── */}
      <div className="grid grid-cols-2 gap-1.5">
        {FUSION_COMBO.map((tool) => {
          const Icon = tool.icon;
          // Intel Fusion is an aggregator — render with source links, not as a single <a>
          if (tool.isFusionAggregator) {
            return (
              <div
                key={tool.name}
                className={`flex flex-col gap-1.5 px-2.5 py-2 rounded-lg ${tool.bg} border ${tool.border} shadow-lg ${tool.glow}`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${tool.color}`} />
                  <div className="flex-1 min-w-0">
                    <span className={`text-[10px] font-mono font-bold ${tool.color}`}>{tool.name}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[7px] font-mono text-[var(--palantir-text-muted)] uppercase tracking-widest">{tool.role}</span>
                      <span className="text-[6px] font-mono text-green-400 bg-green-500/20 px-1 rounded">{INTEL_FUSION_SOURCES.length} FEEDS</span>
                    </div>
                  </div>
                </div>
                {/* Verified source grid */}
                <div className="grid grid-cols-2 gap-0.5">
                  {INTEL_FUSION_SOURCES.map((src) => (
                    <a
                      key={src.handle}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/30 hover:bg-white/10 transition-all group/src"
                    >
                      <div className={`w-1 h-1 rounded-full ${src.color.replace('text-', 'bg-')}`} />
                      <span className={`text-[7px] font-mono ${src.color} group-hover/src:text-white truncate`}>{src.handle}</span>
                      <span className="text-[5px] font-mono text-[var(--palantir-text-muted)] bg-white/5 px-0.5 rounded ml-auto">{src.type}</span>
                    </a>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1">
                  {tool.feeds.map((feed) => (
                    <span key={feed} className="text-[7px] font-mono text-[var(--palantir-text-muted)] bg-white/5 px-1 py-0.5 rounded">{feed}</span>
                  ))}
                </div>
              </div>
            );
          }
          return (
            <a
              key={tool.name}
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex flex-col gap-1.5 px-2.5 py-2 rounded-lg ${tool.bg} border ${tool.border} hover:bg-white/10 transition-all group cursor-pointer shadow-lg ${tool.glow}`}
            >
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${tool.color}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-mono font-bold ${tool.color}`}>{tool.name}</span>
                    <ExternalLink className="w-2.5 h-2.5 text-[var(--palantir-text-muted)] group-hover:text-white/60" />
                  </div>
                  <span className="text-[7px] font-mono text-[var(--palantir-text-muted)] uppercase tracking-widest">{tool.role}</span>
                </div>
              </div>
              <p className="text-[8px] font-mono text-[var(--palantir-text-muted)] leading-relaxed line-clamp-2">{tool.desc}</p>
              <div className="flex flex-wrap gap-1">
                {tool.feeds.map((feed) => (
                  <span key={feed} className="text-[7px] font-mono text-[var(--palantir-text-muted)] bg-white/5 px-1 py-0.5 rounded">{feed}</span>
                ))}
              </div>
            </a>
          );
        })}
      </div>

      {/* ─── CROSS-REF / DISINFO FILTER ─── */}
      <div className="rounded-lg border border-green-500/30 bg-green-500/5 overflow-hidden">
        <button
          onClick={() => setShowCrossRef(!showCrossRef)}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-white/5 transition-colors"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
          <span className="text-[9px] font-mono font-bold text-green-400 uppercase tracking-wider">CROSS-REF DISINFO FILTER</span>
          <span className="text-[7px] font-mono text-[var(--palantir-text-muted)] bg-green-500/20 px-1.5 rounded">{DISINFO_MATRIX.length} CLAIMS</span>
          <ChevronUp className={`w-3 h-3 text-green-400 ml-auto transition-transform ${showCrossRef ? '' : 'rotate-180'}`} />
        </button>

        {showCrossRef && (
          <div className="px-2 pb-2 space-y-1.5">
            {/* Source reliability legend */}
            <div className="flex items-center gap-3 px-1 py-1 border-b border-green-500/20">
              <span className="text-[7px] font-mono text-[var(--palantir-text-muted)] uppercase">SOURCES:</span>
              {CROSSREF_SOURCES.slice(0, 4).map((src) => {
                const SrcIcon = src.icon;
                return (
                  <a key={src.name} href={src.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:opacity-80">
                    <SrcIcon className={`w-2.5 h-2.5 ${src.color}`} />
                    <span className={`text-[7px] font-mono ${src.color}`}>{src.name}</span>
                    <span className="text-[6px] font-mono text-[var(--palantir-text-muted)]">[{src.classification}]</span>
                  </a>
                );
              })}
            </div>

            {/* Claims matrix */}
            {DISINFO_MATRIX.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 px-2 py-1.5 rounded bg-black/20 border border-[var(--palantir-border)]/20">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[9px] font-mono text-[var(--palantir-text)] font-bold truncate">{item.claim}</span>
                    <span className={`text-[7px] font-mono px-1.5 py-0.5 rounded border whitespace-nowrap ${VERDICT_STYLES[item.verdict]}`}>
                      {item.verdict}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {item.sources.map((src) => {
                      const statusCfg = SOURCE_STATUS_ICON[src.status];
                      const StatusIcon = statusCfg.icon;
                      return (
                        <div key={src.name} className="flex items-center gap-0.5">
                          <StatusIcon className={`w-2.5 h-2.5 ${statusCfg.color}`} />
                          <span className="text-[7px] font-mono text-[var(--palantir-text-muted)]">{src.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}

            {/* Disinfo stats */}
            <div className="flex items-center gap-3 px-2 pt-1 border-t border-green-500/20">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5 text-green-400" />
                <span className="text-[7px] font-mono text-green-400">{DISINFO_MATRIX.filter(d => d.verdict === 'CONFIRMED').length} CONFIRMED</span>
              </div>
              <div className="flex items-center gap-1">
                <ShieldAlert className="w-2.5 h-2.5 text-amber-400" />
                <span className="text-[7px] font-mono text-amber-400">{DISINFO_MATRIX.filter(d => d.verdict === 'PARTIALLY CONFIRMED').length} PARTIAL</span>
              </div>
              <div className="flex items-center gap-1">
                <HelpCircle className="w-2.5 h-2.5 text-yellow-400" />
                <span className="text-[7px] font-mono text-yellow-400">{DISINFO_MATRIX.filter(d => d.verdict === 'UNVERIFIED').length} UNVERIFIED</span>
              </div>
              <div className="flex items-center gap-1">
                <XCircle className="w-2.5 h-2.5 text-red-400" />
                <span className="text-[7px] font-mono text-red-400">{DISINFO_MATRIX.filter(d => d.verdict === 'LIKELY DISINFO').length} DISINFO</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── OTHER TOOLS (collapsible) ─── */}
      <div className="rounded-lg border border-[var(--palantir-border)] bg-black/20 overflow-hidden">
        <button
          onClick={() => setShowOtherTools(!showOtherTools)}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-white/5 transition-colors"
        >
          <Wrench className="w-3 h-3 text-[var(--palantir-text-muted)]" />
          <span className="text-[9px] font-mono font-bold text-[var(--palantir-text-muted)] uppercase tracking-wider">OTHER OSINT TOOLS</span>
          <span className="text-[7px] font-mono text-[var(--palantir-text-muted)] bg-white/5 px-1.5 rounded">{OTHER_TOOLS.reduce((a, s) => a + s.tools.length, 0)}</span>
          <ChevronUp className={`w-3 h-3 text-[var(--palantir-text-muted)] ml-auto transition-transform ${showOtherTools ? '' : 'rotate-180'}`} />
        </button>

        {showOtherTools && (
          <div className="px-2 pb-2 space-y-1.5">
            {OTHER_TOOLS.map((section) => {
              const SectionIcon = section.icon;
              return (
                <div key={section.category} className="space-y-0.5">
                  <div className="flex items-center gap-1.5 px-1 pt-1">
                    <SectionIcon className={`w-2.5 h-2.5 ${section.color}`} />
                    <span className={`text-[7px] font-mono font-bold ${section.color} uppercase tracking-wider`}>{section.category}</span>
                  </div>
                  {section.tools.map((tool) => (
                    <a
                      key={tool.name}
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-2 px-2 py-1 rounded bg-black/20 border ${section.borderColor} hover:bg-white/5 transition-all group cursor-pointer`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[8px] font-mono font-bold text-[var(--palantir-text)] group-hover:text-white">{tool.name}</span>
                          <ExternalLink className="w-2 h-2 text-[var(--palantir-text-muted)]" />
                        </div>
                        <p className="text-[7px] font-mono text-[var(--palantir-text-muted)] truncate">{tool.desc}</p>
                      </div>
                    </a>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function EventRow({ event }: { event: AttackEvent }) {
  const config = TYPE_CONFIG[event.type] || TYPE_CONFIG.ballistic;
  const Icon = config.icon;
  const statusClass = STATUS_COLORS[event.status] || STATUS_COLORS.ongoing;
  const time = new Date(event.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="flex items-start gap-2 px-2.5 py-2 rounded-lg bg-black/20 border border-[var(--palantir-border)]/30 hover:border-[var(--palantir-border)] transition-all group animate-fade-in">
      <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${config.bg}`}>
        <Icon className={`w-3 h-3 ${config.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border ${statusClass}`}>
            {event.status}
          </span>
          <span className={`text-[9px] font-mono ${config.color} uppercase`}>{event.type}</span>
          {/* Clickable source badge */}
          {event.source && (
            event.sourceUrl ? (
              <a
                href={event.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-0.5 text-[8px] font-mono text-cyan-400/80 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 px-1.5 py-0.5 rounded border border-cyan-500/20 hover:border-cyan-500/40 transition-all cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-2.5 h-2.5" />
                {event.source}
              </a>
            ) : (
              <span className="text-[8px] font-mono text-cyan-400/60 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                {event.source}
              </span>
            )
          )}
          <span className="text-[9px] font-mono text-[var(--palantir-text-muted)] ml-auto tabular-nums">{time}</span>
        </div>
        <p className="text-[10px] text-[var(--palantir-text-muted)] leading-relaxed truncate group-hover:text-[var(--palantir-text)] transition-colors">
          {event.details}
        </p>
      </div>
    </div>
  );
}

function OsintRow({ item }: { item: OsintItem }) {
  const srcConfig = SOURCE_CONFIG[item.source];
  const priorityClass = PRIORITY_STYLES[item.priority];
  const time = new Date(item.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`px-2.5 py-2 rounded-lg bg-black/20 border border-[var(--palantir-border)]/30 hover:border-[var(--palantir-border)] transition-all group animate-fade-in ${item.priority === 'flash' ? 'ring-1 ring-red-500/20' : ''}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className={`text-[8px] font-mono font-bold ${srcConfig.color}`}>{srcConfig.label}</span>
        <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded border ${priorityClass}`}>
          {item.priority.toUpperCase()}
        </span>
        <div className="flex items-center gap-1 ml-auto">
          <MapPin className="w-2.5 h-2.5 text-[var(--palantir-text-muted)]" />
          <span className="text-[8px] font-mono text-[var(--palantir-text-muted)]">{item.region}</span>
          <span className="text-[8px] font-mono text-[var(--palantir-text-muted)]">{time}</span>
        </div>
      </div>
      <p className="text-[10px] font-semibold text-[var(--palantir-text)] leading-tight mb-0.5 truncate">
        {item.title}
      </p>
      <p className="text-[9px] text-[var(--palantir-text-muted)] leading-relaxed truncate group-hover:text-[var(--palantir-text)] transition-colors">
        {item.summary}
      </p>
    </div>
  );
}

function StreamsView() {
  return (
    <div className="flex-1 flex gap-2 p-2 min-h-0">
      {/* Fox News */}
      <div className="flex-1 flex flex-col bg-black rounded-lg overflow-hidden border border-[var(--palantir-border)]/50">
        <div className="flex items-center gap-1.5 px-2 py-1 bg-black/80 border-b border-[var(--palantir-border)]/30 flex-shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[9px] font-mono font-bold text-blue-400">FOX NEWS</span>
          <span className="text-[8px] font-mono text-[var(--palantir-text-muted)] bg-white/5 px-1 rounded">US</span>
          <span className="text-[8px] font-mono text-red-400 ml-auto">LIVE</span>
        </div>
        <div className="flex-1 relative min-h-0">
          <iframe
            src="https://www.youtube.com/embed/R_lRjToLD3U?autoplay=1&mute=1"
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Fox News Live"
            loading="lazy"
          />
        </div>
      </div>
      {/* Al Jazeera */}
      <div className="flex-1 flex flex-col bg-black rounded-lg overflow-hidden border border-[var(--palantir-border)]/50">
        <div className="flex items-center gap-1.5 px-2 py-1 bg-black/80 border-b border-[var(--palantir-border)]/30 flex-shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[9px] font-mono font-bold text-amber-400">AL JAZEERA</span>
          <span className="text-[8px] font-mono text-[var(--palantir-text-muted)] bg-white/5 px-1 rounded">QA</span>
          <span className="text-[8px] font-mono text-red-400 ml-auto">LIVE</span>
        </div>
        <div className="flex-1 relative min-h-0">
          <iframe
            src="https://www.youtube.com/embed/gCNeDWCI0vo?autoplay=1&mute=1"
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Al Jazeera Live"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}

export function EventFeed() {
  const events = useEventFeed(30);
  const osintItems = useOsintFeed(20);
  const [activeTab, setActiveTab] = useState<FeedTab>(() => {
    try { const s = localStorage.getItem('roar-feed-tab'); if (s === 'events' || s === 'osint' || s === 'streams' || s === 'tools') return s as FeedTab; } catch {} return 'events';
  });
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('roar-feed-collapsed') === 'true'; } catch {} return false;
  });

  useEffect(() => { localStorage.setItem('roar-feed-tab', activeTab); }, [activeTab]);
  useEffect(() => { localStorage.setItem('roar-feed-collapsed', String(collapsed)); }, [collapsed]);

  const tabs: { id: FeedTab; label: string; icon: typeof AlertTriangle; count?: number }[] = [
    { id: 'events', label: 'EVENTS', icon: AlertTriangle, count: events.length },
    { id: 'osint', label: 'OSINT', icon: Newspaper, count: osintItems.length },
    { id: 'streams', label: 'LIVE TV', icon: Tv },
    { id: 'tools', label: 'TOOLS', icon: Wrench },
  ];

  return (
    <div className="flex flex-col h-full bg-[var(--palantir-surface)] border border-[var(--palantir-border)] rounded-lg overflow-hidden">
      {/* Header with tabs */}
      <div className="px-2 py-1.5 border-b border-[var(--palantir-border)] flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-white/5 transition-colors"
          title={collapsed ? 'Expand panel' : 'Collapse panel'}
        >
          {collapsed ? <Menu className="w-3.5 h-3.5 text-amber-400" /> : <ChevronUp className="w-3.5 h-3.5 text-amber-400" />}
        </button>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setCollapsed(false); }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] font-mono uppercase tracking-wider transition-all ${
                isActive
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'text-[var(--palantir-text-muted)] hover:text-[var(--palantir-text)] hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon className={`w-3 h-3 ${isActive && tab.id === 'events' ? 'animate-pulse text-red-400' : isActive && tab.id === 'streams' ? 'text-red-400' : ''}`} />
              {tab.label}
              {tab.count !== undefined && (
                <span className={`text-[8px] px-1 rounded ${isActive ? 'bg-amber-500/30' : 'bg-white/5'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}

        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[9px] font-mono text-red-400">LIVE</span>
        </div>
      </div>

      {/* Tab content */}
      {!collapsed && activeTab === 'events' && (
        <div className="flex-1 overflow-y-auto p-2 space-y-1 min-h-0 scrollbar-hide">
          {events.map((event) => (
            <EventRow key={event.id} event={event} />
          ))}
        </div>
      )}

      {!collapsed && activeTab === 'osint' && (
        <div className="flex-1 min-h-0 flex flex-col">
          {/* Source legend */}
          <div className="px-2 py-1 border-b border-[var(--palantir-border)]/30 flex items-center gap-2 flex-wrap flex-shrink-0">
            <Globe className="w-3 h-3 text-[var(--palantir-text-muted)]" />
            {Object.entries(SOURCE_CONFIG).map(([key, cfg]) => (
              <span key={key} className={`text-[8px] font-mono ${cfg.color}`}>{cfg.label}</span>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 min-h-0 scrollbar-hide">
            {osintItems.map((item) => (
              <OsintRow key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {!collapsed && activeTab === 'streams' && <StreamsView />}

      {!collapsed && activeTab === 'tools' && <ToolsView />}

      {collapsed && (
        <div className="px-3 py-2 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[9px] font-mono text-[var(--palantir-text-muted)]">{events.length} events — {osintItems.length} OSINT — LIVE</span>
        </div>
      )}
    </div>
  );
}
