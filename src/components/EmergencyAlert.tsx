import { useState, useEffect, useRef, useCallback } from 'react';
import { AlertTriangle, X, ChevronDown, ChevronUp, Volume2, Shield, Settings, VolumeX, ExternalLink, CheckCircle2 } from 'lucide-react';
import { useEmergencyAlerts, type EmergencyAlert as AlertType, type AlertLevel, type AlertAuthority } from '../hooks/useEmergencyAlerts';

/* ─────────────── UAE NCEMA / MoI EMERGENCY ALERT SYSTEM ─────────────── */
/* Based on real alerts issued Feb 28 – Mar 1, 2026 during Iranian missile strikes */
/* Sources: Gulf News, The National, Khaleej Times, Al Arabiya */

// UAE authorities — these alerts are NON-DISMISSABLE (real behavior)
const UAE_AUTHORITIES: AlertAuthority[] = ['NCEMA', 'MOI', 'MOD'];

const LEVEL_CONFIG: Record<AlertLevel, {
  bg: string;
  border: string;
  text: string;
  icon: string;
  glow: string;
  label: string;
  stripe: string;
}> = {
  EXTREME: {
    bg: 'bg-red-600/95',
    border: 'border-red-400',
    text: 'text-white',
    icon: 'text-white',
    glow: 'shadow-[0_0_60px_rgba(239,68,68,0.6)]',
    label: 'EXTREME THREAT',
    stripe: 'bg-red-500',
  },
  SEVERE: {
    bg: 'bg-orange-600/95',
    border: 'border-orange-300',
    text: 'text-white',
    icon: 'text-white',
    glow: 'shadow-[0_0_40px_rgba(249,115,22,0.5)]',
    label: 'SEVERE THREAT',
    stripe: 'bg-orange-500',
  },
  MODERATE: {
    bg: 'bg-amber-600/90',
    border: 'border-amber-300',
    text: 'text-white',
    icon: 'text-white',
    glow: 'shadow-[0_0_30px_rgba(245,158,11,0.4)]',
    label: 'ELEVATED THREAT',
    stripe: 'bg-amber-500',
  },
};

// Authority display config
const AUTHORITY_CONFIG: Record<AlertAuthority, { label: string; labelAr: string; color: string }> = {
  NCEMA: { label: 'NCEMA', labelAr: 'الهيئة الوطنية لإدارة الطوارئ', color: 'bg-white/20' },
  MOI: { label: 'Ministry of Interior', labelAr: 'وزارة الداخلية', color: 'bg-white/25' },
  MOD: { label: 'Ministry of Defence', labelAr: 'وزارة الدفاع', color: 'bg-white/25' },
  CENTCOM: { label: 'US CENTCOM', labelAr: '', color: 'bg-blue-500/30' },
  IDF: { label: 'IDF', labelAr: '', color: 'bg-cyan-500/30' },
  COALITION: { label: 'COALITION', labelAr: '', color: 'bg-purple-500/30' },
};

// ─── ALARM SOUND (Web Audio API siren) ───
let audioCtx: AudioContext | null = null;
let sirenTimeout: ReturnType<typeof setTimeout> | null = null;

function playAlarmSiren() {
  try {
    if (!audioCtx) audioCtx = new AudioContext();
    const ctx = audioCtx;

    const duration = 3;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, ctx.currentTime);

    for (let i = 0; i < duration * 2; i++) {
      const t = ctx.currentTime + i * 0.5;
      osc.frequency.linearRampToValueAtTime(i % 2 === 0 ? 880 : 440, t + 0.5);
    }

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {
    /* Web Audio not available */
  }
}

// Format full date + time for alert display
function formatAlertDateTime(ts: number): string {
  const d = new Date(ts);
  const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  return `${date} ${time} UTC`;
}

// Short time for header bar
function formatAlertTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

// ─── ALERT SETTINGS ───
interface AlertSettings {
  enabledLevels: Record<AlertLevel, boolean>;
  soundEnabled: boolean;
}

