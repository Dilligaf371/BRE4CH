import { Rocket, Terminal } from 'lucide-react';

interface Props {
  showConventional: boolean;
  showCyber: boolean;
  onToggleConventional: () => void;
  onToggleCyber: () => void;
}

export function AttackFlowToggle({
  showConventional,
  showCyber,
  onToggleConventional,
  onToggleCyber,
}: Props) {
  return (
    <div className="absolute bottom-3 left-[50%] -translate-x-1/2 z-[1000] flex gap-1">
      {/* KINETIC toggle */}
      <button
        onClick={onToggleConventional}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border backdrop-blur-sm transition-all cursor-pointer ${
          showConventional
            ? 'bg-red-950/80 border-red-500/60 shadow-[0_0_12px_rgba(239,68,68,0.3)]'
            : 'bg-black/80 border-[var(--palantir-border)] hover:border-[var(--palantir-text-muted)]'
        }`}
        title="Toggle kinetic attack flows"
      >
        {showConventional && (
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
          </span>
        )}
        <Rocket className={`w-3 h-3 ${showConventional ? 'text-red-400' : 'text-[var(--palantir-text-muted)]'}`} />
        <span className={`text-[9px] font-mono tracking-wider ${showConventional ? 'text-red-300' : 'text-[var(--palantir-text-muted)]'}`}>
          KINETIC
        </span>
      </button>

      {/* CYBER toggle */}
      <button
        onClick={onToggleCyber}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border backdrop-blur-sm transition-all cursor-pointer ${
          showCyber
            ? 'bg-purple-950/80 border-purple-500/60 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
            : 'bg-black/80 border-[var(--palantir-border)] hover:border-[var(--palantir-text-muted)]'
        }`}
        title="Toggle cyber attack flows"
      >
        {showCyber && (
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-purple-500" />
          </span>
        )}
        <Terminal className={`w-3 h-3 ${showCyber ? 'text-purple-400' : 'text-[var(--palantir-text-muted)]'}`} />
        <span className={`text-[9px] font-mono tracking-wider ${showCyber ? 'text-purple-300' : 'text-[var(--palantir-text-muted)]'}`}>
          CYBER
        </span>
      </button>
    </div>
  );
}
