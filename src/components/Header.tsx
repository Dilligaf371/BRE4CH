import { useState, useEffect, useRef, useMemo } from 'react';
import { Radio, AlertTriangle, Zap, Lock, RefreshCw, ChevronDown, Menu, LogOut, Shield, MapPin, Users, Navigation } from 'lucide-react';
import { useMissionClock } from '../hooks/useMissionClock';
import { useSourceRefresh } from '../hooks/useSourceRefresh';
import { useEmergencyAlerts } from '../hooks/useEmergencyAlerts';
import { THREAT_LEVEL, type MissionPhase } from '../data/mockData';
import { AlertDropdown } from './EmergencyAlert';
import { SHELTERS, EMIRATE_LIST, EMIRATE_SHORT, type Emirate } from './SheltersPanel';

const THREAT_COLORS: Record<string, string> = {
  CRITICAL: 'text-red-500 bg-red-500/20 border-red-500/50',
  HIGH: 'text-orange-400 bg-orange-500/20 border-orange-500/50',
  ELEVATED: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50',
  GUARDED: 'text-blue-400 bg-blue-500/20 border-blue-500/50',
  LOW: 'text-green-400 bg-green-500/20 border-green-500/50',
};

// ─── CENTCOM JOINT PHASING MODEL (JP 3-0) ───
// Real operational phases per CENTCOM doctrine for Operation Epic Fury
const PHASE_CONFIG: Record<MissionPhase, {
  color: string;
  borderColor: string;
  description: string;
  centcomStatus: string;
}> = {
  'PHASE I - ISR': {
    color: 'text-cyan-400',
    borderColor: 'bg-cyan-500/10 border-cyan-500/30',
    description: 'Intelligence, Surveillance & Reconnaissance — Pre-strike intelligence collection, target development, battle damage assessment prep',
    centcomStatus: 'CENTCOM: ISR assets deployed — RQ-4, RC-135, EP-3 orbits active',
  },
  'PHASE II - SEAD': {
    color: 'text-purple-400',
    borderColor: 'bg-purple-500/10 border-purple-500/30',
    description: 'Suppression of Enemy Air Defenses — Neutralize Iranian IADS, S-300/S-400 sites, EW nodes, C2 infrastructure',
    centcomStatus: 'CENTCOM: SEAD/DEAD targeting — Iranian air defense network degraded 70%+',
  },
  'PHASE III - STRIKE': {
    color: 'text-red-400',
    borderColor: 'bg-red-500/10 border-red-500/30',
    description: 'Decisive Offensive Operations — Strategic strike campaign against nuclear, military, C2 infrastructure targets',
    centcomStatus: 'CENTCOM: Strike ops — 1,200+ munitions expended, 24/31 provinces targeted',
  },
  'PHASE IV - EXPLOIT': {
    color: 'text-amber-400',
    borderColor: 'bg-amber-500/10 border-amber-500/30',
    description: 'Exploitation — Battle damage assessment, restrike degraded targets, maintain air superiority, expand targeting',
    centcomStatus: 'CENTCOM: BDA + restrike — Iranian C2 fragmented, nuclear program set back 10+ years',
  },
  'PHASE V - STABILIZE': {
    color: 'text-green-400',
    borderColor: 'bg-green-500/10 border-green-500/30',
    description: 'Stabilization — De-escalation, ceasefire enforcement, humanitarian corridors, regional force posture adjustment',
    centcomStatus: 'CENTCOM: Ceasefire monitoring — regional stabilization operations',
  },
};

const PHASES: MissionPhase[] = [
  'PHASE I - ISR',
  'PHASE II - SEAD',
  'PHASE III - STRIKE',
  'PHASE IV - EXPLOIT',
  'PHASE V - STABILIZE',
];

function loadPhase(): MissionPhase {
  try {
    const stored = localStorage.getItem('roar-mission-phase');
    if (stored && PHASES.includes(stored as MissionPhase)) return stored as MissionPhase;
  } catch { /* ignore */ }
  return 'PHASE IV - EXPLOIT';
}