const DEFAULT_SETTINGS: AlertSettings = {
  enabledLevels: { EXTREME: true, SEVERE: true, MODERATE: true },
  soundEnabled: true,
};

function loadAlertSettings(): AlertSettings {
  try {
    const stored = localStorage.getItem('roar-alert-settings');
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch { /* ignore */ }
  return DEFAULT_SETTINGS;
}

function saveAlertSettings(settings: AlertSettings) {
  try {
    localStorage.setItem('roar-alert-settings', JSON.stringify(settings));
  } catch { /* ignore */ }
}

// ─── ALERT BANNER ───
function AlertBanner({
  alert,
  onDismiss,
  onMarkRead,
  isTop,
  isUaeAuthority,
}: {
  alert: AlertType;
  onDismiss: () => void;
  onMarkRead: () => void;
  isTop: boolean;
  isUaeAuthority: boolean;
}) {
  const config = LEVEL_CONFIG[alert.level];
  const authConfig = AUTHORITY_CONFIG[alert.authority];
  const [expanded, setExpanded] = useState(isTop);
  const isRead = alert.readAt !== null;

  return (
    <div
      className={`
        relative overflow-hidden rounded-lg border-2 ${config.border} ${config.glow}
        transition-all duration-500 ease-out
        ${isTop ? 'animate-alertSlideIn' : 'animate-alertFadeIn'}
        ${isRead ? 'opacity-60' : ''}
      `}
    >
      {/* Animated warning stripe bar at top */}
      <div className="h-1 w-full overflow-hidden">
        <div className={`h-full ${config.stripe} ${!isRead ? 'animate-alertStripe' : ''}`}
          style={{
            backgroundImage: `repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 8px,
              rgba(0,0,0,0.3) 8px,
              rgba(0,0,0,0.3) 16px
            )`,
            backgroundSize: '200% 100%',
          }}
        />
      </div>

      {/* Main alert body */}
      <div className={`${config.bg} backdrop-blur-sm px-4 py-3`}>
        {/* Authority bar — like the real UAE notification header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`text-[8px] font-mono font-bold tracking-wider text-white/90 ${authConfig.color} px-2 py-0.5 rounded`}>
              {authConfig.label}
            </span>
            {authConfig.labelAr && (
              <span className="text-[9px] text-white/60" dir="rtl">
                {authConfig.labelAr}
              </span>
            )}
            {isUaeAuthority && (
              <span className="text-[7px] font-mono font-bold text-white/50 bg-white/10 px-1.5 py-0.5 rounded tracking-wider">
                MANDATORY
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isRead && (
              <Volume2 className={`w-3 h-3 text-white/60 ${isTop ? 'animate-pulse' : ''}`} />
            )}
            {/* Date + Time */}
            <span className="text-[9px] font-mono text-white/70 tabular-nums">
              {formatAlertTime(alert.timestamp)}
            </span>
            {/* UAE alerts are NOT dismissable */}
            {!isUaeAuthority && !isRead && (
              <button
                onClick={(e) => { e.stopPropagation(); onDismiss(); }}
                className="p-0.5 rounded hover:bg-black/20 transition-colors"
              >
                <X className="w-3.5 h-3.5 text-white/70 hover:text-white" />
              </button>
            )}
            {isRead && (
              <CheckCircle2 className="w-3.5 h-3.5 text-green-300/80" />
            )}
          </div>
        </div>

        {/* Header row */}
        <div className="flex items-start gap-3">
          {/* Pulsing alert icon */}
          <div className="relative flex-shrink-0">
            <AlertTriangle className={`w-6 h-6 ${config.icon} ${isTop && !isRead ? 'animate-alertPulse' : ''}`} />
            {isTop && !isRead && (
              <div className="absolute inset-0 animate-ping">
                <AlertTriangle className={`w-6 h-6 ${config.icon} opacity-40`} />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            {/* Level badge + region + date */}
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[9px] font-mono font-black tracking-[0.2em] text-white/90 bg-black/30 px-1.5 py-0.5 rounded">
                {config.label}
              </span>
              <span className="text-[9px] font-mono text-white/70 tracking-wider">
                {alert.region}
              </span>
              <span className="text-[8px] font-mono text-white/50 tabular-nums">
                {formatAlertDateTime(alert.timestamp)}
              </span>
            </div>

            {/* Headline EN */}
            <h3 className={`text-sm font-black font-mono tracking-wide ${config.text} leading-tight`}>
              {alert.headline}
            </h3>

            {/* Headline AR (if available) */}
            {alert.headlineAr && (
              <p className="text-xs text-white/70 mt-0.5 leading-tight" dir="rtl">
                {alert.headlineAr}
              </p>
            )}
          </div>
        </div>

        {/* Expandable body */}
        {expanded && (
          <div className="mt-2 pl-9 border-t border-white/20 pt-2 space-y-1.5">
            {/* Body EN */}
            <p className="text-[11px] font-mono text-white/85 leading-relaxed">
              {alert.body}
            </p>

            {/* Body AR (if available) */}
            {alert.bodyAr && (
              <p className="text-[11px] text-white/70 leading-relaxed" dir="rtl">
                {alert.bodyAr}
              </p>
            )}

            {/* Footer: source (clickable) + time + branding */}
            <div className="flex items-center justify-between pt-1 border-t border-white/10">
              <div className="flex items-center gap-3">
                {/* Clickable source */}
                {alert.sourceUrl ? (
                  <a
                    href={alert.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[9px] font-mono text-cyan-300 hover:text-cyan-200 bg-cyan-500/10 hover:bg-cyan-500/20 px-1.5 py-0.5 rounded transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-2.5 h-2.5" />
                    {alert.source}
                  </a>
                ) : (
                  <span className="text-[9px] font-mono text-white/50">
                    SRC: {alert.source}
                  </span>
                )}
                <span className="text-[9px] font-mono text-white/50 tabular-nums">
                  {formatAlertDateTime(alert.timestamp)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-white/40" />
                <span className="text-[8px] font-mono text-white/40 tracking-wider">
                  BRE4CH ALERT SYSTEM
                </span>
              </div>
            </div>

            {/* MARK AS READ button — required to validate and dismiss */}
            {!isRead && (
              <button
                onClick={(e) => { e.stopPropagation(); onMarkRead(); }}
                className="w-full mt-1 flex items-center justify-center gap-2 py-1.5 rounded bg-green-600/30 hover:bg-green-600/50 border border-green-400/40 transition-all"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-green-300" />
                <span className="text-[10px] font-mono font-bold text-green-300 tracking-wider">
                  MARK AS READ — ACKNOWLEDGE
                </span>
              </button>
            )}
            {isRead && (
              <div className="w-full mt-1 flex items-center justify-center gap-2 py-1 rounded bg-green-600/10 border border-green-400/20">
                <CheckCircle2 className="w-3 h-3 text-green-400/60" />
                <span className="text-[9px] font-mono text-green-400/60 tracking-wider">
                  ACKNOWLEDGED {new Date(alert.readAt!).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Expand/collapse toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center mt-1 py-0.5 hover:bg-black/10 rounded transition-colors"
        >
          {expanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-white/50" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-white/50" />
          )}
        </button>
      </div>

      {/* Bottom stripe */}
      <div className="h-0.5 w-full overflow-hidden">
        <div className={`h-full ${config.stripe}`}
          style={{
            backgroundImage: `repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 8px,
              rgba(0,0,0,0.3) 8px,
              rgba(0,0,0,0.3) 16px
            )`,
            backgroundSize: '200% 100%',
          }}
        />
      </div>
    </div>
  );
}

// ─── SETTINGS PANEL ───
function AlertSettingsPanel({
  settings,
  onUpdate,
}: {
  settings: AlertSettings;
  onUpdate: (s: AlertSettings) => void;
}) {
  const toggleLevel = (level: AlertLevel) => {
    if (level === 'EXTREME') return;
    const next = {
      ...settings,
      enabledLevels: {
        ...settings.enabledLevels,
        [level]: !settings.enabledLevels[level],
      },
    };
    onUpdate(next);
  };

  const toggleSound = () => {
    onUpdate({ ...settings, soundEnabled: !settings.soundEnabled });
  };

  return (
    <div className="mb-2 p-3 rounded-lg bg-[var(--palantir-surface)] border border-[var(--palantir-border)] animate-alertFadeIn">
      <div className="text-[9px] font-mono font-bold text-[var(--palantir-text-muted)] tracking-[0.2em] mb-2">
        ALERT CONFIGURATION
      </div>

      <div className="space-y-1.5">
        {(['EXTREME', 'SEVERE', 'MODERATE'] as AlertLevel[]).map(level => {
          const config = LEVEL_CONFIG[level];
          const enabled = settings.enabledLevels[level];
          const isLocked = level === 'EXTREME';

          return (
            <button
              key={level}
              onClick={() => toggleLevel(level)}
              disabled={isLocked}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded border transition-all text-left ${
                enabled
                  ? `${config.bg} ${config.border} ${config.text}`
                  : 'bg-black/30 border-[var(--palantir-border)] text-[var(--palantir-text-muted)]'
              } ${isLocked ? 'opacity-80 cursor-not-allowed' : 'hover:brightness-110 cursor-pointer'}`}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className={`w-3.5 h-3.5 ${enabled ? config.icon : 'text-[var(--palantir-text-muted)]'}`} />
                <span className="text-[10px] font-mono font-bold tracking-wider">
                  {config.label}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {isLocked && (
                  <span className="text-[7px] font-mono text-white/50 bg-white/10 px-1 py-0.5 rounded">
                    LOCKED
                  </span>
                )}
                <div className={`w-7 h-3.5 rounded-full transition-colors relative ${
                  enabled ? 'bg-green-500/60' : 'bg-gray-600/60'
                }`}>
                  <div className={`absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white transition-transform ${
                    enabled ? 'translate-x-3.5' : 'translate-x-0.5'
                  }`} />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <button
        onClick={toggleSound}
        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded border border-[var(--palantir-border)] bg-black/20 mt-2 hover:bg-black/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          {settings.soundEnabled ? (
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <VolumeX className="w-3.5 h-3.5 text-[var(--palantir-text-muted)]" />
          )}
          <span className="text-[10px] font-mono font-bold text-[var(--palantir-text)] tracking-wider">
            ALARM SIREN
          </span>
        </div>
        <div className={`w-7 h-3.5 rounded-full transition-colors relative ${
          settings.soundEnabled ? 'bg-green-500/60' : 'bg-gray-600/60'
        }`}>
          <div className={`absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white transition-transform ${
            settings.soundEnabled ? 'translate-x-3.5' : 'translate-x-0.5'
          }`} />
        </div>
      </button>

      <p className="text-[8px] font-mono text-[var(--palantir-text-muted)] mt-2 leading-relaxed">
        UAE NCEMA/MoI/MoD alerts are mandatory and cannot be disabled or dismissed.
        Alerts must be read and acknowledged to be validated. Each alert is shown once only.
      </p>
    </div>
  );
}

// ─── ALERT DROPDOWN (rendered inside Header THREATCON button) ───
export function AlertDropdown({ onClose }: { onClose: () => void }) {
  const { activeAlerts, dismissAlert, markAsRead } = useEmergencyAlerts();
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<AlertSettings>(loadAlertSettings);
  const playedAlertsRef = useRef<Set<string>>(new Set());

  const updateSettings = useCallback((s: AlertSettings) => {
    setSettings(s);
    saveAlertSettings(s);
  }, []);

  // Filter alerts by enabled levels (UAE alerts always show)
  const filteredAlerts = activeAlerts.filter(a => {
    const isUae = UAE_AUTHORITIES.includes(a.authority);
    if (isUae) return true;
    return settings.enabledLevels[a.level];
  });

  // Play alarm siren for new UAE EXTREME alerts
  useEffect(() => {
    if (!settings.soundEnabled) return;

    for (const alert of filteredAlerts) {
      if (playedAlertsRef.current.has(alert.id)) continue;
      playedAlertsRef.current.add(alert.id);

      const isUae = UAE_AUTHORITIES.includes(alert.authority);
      if (isUae || alert.level === 'EXTREME') {
        if (sirenTimeout) clearTimeout(sirenTimeout);
        sirenTimeout = setTimeout(playAlarmSiren, 300);
      }
    }
  }, [filteredAlerts, settings.soundEnabled]);

  const filteredCount = filteredAlerts.length;
  const unreadCount = filteredAlerts.filter(a => a.readAt === null).length;
  const dismissableAlerts = filteredAlerts.filter(a => !UAE_AUTHORITIES.includes(a.authority) && a.readAt !== null);

  return (
    <div className="absolute top-full mt-1 right-0 w-[460px] max-h-[calc(100vh-80px)] overflow-y-auto scrollbar-hide bg-[var(--palantir-surface)] border border-[var(--palantir-border)] rounded-lg shadow-2xl shadow-black/60 z-[100] animate-alertFadeIn">
      {/* Panel header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--palantir-border)]">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${unreadCount > 0 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
          <span className="text-[9px] font-mono font-bold text-red-400 tracking-[0.15em]">
            EMERGENCY ALERT SYSTEM
          </span>
          <span className="text-[8px] font-mono text-red-400/60 tabular-nums">
            {filteredCount > 0 ? `${filteredCount} ACTIVE` : 'NO ALERTS'}{unreadCount > 0 ? ` / ${unreadCount} UNREAD` : ''}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }}
            className={`p-1 rounded transition-colors ${
              showSettings
                ? 'bg-amber-500/20 text-amber-400'
                : 'text-[var(--palantir-text-muted)] hover:text-white hover:bg-white/10'
            }`}
            title="Alert settings"
          >
            <Settings className="w-3 h-3" />
          </button>
          {dismissableAlerts.length > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); dismissableAlerts.forEach(a => dismissAlert(a.id)); }}
              className="text-[8px] font-mono text-red-400/70 hover:text-red-400 px-1.5 py-0.5 rounded hover:bg-red-500/10 transition-colors"
            >
              CLEAR READ
            </button>
          )}
        </div>
      </div>

      {showSettings && (
        <div className="border-b border-[var(--palantir-border)]">
          <AlertSettingsPanel settings={settings} onUpdate={updateSettings} />
        </div>
      )}

      {/* Alert stack */}
      {filteredCount > 0 ? (
        <div className="p-2 space-y-2">
          {filteredAlerts.slice(0, 5).map((alert, idx) => (
            <AlertBanner
              key={alert.id}
              alert={alert}
              onDismiss={() => dismissAlert(alert.id)}
              onMarkRead={() => markAsRead(alert.id)}
              isTop={idx === 0}
              isUaeAuthority={UAE_AUTHORITIES.includes(alert.authority)}
            />
          ))}
        </div>
      ) : (
        <div className="px-4 py-6 text-center">
          <AlertTriangle className="w-6 h-6 text-[var(--palantir-text-muted)] mx-auto mb-2 opacity-40" />
          <p className="text-[10px] font-mono text-[var(--palantir-text-muted)]">
            No active alerts — monitoring live feeds
          </p>
        </div>
      )}

      {filteredCount > 5 && (
        <div className="pb-2 text-center">
          <span className="text-[9px] font-mono text-red-400/60">
            +{filteredCount - 5} more alerts
          </span>
        </div>
      )}

      <div className="px-3 py-1.5 border-t border-[var(--palantir-border)]">
        <p className="text-[7px] font-mono text-[var(--palantir-text-muted)] tracking-wider">
          BRE4CH ALERT SYSTEM // UAE NCEMA/MOI/MOD MANDATORY // LIVE RSS FEED MONITORING
        </p>
      </div>
    </div>
  );
}
