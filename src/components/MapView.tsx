import { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, InfoWindow, Circle } from '@react-google-maps/api';
import { infrastructure, epicFuryPositions, INFRA_COLORS, STATUS_COLORS } from '../data/mockData';
import { SHELTERS } from './SheltersPanel';
import type { InfrastructurePoint, MilitaryPosition, InfraType, InfraStatus } from '../data/mockData';
import { useEventFeed } from '../hooks/useEventFeed';

const mapContainerStyle = { width: '100%', height: '100%' };
const center = { lat: 32.4279, lng: 53.688 };

const darkMapStyles = [
  { elementType: 'geometry', stylers: [{ color: '#0a0e14' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0a0e14' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6e7681' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#21262d' }] },
  { featureType: 'administrative.country', elementType: 'labels.text.fill', stylers: [{ color: '#8b949e' }] },
  { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#f59e0b', weight: 1.5 }] },
  { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.province', elementType: 'geometry.stroke', stylers: [{ color: '#30363d' }] },
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#0d1117' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: '#161b22' }] },
  { featureType: 'road', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#1a1f26' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#21262d' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0c2d48' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#3d5a80' }] },
];

const mapOptions: google.maps.MapOptions = {
  styles: darkMapStyles,
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
  scaleControl: true,
  minZoom: 5,
  maxZoom: 18,
  backgroundColor: '#0a0e14',
};

// --------------- COBALT STRIKE OPS ---------------

interface CyberOp {
  id: string;
  label: string;
  icon: string;
  color: string;
  category: 'access' | 'recon' | 'attack' | 'persist';
  description: string;
}

const CYBER_OPS: CyberOp[] = [
  { id: 'beacon', label: 'Deploy Beacon', icon: '\u25C9', color: '#22c55e', category: 'access', description: 'Deploy C2 beacon on target network' },
  { id: 'portscan', label: 'Port Scan', icon: '\u25CE', color: '#06b6d4', category: 'recon', description: 'Scan open ports and services' },
  { id: 'screenshot', label: 'Screenshot', icon: '\u25A3', color: '#8b5cf6', category: 'recon', description: 'Capture screen from compromised host' },
  { id: 'keylog', label: 'Keylogger', icon: '\u2328', color: '#f59e0b', category: 'recon', description: 'Deploy keystroke logger' },
  { id: 'mimikatz', label: 'Credential Harvest', icon: '\u26BF', color: '#ef4444', category: 'access', description: 'Extract credentials (Mimikatz/LSASS)' },
  { id: 'inject', label: 'Process Inject', icon: '\u2699', color: '#ec4899', category: 'persist', description: 'Inject payload into running process' },
  { id: 'lateral', label: 'Lateral Movement', icon: '\u21C4', color: '#f97316', category: 'access', description: 'Pivot to adjacent network segment' },
  { id: 'exfil', label: 'Exfiltrate Data', icon: '\u21E7', color: '#a855f7', category: 'attack', description: 'Exfiltrate sensitive data via C2 channel' },
  { id: 'scada', label: 'SCADA Attack', icon: '\u26A1', color: '#ef4444', category: 'attack', description: 'Target ICS/SCADA systems' },
  { id: 'ddos', label: 'DDoS Launch', icon: '\u2301', color: '#dc2626', category: 'attack', description: 'Distributed denial of service attack' },
  { id: 'wiper', label: 'Deploy Wiper', icon: '\u2620', color: '#991b1b', category: 'attack', description: 'Deploy destructive wiper malware (BiBi)' },
  { id: 'persist', label: 'Persistence', icon: '\u267E', color: '#14b8a6', category: 'persist', description: 'Establish persistent backdoor access' },
];

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  access: { label: 'ACCESS', color: '#22c55e' },
  recon: { label: 'RECON', color: '#06b6d4' },
  attack: { label: 'ATTACK', color: '#ef4444' },
  persist: { label: 'PERSIST', color: '#f59e0b' },
};

interface OpStatus {
  opId: string;
  targetId: string;
  status: 'running' | 'success' | 'failed';
  startTime: number;
}

// --------------- CUSTOM POI ---------------

interface CustomPOI {
  id: string;
  name: string;
  type: InfraType;
  status: InfraStatus;
  coords: [number, number];
  description: string;
  timestamp: number;
}

// --------------- TYPE SELECTOR ---------------

const INFRA_TYPE_OPTIONS: { type: InfraType; label: string; color: string }[] = [
  { type: 'nuclear', label: 'Nuclear', color: INFRA_COLORS.nuclear },
  { type: 'military', label: 'Military', color: INFRA_COLORS.military },
  { type: 'airbase', label: 'Airbase', color: INFRA_COLORS.airbase },
  { type: 'naval', label: 'Naval', color: INFRA_COLORS.naval },
  { type: 'command', label: 'Command', color: INFRA_COLORS.command },
  { type: 'missile', label: 'Missile', color: INFRA_COLORS.missile },
  { type: 'oil', label: 'Oil/Energy', color: INFRA_COLORS.oil },
  { type: 'radar', label: 'Radar/AD', color: INFRA_COLORS.radar },
  { type: 'chemical', label: 'Chemical', color: INFRA_COLORS.chemical },
];

const STATUS_OPTIONS: { status: InfraStatus; label: string; color: string }[] = [
  { status: 'active', label: 'Active', color: STATUS_COLORS.active },
  { status: 'damaged', label: 'Damaged', color: STATUS_COLORS.damaged },
  { status: 'neutralized', label: 'Neutralized', color: STATUS_COLORS.neutralized },
  { status: 'unknown', label: 'Unknown', color: STATUS_COLORS.unknown },
];

// --------------- INTEL REPORTS (sourced, per-target) ---------------

interface IntelReport {
  source: string;
  sourceColor: string;
  sourceUrl?: string;
  classification: string; // A1-E6
  text: string;
  timestamp: string;
  imageUrl?: string;
  imageCaption?: string;
}

// Verified intel reports keyed by target id — all sourced from Reuters, Al Jazeera, IDF, CENTCOM
const INTEL_REPORTS: Record<string, IntelReport[]> = {
  'inf-01': [  // Natanz
    { source: 'IAEA', sourceColor: '#06b6d4', classification: 'A2', text: 'Iran IAEA ambassador confirms Natanz was targeted by coalition strikes. No confirmed radiological damage as of Mar 2. IAEA inspectors requesting access.', timestamp: '6h ago', sourceUrl: 'https://www.reuters.com', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Natanz_nuclear_facility_satellite_image.jpg/1280px-Natanz_nuclear_facility_satellite_image.jpg', imageCaption: 'Sentinel-2 imagery — Natanz enrichment facility' },
    { source: 'Reuters', sourceColor: '#f97316', classification: 'A2', text: 'Cannot rule out radiological release near Natanz and Fordow nuclear sites. IAEA monitoring ongoing.', timestamp: '8h ago' },
  ],
  'inf-02': [  // Fordow
    { source: 'Reuters', sourceColor: '#f97316', classification: 'A2', text: 'Underground enrichment facility at Fordow reportedly struck with bunker-busting munitions. Depth of facility (80m underground) may have limited damage.', timestamp: '12h ago', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/55/Fordo_-_Nuclear_Fuel_Enrichment_Plant.jpg', imageCaption: 'Fordow underground facility — pre-strike imagery' },
  ],
  'inf-06': [  // Tehran HQ IRGC
    { source: 'Reuters', sourceColor: '#f97316', classification: 'A2', text: 'Khamenei confirmed killed in coalition strikes on Tehran. 40+ senior Iranian leaders dead in opening wave of Operation Epic Fury.', timestamp: '2d ago', sourceUrl: 'https://www.reuters.com' },
    { source: 'IDF', sourceColor: '#06b6d4', classification: 'B2', text: 'IDF confirms strikes dismantled Iranian state broadcaster. 7 Iranian security leaders confirmed killed in separate operations.', timestamp: '1d ago', sourceUrl: 'https://x.com/IDF', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Tehran_City_in_night.jpg/1280px-Tehran_City_in_night.jpg', imageCaption: 'Tehran — post-strike assessment pending' },
  ],
  'inf-08': [  // Khorramabad MRBM
    { source: 'CENTCOM', sourceColor: '#22c55e', classification: 'A1', text: 'US forces have struck over 1,000 targets in the first 2 days. MRBM launch sites including Khorramabad are priority targets. Estimated 60% of MRBM stockpile expended by IRGC before neutralization.', timestamp: '1d ago', sourceUrl: 'https://x.com/CENTCOM' },
  ],
  'inf-16': [  // Bandar Abbas
    { source: 'Reuters', sourceColor: '#f97316', classification: 'A2', text: '9 Iranian naval ships sunk. Naval HQ at Bandar Abbas largely destroyed. Iranian naval presence denied in Gulf of Oman within 48 hours.', timestamp: '1d ago', sourceUrl: 'https://www.reuters.com', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Bandar_Abbas_Naval_Base_satellite_image.jpg/640px-Bandar_Abbas_Naval_Base_satellite_image.jpg', imageCaption: 'UNCLASSIFIED — Bandar Abbas naval facility' },
    { source: 'CENTCOM', sourceColor: '#22c55e', classification: 'A1', text: 'Two days ago, the Iranian regime had 11 ships in the Gulf of Oman, today they have ZERO. Freedom of maritime navigation will be defended.', timestamp: '6h ago', sourceUrl: 'https://x.com/CENTCOM' },
  ],
  'inf-18': [  // Kharg Island
    { source: 'Reuters', sourceColor: '#f97316', classification: 'A2', text: 'Oil hits $155/barrel as Iran strikes disrupt exports. Kharg Island — responsible for 90% of Iranian crude exports — struck in first wave.', timestamp: '1d ago' },
    { source: 'Al Jazeera', sourceColor: '#f59e0b', classification: 'B2', text: 'Strait of Hormuz declared closed by Iranian general. Major shipping disruption. EW activity detected across the strait.', timestamp: '18h ago', sourceUrl: 'https://www.aljazeera.com' },
  ],
  'inf-14': [  // Isfahan 8th TAB
    { source: 'IDF', sourceColor: '#06b6d4', classification: 'B2', text: 'IAF dropped 1,200+ munitions across 24 of 31 Iranian provinces. 30+ separate strike operations against ballistic missile and air defense arrays. Isfahan 8th TAB confirmed damaged.', timestamp: '1d ago', sourceUrl: 'https://x.com/IDF' },
  ],
  'inf-03': [  // Arak
    { source: 'Reuters', sourceColor: '#f97316', classification: 'A2', text: 'Heavy water reactor at Arak targeted. Damage assessment ongoing. No radiological concern reported by IAEA as of Mar 2.', timestamp: '1d ago' },
  ],
};

// Generic reports for targets without specific intel
const GENERIC_REPORTS: IntelReport[] = [
  { source: 'CENTCOM', sourceColor: '#22c55e', classification: 'A1', text: 'Target included in 1,000+ strikes across Iran theater. Specific BDA pending aerial reconnaissance.', timestamp: '1d ago' },
  { source: 'Reuters', sourceColor: '#f97316', classification: 'A2', text: 'Coalition operations continue across multiple Iranian provinces. Full damage assessment expected within 72 hours.', timestamp: '12h ago' },
];

// Intel for military positions
const FORCE_INTEL: Record<string, IntelReport[]> = {
  'ef-01': [  // USS Abraham Lincoln
    { source: 'CENTCOM', sourceColor: '#22c55e', classification: 'A1', text: 'CVN-72 Abraham Lincoln CSG-3 continuing operations in Arabian Sea. IRGC claim of 4 ballistic missile hits DENIED — no damage to carrier group.', timestamp: '6h ago', sourceUrl: 'https://x.com/CENTCOM' },
    { source: 'Al Jazeera', sourceColor: '#f59e0b', classification: 'D5', text: 'IRGC claims targeting USS Abraham Lincoln with 4 ballistic missiles — NO independent confirmation of hit. Carrier group continuing operations.', timestamp: '18h ago' },
  ],
  'ef-02': [  // USS Gerald R. Ford
    { source: 'Reuters', sourceColor: '#f97316', classification: 'A2', text: 'CVN-78 Gerald R. Ford CSG-12 transiting from Eastern Med to 5th Fleet AOR. Carrier-launched strikes ongoing.', timestamp: '1d ago' },
  ],
  'ef-07': [  // Al Udeid
    { source: 'Al Jazeera', sourceColor: '#f59e0b', classification: 'B2', text: 'Qatar: 65 missiles + 12 drones fired at Doha area including Al Udeid vicinity. Most intercepted. 16 injured. Explosions heard for 3 consecutive days.', timestamp: '12h ago' },
  ],
  'ef-08': [  // Al Dhafra
    { source: 'Al Jazeera', sourceColor: '#f59e0b', classification: 'A2', text: 'UAE: 165 BM + 2 cruise + 541 drones fired at UAE. 21 drones penetrated defenses. 3 KIA, 58 WIA. Dubai airport shut down.', timestamp: '8h ago', sourceUrl: 'https://www.aljazeera.com', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/US_Air_Force_Al_Dhafra.jpg/1280px-US_Air_Force_Al_Dhafra.jpg', imageCaption: 'Al Dhafra Air Base — USAF operations' },
  ],
  'ef-09': [  // Camp Arifjan
    { source: 'Al Jazeera', sourceColor: '#f59e0b', classification: 'A2', text: 'Kuwait: 97 BM + 283 drones all intercepted, but Kuwait airport hit by single drone. 1 KIA, 32 WIA.', timestamp: '1d ago' },
    { source: 'Reuters', sourceColor: '#f97316', classification: 'A2', text: '6 US aircrew killed in Kuwait — F-15E Strike Eagles shot down by Kuwaiti Patriot battery. Friendly fire incident under investigation.', timestamp: '1d ago' },
  ],
  'ef-12': [  // Ovda (F-22 Raptors)
    { source: 'IDF', sourceColor: '#06b6d4', classification: 'B2', text: 'First-ever US F-22A Raptor offensive deployment from Israeli territory. 12 Raptors operating from Ovda for air superiority missions over Iran.', timestamp: '2d ago', sourceUrl: 'https://x.com/IDF' },
    { source: 'Al Jazeera', sourceColor: '#f59e0b', classification: 'B2', text: 'Warhead lands near Temple Mount in Jerusalem. 40+ buildings damaged in Tel Aviv. Israel: 9+ KIA, 121 WIA. Arrow-3 exo-atmospheric intercept confirmed.', timestamp: '1d ago' },
  ],
};

// --------------- INFO CONTENT COMPONENTS ---------------

function InfraInfoContent({ inf, onLaunchOp, opStatuses }: {
  inf: InfrastructurePoint | CustomPOI;
  onLaunchOp: (opId: string, targetId: string) => void;
  opStatuses: OpStatus[];
}) {
  const [showOps, setShowOps] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('access');
  const [showIntel, setShowIntel] = useState(true);
  const targetOps = opStatuses.filter(o => o.targetId === inf.id);
  const isCustom = 'timestamp' in inf;
  const reports = INTEL_REPORTS[inf.id] || GENERIC_REPORTS;

  return (
    <div style={{ minWidth: 320, maxWidth: 400, padding: 8, fontFamily: "'JetBrains Mono', monospace", background: '#0d1117', color: '#e6edf3', borderRadius: 6 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLORS[inf.status], boxShadow: `0 0 8px ${STATUS_COLORS[inf.status]}` }} />
        <span style={{ fontWeight: 700, color: '#f59e0b', fontSize: 13 }}>{inf.name}</span>
        {'priority' in inf && (
          <span style={{ fontSize: 9, color: '#6e7681', textTransform: 'uppercase', marginLeft: 'auto', background: '#161b22', padding: '1px 6px', borderRadius: 3 }}>P{inf.priority}</span>
        )}
        {isCustom && (
          <span style={{ fontSize: 9, color: '#a855f7', marginLeft: 'auto', background: '#a855f720', padding: '1px 6px', borderRadius: 3, border: '1px solid #a855f740' }}>CUSTOM</span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <div style={{ fontSize: 10, color: INFRA_COLORS[inf.type], textTransform: 'uppercase', letterSpacing: 1 }}>
          {inf.type}
        </div>
        <div style={{ fontSize: 9, color: '#6e7681', padding: '1px 6px', background: '#161b22', borderRadius: 3 }}>
          {inf.coords[0].toFixed(3)}&deg;N {inf.coords[1].toFixed(3)}&deg;E
        </div>
      </div>
      <div style={{ fontSize: 10, color: '#8b949e', marginBottom: 6, lineHeight: 1.4 }}>
        {inf.description}
      </div>

      {/* Status + Defense */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 10, color: STATUS_COLORS[inf.status], fontWeight: 600 }}>
          {inf.status.toUpperCase()}
        </span>
        {'defenseLevel' in inf && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 9, color: '#6e7681' }}>DEF:</span>
            <div style={{ width: 50, height: 4, background: '#161b22', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                width: `${inf.defenseLevel}%`,
                height: '100%',
                background: inf.defenseLevel > 70 ? '#ef4444' : inf.defenseLevel > 40 ? '#f59e0b' : '#22c55e',
                borderRadius: 2,
              }} />
            </div>
            <span style={{ fontSize: 9, color: '#8b949e' }}>{inf.defenseLevel}%</span>
          </div>
        )}
      </div>

      {/* ─── INTEL REPORTS (Liveuamap style) ─── */}
      <div style={{ marginBottom: 8 }}>
        <button
          onClick={() => setShowIntel(!showIntel)}
          style={{
            width: '100%', padding: '5px 8px', background: showIntel ? '#f59e0b15' : '#161b22',
            border: `1px solid ${showIntel ? '#f59e0b40' : '#30363d'}`, borderRadius: 4,
            color: showIntel ? '#f59e0b' : '#8b949e', fontSize: 10, fontWeight: 600,
            cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace",
            textTransform: 'uppercase', letterSpacing: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          <span>{showIntel ? '\u25BC' : '\u25B6'}</span>
          INTEL REPORTS ({reports.length})
          <span style={{ fontSize: 8, color: '#6e7681', marginLeft: 'auto' }}>SOURCED</span>
        </button>

        {showIntel && (
          <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {reports.map((report, idx) => (
              <div key={idx} style={{ padding: '6px 8px', background: '#161b22', border: '1px solid #21262d', borderRadius: 4, borderLeft: `3px solid ${report.sourceColor}` }}>
                {/* Source header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: report.sourceColor, flexShrink: 0 }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: report.sourceColor }}>{report.source}</span>
                  <span style={{ fontSize: 8, color: '#6e7681', background: '#0d1117', padding: '0 4px', borderRadius: 2, border: '1px solid #30363d' }}>[{report.classification}]</span>
                  <span style={{ fontSize: 8, color: '#6e7681', marginLeft: 'auto' }}>{report.timestamp}</span>
                  {report.sourceUrl && (
                    <a href={report.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 8, color: '#58a6ff', textDecoration: 'none' }}>{'\u2197'} source</a>
                  )}
                </div>

                {/* Report text */}
                <div style={{ fontSize: 10, color: '#c9d1d9', lineHeight: 1.5, marginBottom: report.imageUrl ? 6 : 0 }}>
                  {report.text}
                </div>

                {/* Image (if available) */}
                {report.imageUrl && (
                  <div style={{ marginTop: 4 }}>
                    <img
                      src={report.imageUrl}
                      alt={report.imageCaption || 'Intel imagery'}
                      style={{
                        width: '100%', height: 120, objectFit: 'cover', borderRadius: 4,
                        border: '1px solid #30363d', filter: 'brightness(0.85) contrast(1.1)',
                      }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    {report.imageCaption && (
                      <div style={{ fontSize: 8, color: '#6e7681', marginTop: 2, fontStyle: 'italic' }}>{report.imageCaption}</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Running ops indicator */}
      {targetOps.length > 0 && (
        <div style={{ marginBottom: 8, padding: '4px 6px', background: '#22c55e10', border: '1px solid #22c55e30', borderRadius: 4 }}>
          <div style={{ fontSize: 9, color: '#22c55e', fontWeight: 600, marginBottom: 2 }}>ACTIVE OPERATIONS ({targetOps.length})</div>
          {targetOps.map(op => {
            const def = CYBER_OPS.find(c => c.id === op.opId);
            const elapsed = Math.floor((Date.now() - op.startTime) / 1000);
            return (
              <div key={`${op.opId}-${op.startTime}`} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <span style={{ fontSize: 9, color: def?.color || '#fff' }}>{def?.icon}</span>
                <span style={{ fontSize: 9, color: '#e6edf3' }}>{def?.label}</span>
                <span style={{
                  fontSize: 8, marginLeft: 'auto', padding: '0 4px', borderRadius: 2,
                  background: op.status === 'running' ? '#f59e0b20' : op.status === 'success' ? '#22c55e20' : '#ef444420',
                  color: op.status === 'running' ? '#f59e0b' : op.status === 'success' ? '#22c55e' : '#ef4444',
                  border: `1px solid ${op.status === 'running' ? '#f59e0b40' : op.status === 'success' ? '#22c55e40' : '#ef444440'}`,
                }}>
                  {op.status === 'running' ? `${elapsed}s` : op.status.toUpperCase()}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Cyber Ops Toggle */}
      <button
        onClick={() => setShowOps(!showOps)}
        style={{
          width: '100%', padding: '6px 8px', background: showOps ? '#ef444420' : '#161b22',
          border: `1px solid ${showOps ? '#ef444450' : '#30363d'}`, borderRadius: 4,
          color: showOps ? '#ef4444' : '#8b949e', fontSize: 10, fontWeight: 600,
          cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace",
          textTransform: 'uppercase', letterSpacing: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}
      >
        <span>{showOps ? '\u25BC' : '\u25B6'}</span>
        {showOps ? 'CLOSE OPERATIONS' : 'CYBER OPERATIONS'}
      </button>

      {/* Cobalt Strike-style Ops Panel */}
      {showOps && (
        <div style={{ marginTop: 8 }}>
          {/* Category tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
            {Object.entries(CATEGORY_LABELS).map(([cat, cfg]) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  flex: 1, padding: '3px 0', fontSize: 8, fontWeight: 600,
                  fontFamily: "'JetBrains Mono', monospace", cursor: 'pointer',
                  background: activeCategory === cat ? `${cfg.color}20` : '#161b22',
                  border: `1px solid ${activeCategory === cat ? `${cfg.color}50` : '#30363d'}`,
                  color: activeCategory === cat ? cfg.color : '#6e7681',
                  borderRadius: 3, textTransform: 'uppercase', letterSpacing: 0.5,
                }}
              >
                {cfg.label}
              </button>
            ))}
          </div>

          {/* Ops list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {CYBER_OPS.filter(op => op.category === activeCategory).map(op => {
              const isRunning = targetOps.some(t => t.opId === op.id && t.status === 'running');
              return (
                <button
                  key={op.id}
                  onClick={() => !isRunning && onLaunchOp(op.id, inf.id)}
                  title={op.description}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px',
                    background: isRunning ? `${op.color}10` : '#0d1117',
                    border: `1px solid ${isRunning ? `${op.color}40` : '#21262d'}`,
                    borderRadius: 4, cursor: isRunning ? 'not-allowed' : 'pointer',
                    fontFamily: "'JetBrains Mono', monospace", textAlign: 'left',
                    opacity: isRunning ? 0.6 : 1,
                  }}
                >
                  <span style={{ fontSize: 14, color: op.color, width: 18, textAlign: 'center' }}>{op.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: '#e6edf3', fontWeight: 600 }}>{op.label}</div>
                    <div style={{ fontSize: 8, color: '#6e7681' }}>{op.description}</div>
                  </div>
                  {isRunning ? (
                    <span style={{ fontSize: 8, color: '#f59e0b', background: '#f59e0b20', padding: '1px 4px', borderRadius: 2 }}>RUNNING</span>
                  ) : (
                    <span style={{ fontSize: 10, color: '#30363d' }}>{'\u25B6'}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function ForceInfoContent({ pos }: { pos: MilitaryPosition }) {
  const [showIntel, setShowIntel] = useState(false);
  const isAllied = pos.type === 'allied';
  const color = isAllied ? '#22c55e' : '#ef4444';
  const reports = FORCE_INTEL[pos.id] || [];

  return (
    <div style={{ minWidth: 280, maxWidth: 380, padding: 6, fontFamily: "'JetBrains Mono', monospace", background: '#0d1117', color: '#e6edf3', borderRadius: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}` }} />
        <span style={{ fontWeight: 700, color, fontSize: 13 }}>{pos.callsign}</span>
        <span style={{ fontSize: 9, color: '#6e7681', textTransform: 'uppercase', marginLeft: 'auto', background: '#161b22', padding: '1px 6px', borderRadius: 3 }}>
          {pos.branch}
        </span>
      </div>
      <div style={{ fontSize: 11, color: '#e6edf3', marginBottom: 4 }}>{pos.unit}</div>
      <div style={{ fontSize: 10, color: '#8b949e', marginBottom: 6, lineHeight: 1.4 }}>{pos.mission}</div>
      <div style={{ display: 'flex', gap: 12, marginBottom: reports.length > 0 ? 8 : 0 }}>
        <div>
          <div style={{ fontSize: 9, color: '#6e7681' }}>STRENGTH</div>
          <div style={{ fontSize: 12, fontWeight: 700, color }}>{pos.strength}%</div>
        </div>
        <div>
          <div style={{ fontSize: 9, color: '#6e7681' }}>READINESS</div>
          <div style={{ fontSize: 12, fontWeight: 700, color }}>{pos.readiness}%</div>
        </div>
        <div>
          <div style={{ fontSize: 9, color: '#6e7681' }}>STATUS</div>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#22c55e' }}>{pos.lastUpdate}</div>
        </div>
      </div>

      {/* Intel reports for this position */}
      {reports.length > 0 && (
        <div>
          <button
            onClick={() => setShowIntel(!showIntel)}
            style={{
              width: '100%', padding: '4px 8px', background: showIntel ? '#f59e0b15' : '#161b22',
              border: `1px solid ${showIntel ? '#f59e0b40' : '#30363d'}`, borderRadius: 4,
              color: showIntel ? '#f59e0b' : '#8b949e', fontSize: 9, fontWeight: 600,
              cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace",
              textTransform: 'uppercase', letterSpacing: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            <span>{showIntel ? '\u25BC' : '\u25B6'}</span>
            INTEL ({reports.length})
          </button>

          {showIntel && (
            <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 5 }}>
              {reports.map((report, idx) => (
                <div key={idx} style={{ padding: '5px 7px', background: '#161b22', border: '1px solid #21262d', borderRadius: 4, borderLeft: `3px solid ${report.sourceColor}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: report.sourceColor }} />
                    <span style={{ fontSize: 9, fontWeight: 700, color: report.sourceColor }}>{report.source}</span>
                    <span style={{ fontSize: 7, color: '#6e7681', background: '#0d1117', padding: '0 3px', borderRadius: 2 }}>[{report.classification}]</span>
                    <span style={{ fontSize: 7, color: '#6e7681', marginLeft: 'auto' }}>{report.timestamp}</span>
                    {report.sourceUrl && (
                      <a href={report.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 7, color: '#58a6ff', textDecoration: 'none' }}>{'\u2197'} source</a>
                    )}
                  </div>
                  <div style={{ fontSize: 9, color: '#c9d1d9', lineHeight: 1.5 }}>{report.text}</div>
                  {report.imageUrl && (
                    <div style={{ marginTop: 4 }}>
                      <img
                        src={report.imageUrl}
                        alt={report.imageCaption || 'Intel'}
                        style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 3, border: '1px solid #30363d', filter: 'brightness(0.85) contrast(1.1)' }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                      {report.imageCaption && (
                        <div style={{ fontSize: 7, color: '#6e7681', marginTop: 2, fontStyle: 'italic' }}>{report.imageCaption}</div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --------------- POI CREATION MENU ---------------

function POICreationMenu({ coords, onConfirm, onCancel }: {
  coords: [number, number];
  onConfirm: (poi: Omit<CustomPOI, 'id' | 'timestamp'>) => void;
  onCancel: () => void;
}) {
  const [selectedType, setSelectedType] = useState<InfraType>('military');
  const [selectedStatus, setSelectedStatus] = useState<InfraStatus>('active');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  return (
    <div style={{ minWidth: 280, padding: 10, fontFamily: "'JetBrains Mono', monospace", background: '#0d1117', color: '#e6edf3', borderRadius: 6 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#a855f7', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 14 }}>{'\u2316'}</span> NEW POINT OF INTEREST
      </div>

      <div style={{ fontSize: 9, color: '#6e7681', marginBottom: 8, padding: '3px 6px', background: '#161b22', borderRadius: 3 }}>
        {coords[0].toFixed(4)}&deg;N {coords[1].toFixed(4)}&deg;E
      </div>

      {/* Name input */}
      <div style={{ marginBottom: 6 }}>
        <div style={{ fontSize: 9, color: '#8b949e', marginBottom: 2, textTransform: 'uppercase' }}>Designation</div>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Target name..."
          style={{
            width: '100%', padding: '4px 6px', fontSize: 11, fontFamily: "'JetBrains Mono', monospace",
            background: '#161b22', border: '1px solid #30363d', borderRadius: 3, color: '#e6edf3',
            outline: 'none', boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Type selector */}
      <div style={{ marginBottom: 6 }}>
        <div style={{ fontSize: 9, color: '#8b949e', marginBottom: 3, textTransform: 'uppercase' }}>Type</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3 }}>
          {INFRA_TYPE_OPTIONS.map(opt => (
            <button
              key={opt.type}
              onClick={() => setSelectedType(opt.type)}
              style={{
                padding: '3px 4px', fontSize: 8, fontWeight: 600,
                fontFamily: "'JetBrains Mono', monospace", cursor: 'pointer',
                background: selectedType === opt.type ? `${opt.color}20` : '#161b22',
                border: `1px solid ${selectedType === opt.type ? `${opt.color}60` : '#30363d'}`,
                color: selectedType === opt.type ? opt.color : '#6e7681',
                borderRadius: 3, textTransform: 'uppercase',
                display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: opt.color, flexShrink: 0 }} />
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Status selector */}
      <div style={{ marginBottom: 6 }}>
        <div style={{ fontSize: 9, color: '#8b949e', marginBottom: 3, textTransform: 'uppercase' }}>Status</div>
        <div style={{ display: 'flex', gap: 3 }}>
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.status}
              onClick={() => setSelectedStatus(opt.status)}
              style={{
                flex: 1, padding: '3px 4px', fontSize: 8, fontWeight: 600,
                fontFamily: "'JetBrains Mono', monospace", cursor: 'pointer',
                background: selectedStatus === opt.status ? `${opt.color}20` : '#161b22',
                border: `1px solid ${selectedStatus === opt.status ? `${opt.color}60` : '#30363d'}`,
                color: selectedStatus === opt.status ? opt.color : '#6e7681',
                borderRadius: 3, textTransform: 'uppercase',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 9, color: '#8b949e', marginBottom: 2, textTransform: 'uppercase' }}>Intel Note</div>
        <input
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Description..."
          style={{
            width: '100%', padding: '4px 6px', fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
            background: '#161b22', border: '1px solid #30363d', borderRadius: 3, color: '#e6edf3',
            outline: 'none', boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 6 }}>
        <button
          onClick={() => {
            if (!name.trim()) return;
            onConfirm({ name: name.trim(), type: selectedType, status: selectedStatus, coords, description: description.trim() || `Custom ${selectedType} POI` });
          }}
          style={{
            flex: 1, padding: '5px 8px', fontSize: 10, fontWeight: 600,
            fontFamily: "'JetBrains Mono', monospace", cursor: name.trim() ? 'pointer' : 'not-allowed',
            background: name.trim() ? '#22c55e20' : '#161b22',
            border: `1px solid ${name.trim() ? '#22c55e50' : '#30363d'}`,
            color: name.trim() ? '#22c55e' : '#6e7681',
            borderRadius: 4, textTransform: 'uppercase', letterSpacing: 0.5,
            opacity: name.trim() ? 1 : 0.5,
          }}
        >
          {'\u2713'} CONFIRM
        </button>
        <button
          onClick={onCancel}
          style={{
            padding: '5px 12px', fontSize: 10, fontWeight: 600,
            fontFamily: "'JetBrains Mono', monospace", cursor: 'pointer',
            background: '#161b22', border: '1px solid #30363d',
            color: '#6e7681', borderRadius: 4, textTransform: 'uppercase',
          }}
        >
          {'\u2717'}
        </button>
      </div>
    </div>
  );
}

// --------------- MAIN MAP ---------------

// Match event target names to infrastructure point names/ids
function matchEventToInfra(target: string): string[] {
  const lower = target.toLowerCase();
  return infrastructure
    .filter(inf => {
      const name = inf.name.toLowerCase();
      const nameEn = inf.nameEn.toLowerCase();
      return lower.includes(name) || lower.includes(nameEn)
        || name.includes(lower) || nameEn.includes(lower);
    })
    .map(inf => inf.id);
}

// Glow state: which infra points are glowing and when to stop
interface GlowState {
  infraId: string;
  color: string;       // glow color based on event type
  intensity: number;    // 0-1 pulsing
  expiresAt: number;
}

export function MapView() {
  const [selectedInf, setSelectedInf] = useState<string | null>(null);
  const [selectedPos, setSelectedPos] = useState<string | null>(null);
  const [customPOIs, setCustomPOIs] = useState<CustomPOI[]>([]);
  const [selectedCustom, setSelectedCustom] = useState<string | null>(null);
  const [newPOICoords, setNewPOICoords] = useState<[number, number] | null>(null);
  const [opStatuses, setOpStatuses] = useState<OpStatus[]>([]);
  const [glowStates, setGlowStates] = useState<GlowState[]>([]);
  const [selectedShelter, setSelectedShelter] = useState<string | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const events = useEventFeed(50);
  const prevEventCountRef = useRef(0);

  // Event glow colors by attack type
  const EVENT_GLOW_COLORS: Record<string, string> = {
    ballistic: '#ef4444',  // red
    drone: '#06b6d4',      // cyan
    cyber: '#a855f7',      // purple
    artillery: '#eab308',  // yellow
    cruise: '#f97316',     // orange
    sabotage: '#ec4899',   // pink
  };

  // Watch for new events and trigger glow on matching infra points
  useEffect(() => {
    if (events.length <= prevEventCountRef.current) {
      prevEventCountRef.current = events.length;
      return;
    }

    // New events = difference from previous count
    const newCount = events.length - prevEventCountRef.current;
    const newEvents = events.slice(0, Math.min(newCount, 5)); // max 5 new at a time
    prevEventCountRef.current = events.length;

    const newGlows: GlowState[] = [];

    for (const evt of newEvents) {
      // Try to match by target name
      let matchedIds = matchEventToInfra(evt.target);

      // Also try matching by details text
      if (matchedIds.length === 0) {
        matchedIds = matchEventToInfra(evt.details);
      }

      // If no specific match, pick random infra points to glow (simulates general theater activity)
      if (matchedIds.length === 0) {
        const random = infrastructure[Math.floor(Math.random() * infrastructure.length)];
        matchedIds = [random.id];
      }

      for (const id of matchedIds) {
        newGlows.push({
          infraId: id,
          color: EVENT_GLOW_COLORS[evt.type] || '#ef4444',
          intensity: 1,
          expiresAt: Date.now() + 8000, // glow for 8 seconds
        });
      }
    }

    if (newGlows.length > 0) {
      setGlowStates(prev => [...newGlows, ...prev].slice(0, 30));
    }
  }, [events]);

  // Animate glow pulse and clean up expired glows
  useEffect(() => {
    const interval = setInterval(() => {
      setGlowStates(prev => {
        const now = Date.now();
        return prev
          .filter(g => now < g.expiresAt)
          .map(g => {
            const remaining = (g.expiresAt - now) / 8000;
            // Pulsing: sin wave that fades out
            const pulse = Math.sin(now / 300) * 0.3 + 0.7;
            return { ...g, intensity: remaining * pulse };
          });
      });
    }, 150); // update ~6.7 times/sec for smooth animation
    return () => clearInterval(interval);
  }, []);

  // Listen for shelter navigation events from Header dropdown
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && mapRef.current) {
        mapRef.current.panTo({ lat: detail.lat, lng: detail.lng });
        mapRef.current.setZoom(14);
        setSelectedShelter(detail.id);
        setSelectedInf(null);
        setSelectedPos(null);
        setSelectedCustom(null);
        setNewPOICoords(null);
      }
    };
    window.addEventListener('navigate-to-shelter', handler);
    return () => window.removeEventListener('navigate-to-shelter', handler);
  }, []);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);
  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  // Right-click to place POI
  const handleRightClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setSelectedInf(null);
      setSelectedPos(null);
      setSelectedCustom(null);
      setNewPOICoords([e.latLng.lat(), e.latLng.lng()]);
    }
  }, []);

  // Confirm new POI
  const handleConfirmPOI = useCallback((poi: Omit<CustomPOI, 'id' | 'timestamp'>) => {
    const newPOI: CustomPOI = {
      ...poi,
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
    };
    setCustomPOIs(prev => [...prev, newPOI]);
    setNewPOICoords(null);
  }, []);

  // Delete custom POI
  const handleDeletePOI = useCallback((id: string) => {
    setCustomPOIs(prev => prev.filter(p => p.id !== id));
    setSelectedCustom(null);
  }, []);

  // Launch cyber op
  const handleLaunchOp = useCallback((opId: string, targetId: string) => {
    const newOp: OpStatus = { opId, targetId, status: 'running', startTime: Date.now() };
    setOpStatuses(prev => [...prev, newOp]);

    // Simulate op completion (5-15 seconds)
    const duration = 5000 + Math.random() * 10000;
    setTimeout(() => {
      setOpStatuses(prev =>
        prev.map(op =>
          op === newOp
            ? { ...op, status: Math.random() > 0.15 ? 'success' : 'failed' }
            : op
        )
      );
      // Auto-remove after 30 seconds
      setTimeout(() => {
        setOpStatuses(prev => prev.filter(op => op !== newOp));
      }, 30000);
    }, duration);
  }, []);

  // Clear selections on map click
  const handleMapClick = useCallback(() => {
    setSelectedInf(null);
    setSelectedPos(null);
    setSelectedCustom(null);
    setSelectedShelter(null);
    setNewPOICoords(null);
  }, []);

  if (loadError) {
    return (
      <div className="relative w-full h-full rounded-lg overflow-hidden border border-red-500/50 bg-[var(--palantir-surface)] flex items-center justify-center">
        <div className="text-center p-6">
          <p className="text-red-400 font-mono text-sm">MAP LOAD FAILURE</p>
          <p className="text-xs text-[var(--palantir-text-muted)] mt-2">VITE_GOOGLE_MAPS_API_KEY required</p>
        </div>
      </div>
    );
  }

  if (!isLoaded || !apiKey) {
    return (
      <div className="relative w-full h-full rounded-lg overflow-hidden border border-[var(--palantir-border)] bg-[var(--palantir-surface)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-amber-400 font-mono text-sm">INITIALIZING BRE4CH MAP...</div>
          {!apiKey && (
            <p className="text-xs text-[var(--palantir-text-muted)] mt-2">Add VITE_GOOGLE_MAPS_API_KEY to .env</p>
          )}
        </div>
      </div>
    );
  }

  const allInfra = [...infrastructure, ...customPOIs.map(p => ({
    ...p,
    nameEn: p.name,
    priority: 2 as const,
    defenseLevel: 50,
  }))];

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border border-[var(--palantir-border)]">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={6}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={mapOptions}
        onRightClick={handleRightClick}
        onClick={handleMapClick}
      >
        {/* Infrastructure threat zones (outer glow) */}
        {infrastructure.filter(i => i.priority === 1).map((inf) => (
          <Circle
            key={`zone-${inf.id}`}
            center={{ lat: inf.coords[0], lng: inf.coords[1] }}
            radius={45000}
            options={{
              fillColor: STATUS_COLORS[inf.status],
              fillOpacity: 0.05,
              strokeColor: STATUS_COLORS[inf.status],
              strokeWeight: 0.5,
              strokeOpacity: 0.3,
              clickable: false,
            }}
          />
        ))}

        {/* Infrastructure markers */}
        {infrastructure.map((inf) => (
          <Circle
            key={inf.id}
            center={{ lat: inf.coords[0], lng: inf.coords[1] }}
            radius={inf.priority === 1 ? 22000 : inf.priority === 2 ? 16000 : 12000}
            options={{
              fillColor: STATUS_COLORS[inf.status],
              fillOpacity: inf.status === 'active' ? 0.6 : inf.status === 'damaged' ? 0.5 : 0.3,
              strokeColor: INFRA_COLORS[inf.type],
              strokeWeight: inf.priority === 1 ? 3 : 2,
              strokeOpacity: 0.9,
              clickable: true,
              zIndex: 10 + (4 - inf.priority),
            }}
            onClick={() => {
              setSelectedPos(null);
              setSelectedCustom(null);
              setNewPOICoords(null);
              setSelectedInf(selectedInf === inf.id ? null : inf.id);
            }}
          />
        ))}

        {/* Event glow rings — pulse when strikes/events happen */}
        {glowStates.map((glow, idx) => {
          const inf = infrastructure.find(i => i.id === glow.infraId);
          if (!inf) return null;
          return (
            <Circle
              key={`glow-${idx}-${glow.infraId}`}
              center={{ lat: inf.coords[0], lng: inf.coords[1] }}
              radius={35000 + glow.intensity * 20000}
              options={{
                fillColor: glow.color,
                fillOpacity: glow.intensity * 0.25,
                strokeColor: glow.color,
                strokeWeight: 2 + glow.intensity * 2,
                strokeOpacity: glow.intensity * 0.8,
                clickable: false,
                zIndex: 5,
              }}
            />
          );
        })}

        {/* Custom POI markers */}
        {customPOIs.map((poi) => (
          <Circle
            key={poi.id}
            center={{ lat: poi.coords[0], lng: poi.coords[1] }}
            radius={14000}
            options={{
              fillColor: STATUS_COLORS[poi.status],
              fillOpacity: 0.55,
              strokeColor: INFRA_COLORS[poi.type],
              strokeWeight: 2.5,
              strokeOpacity: 0.9,
              strokeDashArray: '8 4',
              clickable: true,
              zIndex: 15,
            } as google.maps.CircleOptions}
            onClick={() => {
              setSelectedInf(null);
              setSelectedPos(null);
              setNewPOICoords(null);
              setSelectedCustom(selectedCustom === poi.id ? null : poi.id);
            }}
          />
        ))}

        {/* Custom POI outer ring (dashed indicator) */}
        {customPOIs.map((poi) => (
          <Circle
            key={`ring-${poi.id}`}
            center={{ lat: poi.coords[0], lng: poi.coords[1] }}
            radius={20000}
            options={{
              fillColor: 'transparent',
              fillOpacity: 0,
              strokeColor: '#a855f7',
              strokeWeight: 1,
              strokeOpacity: 0.4,
              clickable: false,
              zIndex: 5,
            }}
          />
        ))}

        {/* Military positions */}
        {epicFuryPositions.map((pos) => {
          const isAllied = pos.type === 'allied';
          const color = isAllied ? '#22c55e' : '#ef4444';
          return (
            <Circle
              key={pos.id}
              center={{ lat: pos.coords[0], lng: pos.coords[1] }}
              radius={isAllied ? 18000 : 14000}
              options={{
                fillColor: color,
                fillOpacity: isAllied ? 0.45 : 0.5,
                strokeColor: color,
                strokeWeight: 2,
                strokeOpacity: 0.8,
                clickable: true,
                zIndex: 20,
              }}
              onClick={() => {
                setSelectedInf(null);
                setSelectedCustom(null);
                setNewPOICoords(null);
                setSelectedPos(selectedPos === pos.id ? null : pos.id);
              }}
            />
          );
        })}

        {/* Abu Dhabi Shelter markers */}
        {SHELTERS.map((shelter) => (
          <Circle
            key={`shelter-${shelter.id}`}
            center={{ lat: shelter.lat, lng: shelter.lng }}
            radius={600}
            options={{
              fillColor: shelter.status === 'OPEN' ? '#22c55e' : shelter.status === 'STANDBY' ? '#f59e0b' : '#ef4444',
              fillOpacity: 0.6,
              strokeColor: '#22c55e',
              strokeWeight: 2,
              strokeOpacity: 0.9,
              clickable: true,
              zIndex: 25,
            }}
            onClick={() => {
              setSelectedInf(null);
              setSelectedPos(null);
              setSelectedCustom(null);
              setNewPOICoords(null);
              setSelectedShelter(selectedShelter === shelter.id ? null : shelter.id);
            }}
          />
        ))}

        {/* Shelter outer glow ring */}
        {SHELTERS.filter(s => s.status === 'OPEN').map((shelter) => (
          <Circle
            key={`shelter-glow-${shelter.id}`}
            center={{ lat: shelter.lat, lng: shelter.lng }}
            radius={1000}
            options={{
              fillColor: '#22c55e',
              fillOpacity: 0.08,
              strokeColor: '#22c55e',
              strokeWeight: 1,
              strokeOpacity: 0.3,
              clickable: false,
              zIndex: 24,
            }}
          />
        ))}

        {/* Shelter InfoWindows */}
        {SHELTERS
          .filter((s) => selectedShelter === s.id)
          .map((shelter) => (
            <InfoWindow
              key={`shelter-info-${shelter.id}`}
              position={{ lat: shelter.lat, lng: shelter.lng }}
              onCloseClick={() => setSelectedShelter(null)}
              options={{ pixelOffset: new google.maps.Size(0, -5), maxWidth: 320 }}
            >
              <div style={{ minWidth: 250, padding: 6, fontFamily: "'JetBrains Mono', monospace", background: '#0d1117', color: '#e6edf3', borderRadius: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: shelter.status === 'OPEN' ? '#22c55e' : shelter.status === 'STANDBY' ? '#f59e0b' : '#ef4444', boxShadow: `0 0 8px ${shelter.status === 'OPEN' ? '#22c55e' : '#f59e0b'}` }} />
                  <span style={{ fontWeight: 700, color: '#22c55e', fontSize: 12 }}>SHELTER</span>
                  <span style={{ fontSize: 9, color: shelter.status === 'OPEN' ? '#22c55e' : '#f59e0b', background: shelter.status === 'OPEN' ? '#22c55e20' : '#f59e0b20', padding: '1px 6px', borderRadius: 3, fontWeight: 600, marginLeft: 'auto' }}>
                    {shelter.status}
                  </span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#e6edf3', marginBottom: 2 }}>{shelter.name}</div>
                <div style={{ fontSize: 10, color: '#8b949e', marginBottom: 6, direction: 'rtl' }}>{shelter.nameAr}</div>
                <div style={{ display: 'flex', gap: 12, marginBottom: 6 }}>
                  <div>
                    <div style={{ fontSize: 9, color: '#6e7681' }}>TYPE</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#22c55e' }}>{shelter.type}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: '#6e7681' }}>CAPACITY</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#06b6d4' }}>{shelter.capacity.toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: '#6e7681' }}>LEVELS</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b' }}>B{shelter.levels}</div>
                  </div>
                </div>
                <div style={{ fontSize: 9, color: '#8b949e', padding: '4px 6px', background: '#161b22', borderRadius: 3, lineHeight: 1.4 }}>
                  {shelter.notes}
                </div>
                <div style={{ fontSize: 8, color: '#6e7681', marginTop: 4 }}>
                  {shelter.district} // {shelter.lat.toFixed(4)}°N {shelter.lng.toFixed(4)}°E
                </div>
              </div>
            </InfoWindow>
          ))}

        {/* Infrastructure InfoWindows with Cyber Ops */}
        {infrastructure
          .filter((inf) => selectedInf === inf.id)
          .map((inf) => (
            <InfoWindow
              key={`info-${inf.id}`}
              position={{ lat: inf.coords[0], lng: inf.coords[1] }}
              onCloseClick={() => setSelectedInf(null)}
              options={{
                pixelOffset: new google.maps.Size(0, -5),
                maxWidth: 380,
              }}
            >
              <InfraInfoContent inf={inf} onLaunchOp={handleLaunchOp} opStatuses={opStatuses} />
            </InfoWindow>
          ))}

        {/* Custom POI InfoWindows with Cyber Ops */}
        {customPOIs
          .filter((poi) => selectedCustom === poi.id)
          .map((poi) => (
            <InfoWindow
              key={`info-${poi.id}`}
              position={{ lat: poi.coords[0], lng: poi.coords[1] }}
              onCloseClick={() => setSelectedCustom(null)}
              options={{
                pixelOffset: new google.maps.Size(0, -5),
                maxWidth: 380,
              }}
            >
              <div>
                <InfraInfoContent inf={poi} onLaunchOp={handleLaunchOp} opStatuses={opStatuses} />
                <button
                  onClick={() => handleDeletePOI(poi.id)}
                  style={{
                    width: '100%', marginTop: 6, padding: '4px 8px', fontSize: 9, fontWeight: 600,
                    fontFamily: "'JetBrains Mono', monospace", cursor: 'pointer',
                    background: '#ef444415', border: '1px solid #ef444440',
                    color: '#ef4444', borderRadius: 3, textTransform: 'uppercase',
                  }}
                >
                  {'\u2717'} DELETE POI
                </button>
              </div>
            </InfoWindow>
          ))}

        {/* New POI Creation Menu */}
        {newPOICoords && (
          <InfoWindow
            position={{ lat: newPOICoords[0], lng: newPOICoords[1] }}
            onCloseClick={() => setNewPOICoords(null)}
            options={{
              pixelOffset: new google.maps.Size(0, 0),
              maxWidth: 320,
            }}
          >
            <POICreationMenu
              coords={newPOICoords}
              onConfirm={handleConfirmPOI}
              onCancel={() => setNewPOICoords(null)}
            />
          </InfoWindow>
        )}

        {/* Force InfoWindows */}
        {epicFuryPositions
          .filter((pos) => selectedPos === pos.id)
          .map((pos) => (
            <InfoWindow
              key={`info-${pos.id}`}
              position={{ lat: pos.coords[0], lng: pos.coords[1] }}
              onCloseClick={() => setSelectedPos(null)}
              options={{
                pixelOffset: new google.maps.Size(0, -5),
                maxWidth: 280,
              }}
            >
              <ForceInfoContent pos={pos} />
            </InfoWindow>
          ))}
      </GoogleMap>

      {/* Map overlay info */}
      <div className="absolute bottom-3 left-3 px-3 py-2 rounded-lg bg-black/70 border border-[var(--palantir-border)] backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-[var(--palantir-text-muted)]">
            IRAN THEATRE // 32.43&deg;N 53.69&deg;E
          </span>
          <div className="w-px h-3 bg-[var(--palantir-border)]" />
          <span className="text-[10px] font-mono text-amber-400">
            {infrastructure.length + customPOIs.length} INFRA
          </span>
          <span className="text-[10px] font-mono text-green-400">
            {epicFuryPositions.filter(p => p.type === 'allied').length} ALLIED
          </span>
          <span className="text-[10px] font-mono text-red-400">
            {epicFuryPositions.filter(p => p.type === 'hostile').length} HOSTILE
          </span>
          <div className="w-px h-3 bg-[var(--palantir-border)]" />
          <span className="text-[10px] font-mono text-green-400">
            {SHELTERS.filter(s => s.status === 'OPEN').length} SHELTERS
          </span>
          {customPOIs.length > 0 && (
            <>
              <div className="w-px h-3 bg-[var(--palantir-border)]" />
              <span className="text-[10px] font-mono text-purple-400">
                {customPOIs.length} CUSTOM
              </span>
            </>
          )}
        </div>
      </div>

      {/* Stats overlay top-left */}
      <div className="absolute top-3 left-3 px-3 py-2 rounded-lg bg-black/70 border border-[var(--palantir-border)] backdrop-blur-sm">
        <div className="text-[10px] font-mono text-[var(--palantir-text-muted)] mb-1">ACTIVE TARGETS</div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-mono text-red-400">
              {allInfra.filter(i => i.status === 'active').length} Active
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-[10px] font-mono text-amber-400">
              {allInfra.filter(i => i.status === 'damaged').length} Damaged
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-[10px] font-mono text-green-400">
              {allInfra.filter(i => i.status === 'neutralized').length} Neutralized
            </span>
          </div>
        </div>
        {opStatuses.filter(o => o.status === 'running').length > 0 && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <span className="text-[10px] font-mono text-purple-400">
              {opStatuses.filter(o => o.status === 'running').length} CYBER OPS RUNNING
            </span>
          </div>
        )}
      </div>

      {/* Right-click hint */}
      <div className="absolute bottom-3 right-3 px-2 py-1 rounded bg-black/60 border border-[var(--palantir-border)]/50 backdrop-blur-sm">
        <span className="text-[9px] font-mono text-[var(--palantir-text-muted)]">RIGHT-CLICK TO PLACE POI</span>
      </div>
    </div>
  );
}
