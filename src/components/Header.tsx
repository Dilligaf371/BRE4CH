import { Shield, Radio, AlertTriangle, Zap, Lock } from 'lucide-react';
import { useMissionClock } from '../hooks/useMissionClock';
import { CURRENT_PHASE, THREAT_LEVEL } from '../data/mockData';

const THREAT_COLORS: Record<string, string> = {
  CRITICAL: 'text-red-500 bg-red-500/20 border-red-500/50',
  HIGH: 'text-orange-400 bg-orange-500/20 border-orange-500/50',
  ELEVATED: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50',
  GUARDED: 'text-blue-400 bg-blue-500/20 border-blue-500/50',
  LOW: 'text-green-400 bg-green-500/20 border-green-500/50',
};

export function Header() {
  const clock = useMissionClock();

  return (
    <header className="h-16 flex-shrink-0 border-b border-[var(--palantir-border)] bg-[var(--palantir-surface)] px-4 flex items-center justify-between relative z-50">
      {/* Left: Logo + Operation */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center relative">
          <img src="/breach-logo.svg" alt="BRE4CH" className="w-40 h-auto" />
        </div>
        <div>
          <h1 className="font-bold text-base tracking-tight text-[var(--palantir-text)] leading-tight">
            ROAR OF THE LION
          </h1>
          <p className="text-[10px] font-mono text-[var(--palantir-text-muted)] tracking-wider">
            OPERATION EPIC FURY // IRAN THEATRE // CENTCOM
          </p>
        </div>
      </div>

      {/* Center: Mission Phase + Live Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-black/40 border border-[var(--palantir-border)]">
          <Radio className="w-3.5 h-3.5 text-green-400 animate-pulse" />
          <span className="text-[10px] font-mono text-green-400 tracking-wider">LIVE INTEL</span>
        </div>

        <div className="h-6 w-px bg-[var(--palantir-border)]" />

        {/* Proton VPN Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-green-500/10 border border-green-500/30">
          <Lock className="w-3.5 h-3.5 text-green-400" />
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-mono text-green-400 tracking-wider">VPN ENCRYPTED</span>
        </div>

        <div className="h-6 w-px bg-[var(--palantir-border)]" />

        <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-amber-500/10 border border-amber-500/30">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[10px] font-mono text-amber-400 tracking-wider">{CURRENT_PHASE}</span>
        </div>

        <div className="h-6 w-px bg-[var(--palantir-border)]" />

        <div className={`flex items-center gap-2 px-3 py-1.5 rounded border ${THREAT_COLORS[THREAT_LEVEL]}`}>
          <AlertTriangle className="w-3.5 h-3.5" />
          <span className="text-[10px] font-mono tracking-wider">THREATCON {THREAT_LEVEL}</span>
        </div>
      </div>

      {/* Right: Mission Elapsed + City Clocks */}
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-[9px] font-mono text-[var(--palantir-text-muted)] tracking-widest">MISSION ELAPSED</div>
          <div className="text-sm font-mono font-bold text-amber-400 tabular-nums tracking-wider">
            {clock.formatted}
          </div>
        </div>

        <div className="h-8 w-px bg-[var(--palantir-border)]" />

        <div className="text-center">
          <div className="text-[8px] font-mono text-[var(--palantir-text-muted)] tracking-widest">WASHINGTON</div>
          <div className="text-xs font-mono text-blue-400 tabular-nums font-bold">{clock.washingtonTime}</div>
        </div>

        <div className="h-8 w-px bg-[var(--palantir-border)]" />

        <div className="text-center">
          <div className="text-[8px] font-mono text-[var(--palantir-text-muted)] tracking-widest">TEHRAN</div>
          <div className="text-xs font-mono text-red-400 tabular-nums font-bold">{clock.tehranTime}</div>
        </div>

        <div className="h-8 w-px bg-[var(--palantir-border)]" />

        <div className="text-center">
          <div className="text-[8px] font-mono text-[var(--palantir-text-muted)] tracking-widest">ABU DHABI</div>
          <div className="text-xs font-mono text-amber-400 tabular-nums font-bold">{clock.abuDhabiTime}</div>
        </div>
      </div>
    </header>
  );
}
