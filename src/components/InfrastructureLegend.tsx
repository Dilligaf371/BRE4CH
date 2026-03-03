import { useState } from 'react';
import { ChevronRight, Layers } from 'lucide-react';
import { INFRA_COLORS } from '../data/mockData';

function loadLegendVisible(): boolean {
  try {
    const stored = localStorage.getItem('roar-legend-visible');
    if (stored !== null) return stored === 'true';
  } catch { /* ignore */ }
  return true;
}

export function InfrastructureLegend() {
  const [visible, setVisible] = useState(loadLegendVisible);

  const toggle = () => {
    const next = !visible;
    setVisible(next);
    try { localStorage.setItem('roar-legend-visible', String(next)); } catch { /* ignore */ }
  };

  const infraItems = [
    { label: 'Nuclear', color: INFRA_COLORS.nuclear },
    { label: 'Military', color: INFRA_COLORS.military },
    { label: 'Airbase', color: INFRA_COLORS.airbase },
    { label: 'Naval', color: INFRA_COLORS.naval },
    { label: 'Command', color: INFRA_COLORS.command },
    { label: 'Missile', color: INFRA_COLORS.missile },
    { label: 'Oil', color: INFRA_COLORS.oil },
    { label: 'Radar/AD', color: INFRA_COLORS.radar },
    { label: 'Chemical', color: INFRA_COLORS.chemical },
  ];

  const statusItems = [
    { label: 'Active', color: '#ef4444' },
    { label: 'Damaged', color: '#f59e0b' },
    { label: 'Neutralized', color: '#22c55e' },
  ];

  const forces = [
    { label: 'Epic Fury', color: '#22c55e' },
    { label: 'Hostile', color: '#ef4444' },
  ];

  return (
    <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-1.5">
      {/* Toggle button — always visible */}
      <button
        onClick={toggle}
        className="self-end flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/80 border border-[var(--palantir-border)] backdrop-blur-sm hover:bg-black/90 hover:border-[var(--palantir-text-muted)] transition-all cursor-pointer"
        title={visible ? 'Hide legend' : 'Show legend'}
      >
        <Layers className="w-3 h-3 text-[var(--palantir-text-muted)]" />
        <span className="text-[8px] font-mono text-[var(--palantir-text-muted)] tracking-wider">
          {visible ? 'HIDE' : 'LEGEND'}
        </span>
        <ChevronRight className={`w-3 h-3 text-[var(--palantir-text-muted)] transition-transform ${visible ? 'rotate-0' : 'rotate-180'}`} />
      </button>

      {visible && (
        <>
          <div className="px-2.5 py-2 rounded-lg bg-black/80 border border-[var(--palantir-border)] backdrop-blur-sm animate-alertFadeIn">
            <div className="text-[9px] font-mono text-[var(--palantir-text-muted)] uppercase mb-1.5 tracking-wider">Infrastructure</div>
            <div className="grid grid-cols-3 gap-x-3 gap-y-0.5">
              {infraItems.map((i) => (
                <div key={i.label} className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: i.color }} />
                  <span className="text-[9px] text-[var(--palantir-text)]">{i.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="px-2.5 py-2 rounded-lg bg-black/80 border border-[var(--palantir-border)] backdrop-blur-sm flex gap-4 animate-alertFadeIn">
            <div>
              <div className="text-[9px] font-mono text-[var(--palantir-text-muted)] uppercase mb-1 tracking-wider">Status</div>
              <div className="flex gap-2.5">
                {statusItems.map((s) => (
                  <div key={s.label} className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
                    <span className="text-[9px] text-[var(--palantir-text)]">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="w-px bg-[var(--palantir-border)]" />
            <div>
              <div className="text-[9px] font-mono text-[var(--palantir-text-muted)] uppercase mb-1 tracking-wider">Forces</div>
              <div className="flex gap-2.5">
                {forces.map((f) => (
                  <div key={f.label} className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: f.color }} />
                    <span className="text-[9px] text-[var(--palantir-text)]">{f.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
