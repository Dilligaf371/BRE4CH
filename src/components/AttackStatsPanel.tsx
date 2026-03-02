import { useState, useEffect } from 'react';
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

// Verified allied contribution data — Operation True Promise 4 retaliation (Mar 1, 2026)
// Sources: CENTCOM, IDF, UAE MoD, Gulf News, CNN, NPR, Breaking Defense
const ALLIED_FEEDS = [
  {
    id: 'usa',
    name: 'USA',
    flag: '🇺🇸',
    color: 'text-blue-400',
    borderColor: 'border-blue-500/30',
    bgColor: 'from-blue-500/10',
    stats: [
      { label: 'INTERCEPTS', value: '100s', icon: Shield, color: 'text-green-400', bg: 'bg-green-500/20' },
      { label: 'PATRIOT/THAAD', value: 'ACTIVE', icon: Rocket, color: 'text-blue-400', bg: 'bg-blue-500/20' },
      { label: 'KIA', value: 4, icon: Target, color: 'text-red-400', bg: 'bg-red-500/20' },
      { label: 'WIA', value: 5, icon: Target, color: 'text-orange-400', bg: 'bg-orange-500/20' },
    ],
    source: 'CENTCOM / CNN / NPR',
  },
  {
    id: 'israel',
    name: 'ISRAEL',
    flag: '🇮🇱',
    color: 'text-cyan-400',
    borderColor: 'border-cyan-500/30',
    bgColor: 'from-cyan-500/10',
    stats: [
      { label: 'ARROW/DS/DOME', value: 'ACTIVE', icon: Shield, color: 'text-green-400', bg: 'bg-green-500/20' },
      { label: 'MUNITIONS DROPPED', value: '1,200+', icon: Bomb, color: 'text-orange-400', bg: 'bg-orange-500/20' },
      { label: 'PROVINCES HIT', value: '24/31', icon: Crosshair, color: 'text-red-400', bg: 'bg-red-500/20' },
      { label: 'CIVILIAN KIA', value: 6, icon: Target, color: 'text-red-400', bg: 'bg-red-500/20' },
    ],
    source: 'IDF / CNN / Al Jazeera',
  },
  {
    id: 'ksa',
    name: 'KSA',
    flag: '🇸🇦',
    color: 'text-green-400',
    borderColor: 'border-green-500/30',
    bgColor: 'from-green-500/10',
    stats: [
      { label: 'TARGETS HIT', value: 'Riyadh+E.Prov', icon: Target, color: 'text-red-400', bg: 'bg-red-500/20' },
      { label: 'INTERCEPT STATUS', value: 'CONFIRMED', icon: Shield, color: 'text-green-400', bg: 'bg-green-500/20' },
      { label: 'PATRIOT/THAAD', value: 'ACTIVE', icon: Rocket, color: 'text-green-400', bg: 'bg-green-500/20' },
    ],
    source: 'Saudi MoD / Breaking Defense',
  },
  {
    id: 'uae',
    name: 'UAE',
    flag: '🇦🇪',
    color: 'text-red-400',
    borderColor: 'border-red-500/30',
    bgColor: 'from-red-500/10',
    stats: [
      { label: 'BM INTERCEPTED', value: 165, icon: Shield, color: 'text-green-400', bg: 'bg-green-500/20' },
      { label: 'CRUISE DESTROYED', value: 2, icon: Rocket, color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
      { label: 'DRONES INTERCEPTED', value: 541, icon: Plane, color: 'text-blue-400', bg: 'bg-blue-500/20' },
      { label: 'DRONES PENETRATED', value: 35, icon: Crosshair, color: 'text-red-400', bg: 'bg-red-500/20' },
    ],
    source: 'UAE MoD / Gulf News',
  },
];

// Cyber operations metrics — Operation Epic Fury / Roar of the Lion
// Iranian cyber groups activated in retaliation + Allied offensive cyber ops
// Sources: CISA, Microsoft MSTIC, Mandiant, CrowdStrike, Unit 42, CENTCOM
const CYBER_METRICS = {
  allied: {
    label: 'ALLIED CYBER OPS',
    color: 'text-green-400',
    ops: [
      { label: 'SCADA/ICS Intrusions', value: 7, desc: 'Natanz, Fordow, Bushehr, Arak, Isfahan UCF, Abadan, Kharg' },
      { label: 'C2 Network Disrupted', value: 3, desc: 'IRGC tactical comms, Air defense network, Navy C2' },
      { label: 'GPS/EW Jamming Zones', value: 12, desc: 'Active across W. Iran theater' },
      { label: 'DDoS Targets Offline', value: 47, desc: 'Iranian ISPs, govt portals, IRGC telecom' },
      { label: 'Wiper Deployments', value: 2, desc: 'IRGC intel servers, nuclear program networks' },
    ],
  },
  iranian: {
    label: 'IRANIAN CYBER THREATS',
    color: 'text-red-400',
    groups: [
      { name: 'CyberAv3ngers', target: 'US/GCC SCADA/ICS', status: 'active', severity: 'critical' },
      { name: 'APT42 (Charming Kitten)', target: 'US/IL govt credentials', status: 'active', severity: 'high' },
      { name: 'MuddyWater', target: 'GCC telecom/energy', status: 'active', severity: 'high' },
      { name: 'Void Manticore (Storm-842)', target: 'IL infrastructure wiper', status: 'active', severity: 'critical' },
      { name: 'Cotton Sandstorm', target: 'US media / disinfo ops', status: 'detected', severity: 'medium' },
      { name: 'Agrius (Pink Sandstorm)', target: 'IL Diamond/tech sector', status: 'active', severity: 'high' },
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
  const [metricsOpen, setMetricsOpen] = useState(false);
  const [alliedOpen, setAlliedOpen] = useState<Record<string, boolean>>({});
  const [cyberOpen, setCyberOpen] = useState(false);
  const [cyberPulse, setCyberPulse] = useState(0);

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
                  <ForceBar label="SORTIES" value={stats.sorties} max={500} color="bg-blue-400" />
                  <ForceBar label="TARGETS HIT" value={stats.targetsDamaged} max={22} color="bg-orange-400" />
                  <ForceBar label="NEUTRALIZED" value={stats.targetsNeutralized} max={22} color="bg-green-400" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Allied Attack Feeds — USA, Israel, KSA, UAE */}
      {ALLIED_FEEDS.map((feed) => (
        <div key={feed.id} className="bg-[var(--palantir-surface)] border border-[var(--palantir-border)] rounded-lg overflow-hidden">
          <button
            onClick={() => toggleAllied(feed.id)}
            className="w-full px-3 py-2 flex items-center gap-2 hover:bg-white/5 transition-colors"
          >
            <span className="text-sm">{feed.flag}</span>
            <span className={`font-semibold text-xs uppercase tracking-wider ${feed.color}`}>
              {feed.name} Feed
            </span>
            <div className="ml-auto flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[9px] font-mono text-green-400">LIVE</span>
              {alliedOpen[feed.id] ? (
                <ChevronUp className="w-3.5 h-3.5 text-[var(--palantir-text-muted)]" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-[var(--palantir-text-muted)]" />
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
