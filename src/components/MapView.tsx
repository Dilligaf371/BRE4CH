import { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, InfoWindow, Circle } from '@react-google-maps/api';
import { infrastructure, epicFuryPositions, INFRA_COLORS, STATUS_COLORS } from '../data/mockData';
import type { InfrastructurePoint, MilitaryPosition, InfraType, InfraStatus } from '../data/mockData';

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
  maxZoom: 12,
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

// --------------- INFO CONTENT COMPONENTS ---------------

function InfraInfoContent({ inf, onLaunchOp, opStatuses }: {
  inf: InfrastructurePoint | CustomPOI;
  onLaunchOp: (opId: string, targetId: string) => void;
  opStatuses: OpStatus[];
}) {
  const [showOps, setShowOps] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('access');
  const targetOps = opStatuses.filter(o => o.targetId === inf.id);
  const isCustom = 'timestamp' in inf;

  return (
    <div style={{ minWidth: 300, maxWidth: 360, padding: 8, fontFamily: "'JetBrains Mono', monospace", background: '#0d1117', color: '#e6edf3', borderRadius: 6 }}>
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

      <div style={{ fontSize: 10, color: INFRA_COLORS[inf.type], textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
        {inf.type}
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

      {/* Coords */}
      <div style={{ fontSize: 9, color: '#6e7681', marginBottom: 8, padding: '3px 6px', background: '#161b22', borderRadius: 3 }}>
        {inf.coords[0].toFixed(4)}&deg;N {inf.coords[1].toFixed(4)}&deg;E
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
  const isAllied = pos.type === 'allied';
  const color = isAllied ? '#22c55e' : '#ef4444';
  return (
    <div style={{ minWidth: 220, padding: 6, fontFamily: "'JetBrains Mono', monospace", background: '#0d1117', color: '#e6edf3', borderRadius: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}` }} />
        <span style={{ fontWeight: 700, color, fontSize: 13 }}>{pos.callsign}</span>
        <span style={{ fontSize: 9, color: '#6e7681', textTransform: 'uppercase', marginLeft: 'auto', background: '#161b22', padding: '1px 6px', borderRadius: 3 }}>
          {pos.branch}
        </span>
      </div>
      <div style={{ fontSize: 11, color: '#e6edf3', marginBottom: 4 }}>{pos.unit}</div>
      <div style={{ fontSize: 10, color: '#8b949e', marginBottom: 6, lineHeight: 1.4 }}>{pos.mission}</div>
      <div style={{ display: 'flex', gap: 12 }}>
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

export function MapView() {
  const [selectedInf, setSelectedInf] = useState<string | null>(null);
  const [selectedPos, setSelectedPos] = useState<string | null>(null);
  const [customPOIs, setCustomPOIs] = useState<CustomPOI[]>([]);
  const [selectedCustom, setSelectedCustom] = useState<string | null>(null);
  const [newPOICoords, setNewPOICoords] = useState<[number, number] | null>(null);
  const [opStatuses, setOpStatuses] = useState<OpStatus[]>([]);
  const mapRef = useRef<google.maps.Map | null>(null);

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
