import { useState, useEffect, useCallback } from 'react';
import { Activity, Target, Bomb, Cpu, Flame, Rocket, Shield, Plane, Crosshair, Eye, Menu, ChevronDown, ChevronUp, Wifi, Lock, Database, Terminal } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { useRealtimeStats } from '../hooks/useRealtimeStats';
import type { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: number | string;
  color: string;
  bgColor: string;
  pulse?: boolean;
  small?: boolean;
}

function StatCard({ icon, label, value, color, bgColor, pulse, small }: StatCardProps) {
  return (
    <div className={`flex items-center justify-between px-3 ${small ? 'py-1.5' : 'py-2'} rounded-lg bg-black/30 border border-[var(--palantir-border)]/50 hover:border-[var(--palantir-border)] transition-colors group`}>
      <div className="flex items-center gap-2">
        <div className={`w-6 h-6 rounded flex items-center justify-center ${bgColor}`}>
          {icon}
        </div>
        <span className="text-[10px] font-mono text-[var(--palantir-text-muted)] uppercase tracking-wider">
          {label}
        </span>
      </div>
      <span className={`font-mono font-bold ${small ? 'text-sm' : 'text-lg'} ${color} ${pulse ? 'animate-pulse' : ''} tabular-nums`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </span>
    </div>
  );
}

// Day 3 (Mar 3, 2026) — Verified allied data
// Sources: Reuters, Al Jazeera, IDF, Fox News ONLY
const ALLIED_FEEDS = [
  {
    id: 'usa',
    name: 'USA',
    flag: '🇺🇸',
    color: 'text-blue-400',
    borderColor: 'border-blue-500/30',
    bgColor: 'from-blue-500/10',
    stats: [
      { label: 'TARGETS HIT', value: '1,000+', icon: Target, color: 'text-orange-400', bg: 'bg-orange-500/20' },
      { label: 'SHIPS SUNK', value: 9, icon: Crosshair, color: 'text-red-400', bg: 'bg-red-500/20' },
      { label: 'NAVAL HQ', value: 'DESTROYED', icon: Bomb, color: 'text-red-400', bg: 'bg-red-500/20' },
      { label: 'KIA', value: 6, icon: Target, color: 'text-red-400', bg: 'bg-red-500/20' },
    ],
    source: 'Reuters [A2]',
  },
  {
    id: 'israel',
    name: 'ISRAEL',
    flag: '🇮🇱',
    color: 'text-cyan-400',
    borderColor: 'border-cyan-500/30',
    bgColor: 'from-cyan-500/10',
    stats: [
      { label: 'MUNITIONS DROPPED', value: '1,200+', icon: Bomb, color: 'text-orange-400', bg: 'bg-orange-500/20' },
      { label: 'PROVINCES HIT', value: '24/31', icon: Crosshair, color: 'text-red-400', bg: 'bg-red-500/20' },
      { label: 'STRIKE OPS', value: '30+', icon: Plane, color: 'text-blue-400', bg: 'bg-blue-500/20' },
      { label: 'KIA', value: 9, icon: Target, color: 'text-red-400', bg: 'bg-red-500/20' },
      { label: 'WIA', value: 121, icon: Target, color: 'text-orange-400', bg: 'bg-orange-500/20' },
    ],
    source: 'IDF [B2]',
  },
  {
    id: 'uae',
    name: 'UAE',
    flag: '🇦🇪',
    color: 'text-red-400',
    borderColor: 'border-red-500/30',
    bgColor: 'from-red-500/10',
    stats: [
      { label: 'BM FIRED AT', value: 165, icon: Rocket, color: 'text-orange-400', bg: 'bg-orange-500/20' },
      { label: 'CRUISE FIRED AT', value: 2, icon: Rocket, color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
      { label: 'DRONES FIRED AT', value: 541, icon: Plane, color: 'text-blue-400', bg: 'bg-blue-500/20' },
      { label: 'DRONES PENETRATED', value: 21, icon: Crosshair, color: 'text-red-400', bg: 'bg-red-500/20' },
      { label: 'KIA', value: 3, icon: Target, color: 'text-red-400', bg: 'bg-red-500/20' },
      { label: 'WIA', value: 58, icon: Target, color: 'text-orange-400', bg: 'bg-orange-500/20' },
    ],
    source: 'Al Jazeera / UAE MoD [A2]',
  },
  {
    id: 'kuwait',
    name: 'KUWAIT',
    flag: '🇰🇼',
    color: 'text-green-400',
    borderColor: 'border-green-500/30',
    bgColor: 'from-green-500/10',
    stats: [
      { label: 'BM INTERCEPTED', value: 97, icon: Shield, color: 'text-green-400', bg: 'bg-green-500/20' },
      { label: 'DRONES INTERCEPTED', value: 283, icon: Plane, color: 'text-blue-400', bg: 'bg-blue-500/20' },
      { label: 'KIA', value: 1, icon: Target, color: 'text-red-400', bg: 'bg-red-500/20' },
      { label: 'WIA', value: 32, icon: Target, color: 'text-orange-400', bg: 'bg-orange-500/20' },
    ],
    source: 'Al Jazeera / Kuwait govt [A2]',
  },
  {
    id: 'bahrain',
    name: 'BAHRAIN',
    flag: '🇧🇭',
    color: 'text-yellow-400',
    borderColor: 'border-yellow-500/30',
    bgColor: 'from-yellow-500/10',
    stats: [
      { label: 'MISSILES INTERCEPTED', value: 45, icon: Shield, color: 'text-green-400', bg: 'bg-green-500/20' },
      { label: 'DRONES INTERCEPTED', value: 9, icon: Plane, color: 'text-blue-400', bg: 'bg-blue-500/20' },
      { label: 'KIA', value: 1, icon: Target, color: 'text-red-400', bg: 'bg-red-500/20' },
      { label: 'WIA', value: 4, icon: Target, color: 'text-orange-400', bg: 'bg-orange-500/20' },
    ],
    source: 'Al Jazeera [B2]',
  },
  {
    id: 'ksa',
    name: 'KSA',
    flag: '🇸🇦',
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    bgColor: 'from-emerald-500/10',
    stats: [
      { label: 'PSAB STATUS', value: 'HIGH ALERT', icon: Shield, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
      { label: 'CONFIRMED ATTACKS', value: 'NIL', icon: Target, color: 'text-[var(--palantir-text-muted)]', bg: 'bg-white/5' },
      { label: '27 US BASES TGT [D5]', value: 'IRGC CLAIM', icon: Rocket, color: 'text-orange-400', bg: 'bg-orange-500/20' },
    ],
    source: 'NO VERIFIED SOURCE — IRGC claim only [D5]',
  },
  {
    id: 'qatar',
    name: 'QATAR',
    flag: '🇶🇦',
    color: 'text-purple-400',
    borderColor: 'border-purple-500/30',
    bgColor: 'from-purple-500/10',
    stats: [
      { label: 'MISSILES INTERCEPTED', value: 65, icon: Shield, color: 'text-green-400', bg: 'bg-green-500/20' },
      { label: 'DRONES INTERCEPTED', value: 12, icon: Plane, color: 'text-blue-400', bg: 'bg-blue-500/20' },
      { label: 'WIA', value: 16, icon: Target, color: 'text-orange-400', bg: 'bg-orange-500/20' },
    ],
    source: 'Al Jazeera [B2]',
  },
];

// Cyber operations metrics — Operation Epic Fury / Roar of the Lion
// Verified: Electronic warfare in Strait of Hormuz (Fox News)
// Verified: Iranian state broadcaster struck and dismantled (IDF)
// Iranian APT group names from public threat intel reporting
const CYBER_METRICS = {
  allied: {
    label: 'ALLIED CYBER/EW OPS',
    color: 'text-green-400',
    ops: [
      { label: 'EW Strait of Hormuz', value: 1, desc: 'Electronic warfare activity confirmed (Fox News)' },
      { label: 'State Broadcaster', value: 1, desc: 'Iranian state broadcaster struck and dismantled (IDF)' },
    ],
  },
  iranian: {
    label: 'IRANIAN CYBER THREATS',
    color: 'text-red-400',
    groups: [
      { name: 'CyberAv3ngers', target: 'US/GCC water & power SCADA', status: 'active', severity: 'critical' },
      { name: 'APT42 (Charming Kitten)', target: 'US/IL govt credentials phishing', status: 'active', severity: 'high' },
      { name: 'MuddyWater', target: 'GCC telecom/energy backdoors', status: 'active', severity: 'high' },
      { name: 'Void Manticore (Storm-842)', target: 'Israeli infrastructure wiper', status: 'active', severity: 'critical' },
      { name: 'Cotton Sandstorm', target: 'US social media disinfo ops', status: 'active', severity: 'high' },
    ],
  },
};

function CyberThreatRow({ group }: { group: typeof CYBER_METRICS.iranian.groups[0] }) {
  const sevColor = group.severity === 'critical' ? 'text-red-400 bg-red-500/20 border-red-500/30'
    : group.severity === 'high' ? 'text-orange-400 bg-orange-500/20 border-orange-500/30'
    : 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
  const statusColor = group.status === 'active' ? 'text-red-400' : 'text-yellow-400';

  return (
    <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-black/30 border border-[var(--palantir-border)]/30">
      <Terminal className="w-3 h-3 text-red-400 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-mono font-bold text-[var(--palantir-text)] truncate">{group.name}</span>
          <span className={`text-[7px] font-mono px-1 py-0 rounded border ${sevColor}`}>{group.severity.toUpperCase()}</span>
        </div>
        <div className="text-[8px] font-mono text-[var(--palantir-text-muted)] truncate">{group.target}</div>
      </div>
      <div className="flex items-center gap-1">
        <div className={`w-1.5 h-1.5 rounded-full ${group.status === 'active' ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'}`} />
        <span className={`text-[8px] font-mono ${statusColor}`}>{group.status.toUpperCase()}</span>
      </div>
    </div>
  );
}

export function AttackStatsPanel() {
  const { stats, history, interceptRate } = useRealtimeStats();
  const [metricsOpen, setMetricsOpen] = useState(() => {
    try { return localStorage.getItem('roar-metrics-open') === 'true'; } catch {} return false;
  });
  const [alliedOpen, setAlliedOpen] = useState<Record<string, boolean>>(() => {
    try { const s = localStorage.getItem('roar-allied-open'); if (s) return JSON.parse(s); } catch {} return {};
  });
  const [coalitionOpen, setCoalitionOpen] = useState(() => {
    try { return localStorage.getItem('roar-coalition-open') === 'true'; } catch {} return false;
  });
  const [cyberOpen, setCyberOpen] = useState(() => {
    try { return localStorage.getItem('roar-cyber-open') === 'true'; } catch {} return false;
  });
  const [cyberPulse, setCyberPulse] = useState(0);

  useEffect(() => { localStorage.setItem('roar-metrics-open', String(metricsOpen)); }, [metricsOpen]);
  useEffect(() => { localStorage.setItem('roar-allied-open', JSON.stringify(alliedOpen)); }, [alliedOpen]);
  useEffect(() => { localStorage.setItem('roar-coalition-open', String(coalitionOpen)); }, [coalitionOpen]);
  useEffect(() => { localStorage.setItem('roar-cyber-open', String(cyberOpen)); }, [cyberOpen]);

  // Simulate ongoing cyber activity counter
  useEffect(() => {
    const interval = setInterval(() => {
      setCyberPulse(prev => prev + (Math.random() > 0.6 ? 1 : 0));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const toggleAllied = (id: string) => {
    setAlliedOpen(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Iran Attack Feed */}
      <div className="bg-[var(--palantir-surface)] border border-[var(--palantir-border)] rounded-lg overflow-hidden">
        <div className="px-3 py-2.5 border-b border-[var(--palantir-border)] flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-400 animate-pulse" />
          <span className="font-semibold text-xs uppercase tracking-wider text-[var(--palantir-text)]">
            Iran Attack Feed
          </span>
          <div className="ml-auto flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[9px] font-mono text-green-400">LIVE</span>
          </div>
        </div>

        <div className="p-2 space-y-1.5">
          {/* Total - Big highlight */}
          <div className="flex items-center justify-between px-3 py-3 rounded-lg bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/30">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-mono text-amber-400 uppercase tracking-wider font-semibold">TOTAL OPS</span>
            </div>
            <span className="font-mono font-bold text-2xl text-amber-400 animate-pulse tabular-nums">
              {stats.total.toLocaleString()}
            </span>
          </div>

          {/* Burger menu toggle for detailed metrics */}
          <button
            onClick={() => setMetricsOpen(!metricsOpen)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-black/30 border border-[var(--palantir-border)]/50 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <Menu className="w-3.5 h-3.5 text-amber-400 group-hover:text-amber-300" />
              <span className="text-[10px] font-mono text-[var(--palantir-text-muted)] uppercase tracking-wider group-hover:text-amber-400 transition-colors">
                Detailed Metrics
              </span>
            </div>
            {metricsOpen ? (
              <ChevronUp className="w-3.5 h-3.5 text-[var(--palantir-text-muted)]" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-[var(--palantir-text-muted)]" />
            )}
          </button>

          {/* Collapsible metrics */}
          {metricsOpen && (
            <div className="space-y-1.5 animate-fade-in">
              <StatCard icon={<Flame className="w-3 h-3 text-red-400" />} label="24H" value={stats.last24h} color="text-red-400" bgColor="bg-red-500/20" pulse />
              <StatCard icon={<Shield className="w-3 h-3 text-green-400" />} label="INTERCEPTED" value={stats.intercepted} color="text-green-400" bgColor="bg-green-500/20" />
              <StatCard icon={<Rocket className="w-3 h-3 text-orange-400" />} label="BALLISTIC" value={stats.ballistic} color="text-orange-400" bgColor="bg-orange-500/20" small />
              <StatCard icon={<Plane className="w-3 h-3 text-cyan-400" />} label="DRONE" value={stats.drone} color="text-cyan-400" bgColor="bg-cyan-500/20" small />
              <StatCard icon={<Cpu className="w-3 h-3 text-purple-400" />} label="CYBER" value={stats.cyber} color="text-purple-400" bgColor="bg-purple-500/20" small />
              <StatCard icon={<Bomb className="w-3 h-3 text-yellow-400" />} label="ARTILLERY" value={stats.artillery} color="text-yellow-400" bgColor="bg-yellow-500/20" small />
              <StatCard icon={<Crosshair className="w-3 h-3 text-rose-400" />} label="CRUISE" value={stats.cruise} color="text-rose-400" bgColor="bg-rose-500/20" small />
              <StatCard icon={<Eye className="w-3 h-3 text-teal-400" />} label="SABOTAGE" value={stats.sabotage} color="text-teal-400" bgColor="bg-teal-500/20" small />

              {/* Source Attribution — Attacks by verified source */}
              <div className="rounded-lg bg-black/30 border border-[var(--palantir-border)]/50 p-3">
                <div className="text-[10px] font-mono text-[var(--palantir-text-muted)] uppercase tracking-wider mb-2">
                  Source Attribution — Iranian Attacks on Coalition
                </div>
                <div className="space-y-1.5">
                  {/* Al Jazeera — primary source for Gulf attacks */}
                  <div className="flex items-center justify-between px-2 py-1.5 rounded bg-amber-500/5 border border-amber-500/20">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span className="text-[9px] font-mono text-amber-400 font-bold">AL JAZEERA [B2]</span>
                    </div>
                    <span className="text-[10px] font-mono text-amber-400 font-bold">1,219</span>
                  </div>
                  <div className="pl-4 space-y-0.5">
                    <div className="flex justify-between text-[8px] font-mono text-[var(--palantir-text-muted)]">
                      <span>UAE: 165 BM + 2 cruise + 541 drones</span><span className="text-amber-400">708</span>
                    </div>
                    <div className="flex justify-between text-[8px] font-mono text-[var(--palantir-text-muted)]">
                      <span>Kuwait: 97 BM + 283 drones</span><span className="text-amber-400">380</span>
                    </div>
                    <div className="flex justify-between text-[8px] font-mono text-[var(--palantir-text-muted)]">
                      <span>Qatar: 65 missiles + 12 drones</span><span className="text-amber-400">77</span>
                    </div>
                    <div className="flex justify-between text-[8px] font-mono text-[var(--palantir-text-muted)]">
                      <span>Bahrain: 45 missiles + 9 drones</span><span className="text-amber-400">54</span>
                    </div>
                  </div>

                  {/* Reuters — US operations */}
                  <div className="flex items-center justify-between px-2 py-1.5 rounded bg-orange-500/5 border border-orange-500/20">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                      <span className="text-[9px] font-mono text-orange-400 font-bold">REUTERS [A2]</span>
                    </div>
                    <span className="text-[10px] font-mono text-orange-400 font-bold">COALITION OPS</span>
                  </div>
                  <div className="pl-4 space-y-0.5">
                    <div className="flex justify-between text-[8px] font-mono text-[var(--palantir-text-muted)]">
                      <span>US targets hit (2 days)</span><span className="text-orange-400">1,000+</span>
                    </div>
                    <div className="flex justify-between text-[8px] font-mono text-[var(--palantir-text-muted)]">
                      <span>Ships sunk</span><span className="text-orange-400">9</span>
                    </div>
                    <div className="flex justify-between text-[8px] font-mono text-[var(--palantir-text-muted)]">
                      <span>Iran KIA (Red Crescent) [B3]</span><span className="text-orange-400">555</span>
                    </div>
                  </div>

                  {/* IDF */}
                  <div className="flex items-center justify-between px-2 py-1.5 rounded bg-cyan-500/5 border border-cyan-500/20">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span className="text-[9px] font-mono text-cyan-400 font-bold">IDF [B2]</span>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold">IAF STRIKES</span>
                  </div>
                  <div className="pl-4 space-y-0.5">
                    <div className="flex justify-between text-[8px] font-mono text-[var(--palantir-text-muted)]">
                      <span>Munitions dropped</span><span className="text-cyan-400">1,200+</span>
                    </div>
                    <div className="flex justify-between text-[8px] font-mono text-[var(--palantir-text-muted)]">
                      <span>Iranian provinces hit</span><span className="text-cyan-400">24/31</span>
                    </div>
                    <div className="flex justify-between text-[8px] font-mono text-[var(--palantir-text-muted)]">
                      <span>Strike operations</span><span className="text-cyan-400">30+</span>
                    </div>
                    <div className="flex justify-between text-[8px] font-mono text-[var(--palantir-text-muted)]">
                      <span>Security leaders KIA</span><span className="text-cyan-400">7</span>
                    </div>
                  </div>

                  {/* IRGC Claims — adversary */}
                  <div className="flex items-center justify-between px-2 py-1.5 rounded bg-red-500/5 border border-red-500/20">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                      <span className="text-[9px] font-mono text-red-400 font-bold">IRGC CLAIMS [D5]</span>
                    </div>
                    <span className="text-[10px] font-mono text-red-400 font-bold">UNVERIFIED</span>
                  </div>
                  <div className="pl-4 space-y-0.5">
                    <div className="flex justify-between text-[8px] font-mono text-[var(--palantir-text-muted)]">
                      <span>US bases targeted (claim)</span><span className="text-red-400">27</span>
                    </div>
                    <div className="flex justify-between text-[8px] font-mono text-[var(--palantir-text-muted)]">
                      <span>BMs at USS Lincoln (claim)</span><span className="text-red-400">4</span>
                    </div>
                  </div>

                  {/* Total estimation */}
                  <div className="mt-2 pt-2 border-t border-[var(--palantir-border)]/30">
                    <div className="flex justify-between px-2">
                      <span className="text-[9px] font-mono text-[var(--palantir-text-muted)]">GULF CONFIRMED TOTAL</span>
                      <span className="text-[10px] font-mono font-bold text-green-400">1,219</span>
                    </div>
                    <div className="flex justify-between px-2 mt-0.5">
                      <span className="text-[9px] font-mono text-[var(--palantir-text-muted)]">+ ISRAEL / OTHER [EST]</span>
                      <span className="text-[10px] font-mono font-bold text-yellow-400">~281</span>
                    </div>
                    <div className="flex justify-between px-2 mt-0.5">
                      <span className="text-[9px] font-mono text-amber-400 font-bold">TOTAL OPS [EST]</span>
                      <span className="text-[10px] font-mono font-bold text-amber-400">1,500</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Intercept Rate */}
              <div className="rounded-lg bg-black/30 border border-[var(--palantir-border)]/50 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-[var(--palantir-text-muted)] uppercase tracking-wider">Intercept Rate</span>
                  <span className="text-sm font-mono font-bold text-green-400">{interceptRate}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-black/50 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-1000"
                    style={{ width: `${Math.min(interceptRate, 100)}%` }}
                  />
                </div>
              </div>

              {/* Mini Sparkline */}
              <div className="rounded-lg bg-black/30 border border-[var(--palantir-border)]/50 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-[var(--palantir-text-muted)] uppercase tracking-wider">Op Tempo</span>
                  <span className="text-[10px] font-mono text-amber-400">30s window</span>
                </div>
                <div className="h-16">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={history}>
                      <defs>
                        <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="interceptGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="total" stroke="#f59e0b" fill="url(#totalGrad)" strokeWidth={1.5} dot={false} />
                      <Area type="monotone" dataKey="intercepted" stroke="#22c55e" fill="url(#interceptGrad)" strokeWidth={1} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-0.5 bg-amber-400 rounded" />
                    <span className="text-[9px] font-mono text-[var(--palantir-text-muted)]">Total</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-0.5 bg-green-400 rounded" />
                    <span className="text-[9px] font-mono text-[var(--palantir-text-muted)]">Intercept</span>
                  </div>
                </div>
              </div>

              {/* Force Status */}
              <div className="rounded-lg bg-black/30 border border-[var(--palantir-border)]/50 p-3">
                <div className="text-[10px] font-mono text-[var(--palantir-text-muted)] uppercase tracking-wider mb-2">Force Status</div>
                <div className="space-y-1.5">
                  <ForceBar label="SORTIES" value={stats.sorties} max={1000} color="bg-blue-400" />
                  <ForceBar label="TARGETS HIT" value={stats.targetsDamaged} max={22} color="bg-orange-400" />
                  <ForceBar label="NEUTRALIZED" value={stats.targetsNeutralized} max={22} color="bg-green-400" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Coalition Feeds — Collapsible */}
      <div className="bg-[var(--palantir-surface)] border border-[var(--palantir-border)] rounded-lg overflow-hidden">
        <button
          onClick={() => setCoalitionOpen(!coalitionOpen)}
          className="w-full px-3 py-2.5 flex items-center gap-2 hover:bg-white/5 transition-colors"
        >
          {coalitionOpen ? (
            <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
          ) : (
            <Menu className="w-3.5 h-3.5 text-cyan-400" />
          )}
          <Shield className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-xs uppercase tracking-wider text-[var(--palantir-text)]">
            Coalition Feed
          </span>
          <span className="text-[9px] font-mono text-[var(--palantir-text-muted)]">{ALLIED_FEEDS.length} nations</span>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[9px] font-mono text-green-400">LIVE</span>
          </div>
        </button>

        {coalitionOpen && (
          <div className="border-t border-[var(--palantir-border)] space-y-1 p-1.5 animate-fade-in">
            {ALLIED_FEEDS.map((feed) => (
              <div key={feed.id} className="rounded-lg border border-[var(--palantir-border)]/50 overflow-hidden">
                <button
                  onClick={() => toggleAllied(feed.id)}
                  className="w-full px-2.5 py-1.5 flex items-center gap-2 hover:bg-white/5 transition-colors"
                >
                  <span className="text-sm">{feed.flag}</span>
                  <span className={`font-semibold text-[10px] uppercase tracking-wider ${feed.color}`}>
                    {feed.name} Feed
                  </span>
                  <div className="ml-auto flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[8px] font-mono text-green-400">LIVE</span>
                    {alliedOpen[feed.id] ? (
                      <ChevronUp className="w-3 h-3 text-[var(--palantir-text-muted)]" />
                    ) : (
                      <ChevronDown className="w-3 h-3 text-[var(--palantir-text-muted)]" />
                    )}
                  </div>
                </button>

                {alliedOpen[feed.id] && (
                  <div className={`p-2 space-y-1.5 border-t ${feed.borderColor} animate-fade-in`}>
                    {feed.stats.map((stat, idx) => {
                      const Icon = stat.icon;
                      return (
                        <StatCard
                          key={idx}
                          icon={<Icon className={`w-3 h-3 ${stat.color}`} />}
                          label={stat.label}
                          value={stat.value}
                          color={stat.color}
                          bgColor={stat.bg}
                          small
                        />
                      );
                    })}
                    <div className="px-3 py-1">
                      <span className="text-[8px] font-mono text-[var(--palantir-text-muted)]">
                        SRC: {feed.source}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!coalitionOpen && (
          <div className="px-3 py-1.5 border-t border-[var(--palantir-border)]/50 flex items-center gap-2">
            <span className="text-[9px] font-mono text-[var(--palantir-text-muted)]">
              {ALLIED_FEEDS.map(f => f.flag).join(' ')} — {ALLIED_FEEDS.length} feeds active
            </span>
          </div>
        )}
      </div>

      {/* Cyber Operations Section */}
      <div className="bg-[var(--palantir-surface)] border border-purple-500/30 rounded-lg overflow-hidden">
        <button
          onClick={() => setCyberOpen(!cyberOpen)}
          className="w-full px-3 py-2 flex items-center gap-2 hover:bg-purple-500/5 transition-colors"
        >
          <Cpu className="w-4 h-4 text-purple-400" />
          <span className="font-semibold text-xs uppercase tracking-wider text-purple-400">
            Cyber Operations
          </span>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="text-[9px] font-mono text-red-400 bg-red-500/20 px-1.5 py-0.5 rounded animate-pulse">
              {6 + Math.floor(cyberPulse / 3)} THREATS
            </span>
            {cyberOpen ? (
              <ChevronUp className="w-3.5 h-3.5 text-[var(--palantir-text-muted)]" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-[var(--palantir-text-muted)]" />
            )}
          </div>
        </button>

        {cyberOpen && (
          <div className="p-2 space-y-2 border-t border-purple-500/20 animate-fade-in">
            {/* Allied Cyber Ops */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 px-1 mb-1">
                <Lock className="w-3 h-3 text-green-400" />
                <span className="text-[9px] font-mono text-green-400 uppercase tracking-wider font-semibold">{CYBER_METRICS.allied.label}</span>
              </div>
              {CYBER_METRICS.allied.ops.map((op, idx) => (
                <div key={idx} className="flex items-center gap-2 px-2 py-1.5 rounded bg-black/30 border border-green-500/20">
                  <Database className="w-3 h-3 text-green-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-mono text-[var(--palantir-text)]">{op.label}</span>
                    <div className="text-[8px] font-mono text-[var(--palantir-text-muted)] truncate">{op.desc}</div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-green-400">{op.value}</span>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-[var(--palantir-border)]/50" />

            {/* Iranian Threat Groups */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 px-1 mb-1">
                <Wifi className="w-3 h-3 text-red-400" />
                <span className="text-[9px] font-mono text-red-400 uppercase tracking-wider font-semibold">{CYBER_METRICS.iranian.label}</span>
              </div>
              {CYBER_METRICS.iranian.groups.map((group, idx) => (
                <CyberThreatRow key={idx} group={group} />
              ))}
            </div>

            <div className="px-2 py-1">
              <span className="text-[8px] font-mono text-[var(--palantir-text-muted)]">
                SRC: CISA / Microsoft MSTIC / Mandiant / CrowdStrike
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Stream status */}
      <div className="bg-[var(--palantir-surface)] border border-[var(--palantir-border)] rounded-lg px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-mono text-[var(--palantir-text-muted)]">BRE4CH // STREAM ACTIVE</span>
        </div>
      </div>
    </div>
  );
}

function ForceBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div>
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-[9px] font-mono text-[var(--palantir-text-muted)]">{label}</span>
        <span className="text-[10px] font-mono text-[var(--palantir-text)]">{value.toLocaleString()}</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-black/50 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-1000`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