export function Header({ onLogout }: { onLogout?: () => void }) {
  const clock = useMissionClock();
  const refresh = useSourceRefresh();
  const { activeAlerts } = useEmergencyAlerts();
  const unreadCount = activeAlerts.filter(a => a.readAt === null).length;
  const [phase, setPhase] = useState<MissionPhase>(loadPhase);
  const [showPhaseSelector, setShowPhaseSelector] = useState(false);
  const [showAlertPanel, setShowAlertPanel] = useState(false);
  const [showShelterPanel, setShowShelterPanel] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);
  const alertRef = useRef<HTMLDivElement>(null);
  const shelterRef = useRef<HTMLDivElement>(null);

  // Persist phase selection
  useEffect(() => {
    localStorage.setItem('roar-mission-phase', phase);
  }, [phase]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!showPhaseSelector) return;
    const handler = (e: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(e.target as Node)) {
        setShowPhaseSelector(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showPhaseSelector]);

  // Close alert dropdown on outside click
  useEffect(() => {
    if (!showAlertPanel) return;
    const handler = (e: MouseEvent) => {
      if (alertRef.current && !alertRef.current.contains(e.target as Node)) {
        setShowAlertPanel(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showAlertPanel]);

  // Close shelter dropdown on outside click
  useEffect(() => {
    if (!showShelterPanel) return;
    const handler = (e: MouseEvent) => {
      if (shelterRef.current && !shelterRef.current.contains(e.target as Node)) {
        setShowShelterPanel(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showShelterPanel]);

  const [selectedEmirate, setSelectedEmirate] = useState<Emirate | 'ALL'>(() => {
    try { return (localStorage.getItem('roar-shelters-emirate') as Emirate | 'ALL') || 'ALL'; } catch { return 'ALL'; }
  });

  useEffect(() => {
    localStorage.setItem('roar-shelters-emirate', selectedEmirate);
  }, [selectedEmirate]);

  const filteredShelters = useMemo(
    () => selectedEmirate === 'ALL' ? SHELTERS : SHELTERS.filter(s => s.emirate === selectedEmirate),
    [selectedEmirate],
  );
  const openShelters = filteredShelters.filter(s => s.status === 'OPEN');
  const totalCapacity = openShelters.reduce((sum, s) => sum + s.capacity, 0);

  const phaseConfig = PHASE_CONFIG[phase];

  return (
    <header className="h-16 flex-shrink-0 border-b border-[var(--palantir-border)] bg-[var(--palantir-surface)] px-4 flex items-center justify-between relative z-50">
      {/* Left: Logo + Operation */}
      <div className="flex items-center gap-0 -ml-2">
        <div className="flex items-center justify-center relative">
          <img src="/breach-logo.svg" alt="BRE4CH" className="w-40 h-auto" />
        </div>
        <div className="-ml-2">
          <h1 className="font-bold text-base tracking-tight text-[var(--palantir-text)] leading-tight">
            ROARING LION
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

        {/* Source Refresh Macro */}
        <button
          onClick={refresh.forceRefresh}
          disabled={refresh.status?.running}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded border transition-all ${
            refresh.error
              ? 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20'
              : refresh.status?.running
                ? 'bg-cyan-500/10 border-cyan-500/30'
                : 'bg-cyan-500/10 border-cyan-500/30 hover:bg-cyan-500/20'
          }`}
          title={`Sources: ${refresh.onlineCount}/${refresh.totalCount} online — Click to force refresh`}
        >
          <RefreshCw className={`w-3 h-3 ${refresh.error ? 'text-red-400' : 'text-cyan-400'} ${refresh.status?.running ? 'animate-spin' : ''}`} />
          <span className={`text-[9px] font-mono tracking-wider ${refresh.error ? 'text-red-400' : 'text-cyan-400'}`}>
            {refresh.error ? 'OFFLINE' : `${refresh.onlineCount}/${refresh.totalCount}`}
          </span>
          {!refresh.error && (
            <span className="text-[8px] font-mono text-cyan-400/60 tabular-nums">
              {Math.floor(refresh.countdown / 60)}:{String(refresh.countdown % 60).padStart(2, '0')}
            </span>
          )}
        </button>

        <div className="h-6 w-px bg-[var(--palantir-border)]" />

        {/* Proton VPN Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-green-500/10 border border-green-500/30">
          <Lock className="w-3.5 h-3.5 text-green-400" />
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-mono text-green-400 tracking-wider">VPN ENCRYPTED</span>
        </div>

        <div className="h-6 w-px bg-[var(--palantir-border)]" />

        {/* Mission Phase — Editable dropdown */}
        <div className="relative" ref={selectorRef}>
          <button
            onClick={() => setShowPhaseSelector(!showPhaseSelector)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded border cursor-pointer hover:brightness-125 transition-all ${phaseConfig.borderColor}`}
            title={phaseConfig.centcomStatus}
          >
            <Zap className={`w-3.5 h-3.5 ${phaseConfig.color}`} />
            <span className={`text-[10px] font-mono tracking-wider ${phaseConfig.color}`}>{phase}</span>
            <ChevronDown className={`w-3 h-3 ${phaseConfig.color} opacity-50 transition-transform ${showPhaseSelector ? 'rotate-180' : ''}`} />
          </button>

          {/* Phase selector dropdown */}
          {showPhaseSelector && (
            <div className="absolute top-full mt-1 left-0 w-[420px] bg-[var(--palantir-surface)] border border-[var(--palantir-border)] rounded-lg shadow-2xl shadow-black/60 overflow-hidden z-[100] animate-alertFadeIn">
              <div className="px-3 py-2 border-b border-[var(--palantir-border)]">
                <div className="text-[9px] font-mono font-bold text-[var(--palantir-text-muted)] tracking-[0.2em]">
                  CENTCOM OPERATIONAL PHASE — JP 3-0 JOINT PHASING MODEL
                </div>
              </div>
              <div className="p-1.5 space-y-1">
                {PHASES.map(p => {
                  const cfg = PHASE_CONFIG[p];
                  const isActive = p === phase;
                  return (
                    <button
                      key={p}
                      onClick={() => { setPhase(p); setShowPhaseSelector(false); }}
                      className={`w-full text-left px-3 py-2 rounded border transition-all ${
                        isActive
                          ? `${cfg.borderColor} border-opacity-100`
                          : 'border-transparent hover:bg-white/5 hover:border-[var(--palantir-border)]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Zap className={`w-3.5 h-3.5 ${cfg.color} ${isActive ? '' : 'opacity-50'}`} />
                          <span className={`text-[11px] font-mono font-bold tracking-wider ${isActive ? cfg.color : 'text-[var(--palantir-text)]'}`}>
                            {p}
                          </span>
                        </div>
                        {isActive && (
                          <span className="text-[7px] font-mono font-bold text-green-400 bg-green-500/20 px-1.5 py-0.5 rounded tracking-wider">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-[9px] font-mono text-[var(--palantir-text-muted)] mt-1 leading-relaxed pl-5.5">
                        {cfg.description}
                      </p>
                      {isActive && (
                        <p className={`text-[8px] font-mono ${cfg.color} opacity-70 mt-0.5 pl-5.5`}>
                          {cfg.centcomStatus}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="px-3 py-1.5 border-t border-[var(--palantir-border)]">
                <p className="text-[7px] font-mono text-[var(--palantir-text-muted)] tracking-wider">
                  SRC: CENTCOM OPLAN EPIC FURY // JP 3-0 JOINT OPERATIONS // CLASSIFICATION: TOP SECRET // RELIDO
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-[var(--palantir-border)]" />

        {/* THREATCON — Alert dropdown (same pattern as Phase selector) */}
        <div className="relative" ref={alertRef}>
          <button
            onClick={() => setShowAlertPanel(!showAlertPanel)}
            className={`relative flex items-center gap-2 px-3 py-1.5 rounded border cursor-pointer hover:brightness-125 transition-all ${THREAT_COLORS[THREAT_LEVEL]}`}
            title="Toggle Emergency Alert System"
          >
            <Menu className="w-3.5 h-3.5" />
            <AlertTriangle className={`w-3.5 h-3.5 ${unreadCount > 0 ? 'animate-pulse' : ''}`} />
            <span className="text-[10px] font-mono tracking-wider">THREATCON {THREAT_LEVEL}</span>
            <ChevronDown className={`w-3 h-3 opacity-50 transition-transform ${showAlertPanel ? 'rotate-180' : ''}`} />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 flex items-center justify-center px-1 rounded-full bg-red-500 text-[8px] font-mono font-bold text-white tabular-nums animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showAlertPanel && (
            <AlertDropdown onClose={() => setShowAlertPanel(false)} />
          )}
        </div>

        <div className="h-6 w-px bg-[var(--palantir-border)]" />

        {/* SHELTERS dropdown */}
        <div className="relative" ref={shelterRef}>
          <button
            onClick={() => setShowShelterPanel(!showShelterPanel)}
            className="relative flex items-center gap-2 px-3 py-1.5 rounded border cursor-pointer hover:brightness-125 transition-all text-green-400 bg-green-500/20 border-green-500/50"
            title="UAE Emergency Shelters"
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="text-[10px] font-mono tracking-wider">SHELTERS</span>
            <span className="text-[9px] font-mono text-green-400/80">{SHELTERS.length}</span>
            <ChevronDown className={`w-3 h-3 opacity-50 transition-transform ${showShelterPanel ? 'rotate-180' : ''}`} />
          </button>

          {showShelterPanel && (
            <div className="absolute top-full mt-1 right-0 w-[420px] bg-[var(--palantir-surface)] border border-[var(--palantir-border)] rounded-lg shadow-2xl shadow-black/60 overflow-hidden z-[100] animate-alertFadeIn">
              {/* Title + stats */}
              <div className="px-3 py-2 border-b border-[var(--palantir-border)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-[9px] font-mono font-bold text-[var(--palantir-text-muted)] tracking-[0.2em]">
                    UAE EMERGENCY SHELTERS{selectedEmirate !== 'ALL' ? ` — ${selectedEmirate.toUpperCase()}` : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-mono text-green-400 bg-green-500/20 px-1.5 py-0.5 rounded">
                    {openShelters.length} OPEN
                  </span>
                  <span className="text-[8px] font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">
                    {totalCapacity.toLocaleString()} CAP
                  </span>
                </div>
              </div>

              {/* Emirate filter */}
              <div className="px-2 py-1.5 border-b border-[var(--palantir-border)]/50 flex items-center gap-1 flex-wrap">
                <button
                  onClick={() => setSelectedEmirate('ALL')}
                  className={`text-[8px] font-mono px-1.5 py-0.5 rounded transition-colors ${
                    selectedEmirate === 'ALL'
                      ? 'bg-green-500/30 text-green-400 border border-green-500/50'
                      : 'text-[var(--palantir-text-muted)] hover:bg-white/5 border border-transparent'
                  }`}
                >
                  ALL <span className="opacity-60">{SHELTERS.length}</span>
                </button>
                {EMIRATE_LIST.map(e => {
                  const count = SHELTERS.filter(s => s.emirate === e).length;
                  return (
                    <button
                      key={e}
                      onClick={() => setSelectedEmirate(e)}
                      className={`text-[8px] font-mono px-1.5 py-0.5 rounded transition-colors ${
                        selectedEmirate === e
                          ? 'bg-green-500/30 text-green-400 border border-green-500/50'
                          : 'text-[var(--palantir-text-muted)] hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      {EMIRATE_SHORT[e]} <span className="opacity-60">{count}</span>
                    </button>
                  );
                })}
              </div>

              {/* Shelter list */}
              <div className="max-h-[360px] overflow-y-auto p-1.5 space-y-1 scrollbar-hide">
                {filteredShelters.map(shelter => {
                  const statusColor = shelter.status === 'OPEN' ? 'text-green-400' : shelter.status === 'STANDBY' ? 'text-amber-400' : 'text-red-400';
                  const statusBg = shelter.status === 'OPEN' ? 'bg-green-500/20' : shelter.status === 'STANDBY' ? 'bg-amber-500/20' : 'bg-red-500/20';
                  return (
                    <button
                      key={shelter.id}
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('navigate-to-shelter', {
                          detail: { id: shelter.id, lat: shelter.lat, lng: shelter.lng },
                        }));
                        setShowShelterPanel(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded border border-transparent hover:bg-white/5 hover:border-[var(--palantir-border)] transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <MapPin className={`w-3.5 h-3.5 flex-shrink-0 ${statusColor}`} />
                          <span className="text-[10px] font-mono font-bold text-[var(--palantir-text)] truncate">
                            {shelter.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                          <span className={`text-[7px] font-mono font-bold px-1 py-0.5 rounded ${statusBg} ${statusColor}`}>
                            {shelter.status}
                          </span>
                          <span className="text-[8px] font-mono text-cyan-400">
                            {shelter.capacity.toLocaleString()}
                          </span>
                          <Navigation className="w-3 h-3 text-[var(--palantir-text-muted)] group-hover:text-green-400 transition-colors" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 pl-5.5">
                        <span className="text-[8px] font-mono text-[var(--palantir-text-muted)]">{shelter.district}</span>
                        {selectedEmirate === 'ALL' && (
                          <span className="text-[7px] font-mono text-green-400/70 bg-green-500/10 px-1 py-0.5 rounded">
                            {EMIRATE_SHORT[shelter.emirate]}
                          </span>
                        )}
                        <span className="text-[7px] font-mono text-[var(--palantir-text-muted)] bg-white/5 px-1 py-0.5 rounded">
                          {shelter.type} — B{shelter.levels}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="px-3 py-1.5 border-t border-[var(--palantir-border)]">
                <p className="text-[7px] font-mono text-[var(--palantir-text-muted)] tracking-wider">
                  SRC: NCEMA EMERGENCY GUIDE // UAE CIVIL DEFENCE AUTHORITIES // CLICK TO NAVIGATE ON MAP
                </p>
              </div>
            </div>
          )}
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

        {onLogout && (
          <>
            <div className="h-8 w-px bg-[var(--palantir-border)]" />
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 transition-all"
              title="End session"
            >
              <LogOut className="w-3.5 h-3.5 text-red-400" />
              <span className="text-[9px] font-mono text-red-400 tracking-wider">LOGOUT</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
}
