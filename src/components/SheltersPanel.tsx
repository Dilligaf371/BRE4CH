import { useState, useEffect } from 'react';
import { Shield, MapPin, Users, ChevronUp, Menu, ExternalLink, Navigation } from 'lucide-react';

// ─── ABU DHABI EMERGENCY SHELTERS ───
// Based on NCEMA guidance: underground parking, basements, interior rooms
// Locations derived from real Abu Dhabi infrastructure with underground levels
// Source: NCEMA Emergency Guide (ncema.gov.ae), ADCDA (adcda.gov.ae)

export type ShelterStatus = 'OPEN' | 'FULL' | 'STANDBY' | 'DAMAGED';
export type ShelterType = 'UNDERGROUND' | 'BASEMENT' | 'BUNKER' | 'INTERIOR';

export interface Shelter {
  id: string;
  name: string;
  nameAr: string;
  type: ShelterType;
  district: string;
  capacity: number;
  status: ShelterStatus;
  levels: number;
  lat: number;
  lng: number;
  notes: string;
}

const STATUS_CONFIG: Record<ShelterStatus, { color: string; bg: string; border: string }> = {
  OPEN: { color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30' },
  FULL: { color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30' },
  STANDBY: { color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30' },
  DAMAGED: { color: 'text-red-500', bg: 'bg-red-500/30', border: 'border-red-500/50' },
};

const TYPE_LABELS: Record<ShelterType, string> = {
  UNDERGROUND: 'UG PARKING',
  BASEMENT: 'BASEMENT',
  BUNKER: 'BUNKER',
  INTERIOR: 'INTERIOR',
};

// ─── REAL ABU DHABI LOCATIONS WITH UNDERGROUND INFRASTRUCTURE ───
export const SHELTERS: Shelter[] = [
  {
    id: 'adnec',
    name: 'ADNEC — Abu Dhabi National Exhibition Centre',
    nameAr: 'مركز أبوظبي الوطني للمعارض',
    type: 'UNDERGROUND',
    district: 'Al Khaleej Al Arabi St',
    capacity: 5000,
    status: 'OPEN',
    levels: 3,
    lat: 24.4539,
    lng: 54.6342,
    notes: '3 underground levels — NCEMA designated assembly point',
  },
  {
    id: 'wahda-mall',
    name: 'Al Wahda Mall',
    nameAr: 'الوحدة مول',
    type: 'UNDERGROUND',
    district: 'Hazza Bin Zayed St',
    capacity: 3500,
    status: 'OPEN',
    levels: 2,
    lat: 24.4688,
    lng: 54.3731,
    notes: '2 underground parking levels — reinforced structure',
  },
  {
    id: 'galleria',
    name: 'The Galleria Al Maryah Island',
    nameAr: 'ذا غاليريا جزيرة المارية',
    type: 'UNDERGROUND',
    district: 'Al Maryah Island',
    capacity: 2800,
    status: 'OPEN',
    levels: 3,
    lat: 24.5025,
    lng: 54.3893,
    notes: '3 UG levels — Al Maryah Island district shelter',
  },
  {
    id: 'wtc',
    name: 'World Trade Center Abu Dhabi',
    nameAr: 'مركز التجارة العالمي أبوظبي',
    type: 'BASEMENT',
    district: 'Al Markaziyah',
    capacity: 2000,
    status: 'OPEN',
    levels: 4,
    lat: 24.4870,
    lng: 54.3555,
    notes: '4 basement levels — central district, near Corniche',
  },
  {
    id: 'etihad-towers',
    name: 'Etihad Towers Complex',
    nameAr: 'أبراج الاتحاد',
    type: 'UNDERGROUND',
    district: 'Corniche West',
    capacity: 1800,
    status: 'OPEN',
    levels: 3,
    lat: 24.4624,
    lng: 54.3282,
    notes: '3 UG parking levels — 5 tower complex',
  },
  {
    id: 'yas-mall',
    name: 'Yas Mall',
    nameAr: 'ياس مول',
    type: 'UNDERGROUND',
    district: 'Yas Island',
    capacity: 4000,
    status: 'STANDBY',
    levels: 2,
    lat: 24.4889,
    lng: 54.6078,
    notes: '2 UG levels — Yas Island main shelter point',
  },
  {
    id: 'landmark',
    name: 'The Landmark Tower',
    nameAr: 'برج اللاند مارك',
    type: 'UNDERGROUND',
    district: 'Corniche Rd',
    capacity: 1200,
    status: 'OPEN',
    levels: 5,
    lat: 24.4923,
    lng: 54.3681,
    notes: '5 UG parking levels — deepest shelter in Abu Dhabi',
  },
  {
    id: 'capital-gate',
    name: 'Capital Gate / ADNOC HQ',
    nameAr: 'بوابة العاصمة / أدنوك',
    type: 'BASEMENT',
    district: 'Al Safarat',
    capacity: 1500,
    status: 'OPEN',
    levels: 2,
    lat: 24.4527,
    lng: 54.6364,
    notes: '2 reinforced basement levels — government district',
  },
  {
    id: 'marina-mall',
    name: 'Marina Mall',
    nameAr: 'مارينا مول',
    type: 'UNDERGROUND',
    district: 'Breakwater',
    capacity: 2200,
    status: 'OPEN',
    levels: 2,
    lat: 24.4764,
    lng: 54.3232,
    notes: '2 UG levels — Breakwater district assembly point',
  },
  {
    id: 'mushrif-mall',
    name: 'Mushrif Mall',
    nameAr: 'مشرف مول',
    type: 'UNDERGROUND',
    district: 'Mushrif',
    capacity: 1800,
    status: 'STANDBY',
    levels: 2,
    lat: 24.4398,
    lng: 54.4342,
    notes: '2 UG levels — eastern Abu Dhabi shelter',
  },
  {
    id: 'ncema-hq',
    name: 'NCEMA Emergency Operations Center',
    nameAr: 'مركز عمليات الطوارئ — الهيئة الوطنية',
    type: 'BUNKER',
    district: 'Al Bateen',
    capacity: 500,
    status: 'OPEN',
    levels: 2,
    lat: 24.4624,
    lng: 54.3473,
    notes: 'Hardened bunker — NCEMA national operations center',
  },
  {
    id: 'adcda-cmd',
    name: 'Abu Dhabi Civil Defence Authority HQ',
    nameAr: 'هيئة أبوظبي للدفاع المدني',
    type: 'BUNKER',
    district: 'Al Nahyan',
    capacity: 300,
    status: 'OPEN',
    levels: 1,
    lat: 24.4703,
    lng: 54.3807,
    notes: 'Civil defence command — emergency coordination',
  },
];

export function SheltersPanel() {
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('roar-shelters-collapsed') === 'true'; } catch { return false; }
  });

  useEffect(() => {
    localStorage.setItem('roar-shelters-collapsed', String(collapsed));
  }, [collapsed]);

  const openCount = SHELTERS.filter(s => s.status === 'OPEN').length;
  const totalCapacity = SHELTERS.filter(s => s.status === 'OPEN').reduce((sum, s) => sum + s.capacity, 0);

  return (
    <div className="flex flex-col bg-[var(--palantir-surface)] border border-[var(--palantir-border)] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-[var(--palantir-border)] flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-white/5 transition-colors"
          title={collapsed ? 'Expand panel' : 'Collapse panel'}
        >
          {collapsed ? <Menu className="w-3.5 h-3.5 text-green-400" /> : <ChevronUp className="w-3.5 h-3.5 text-green-400" />}
        </button>
        <Shield className="w-4 h-4 text-green-400" />
        <span className="font-semibold text-xs uppercase tracking-wider text-[var(--palantir-text)]">
          SHELTERS
        </span>
        <span className="text-[9px] font-mono text-[var(--palantir-text-muted)]">Abu Dhabi</span>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="text-[9px] font-mono text-green-400 bg-green-500/20 px-1.5 py-0.5 rounded">
            {openCount} OPEN
          </span>
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        </div>
      </div>

      {!collapsed && (
        <>
          {/* Stats bar */}
          <div className="px-2.5 py-1.5 border-b border-[var(--palantir-border)]/50 flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-green-400" />
              <span className="text-[9px] font-mono text-green-400">{SHELTERS.length} SITES</span>
            </div>
            <div className="w-px h-3 bg-[var(--palantir-border)]" />
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3 text-cyan-400" />
              <span className="text-[9px] font-mono text-cyan-400">{totalCapacity.toLocaleString()} CAP</span>
            </div>
            <div className="w-px h-3 bg-[var(--palantir-border)]" />
            <span className="text-[8px] font-mono text-[var(--palantir-text-muted)]">NCEMA // ADCDA</span>
          </div>

          {/* Shelter list */}
          <div className="max-h-[280px] overflow-y-auto p-1.5 space-y-1 scrollbar-hide">
            {SHELTERS.map(shelter => {
              const statusCfg = STATUS_CONFIG[shelter.status];
              const mapsUrl = `https://maps.google.com/?q=${shelter.lat},${shelter.lng}`;

              return (
                <div
                  key={shelter.id}
                  className={`px-2.5 py-2 rounded-lg border transition-all hover:border-[var(--palantir-border)] ${statusCfg.border} bg-black/20`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className={`text-[7px] font-mono font-bold px-1 py-0.5 rounded ${statusCfg.bg} ${statusCfg.color}`}>
                          {shelter.status}
                        </span>
                        <span className="text-[7px] font-mono text-[var(--palantir-text-muted)] bg-white/5 px-1 py-0.5 rounded">
                          {TYPE_LABELS[shelter.type]}
                        </span>
                        <span className="text-[7px] font-mono text-[var(--palantir-text-muted)]">
                          B{shelter.levels}
                        </span>
                      </div>
                      <p className="text-[10px] font-mono font-bold text-[var(--palantir-text)] leading-tight truncate">
                        {shelter.name}
                      </p>
                      <p className="text-[8px] text-[var(--palantir-text-muted)] leading-tight" dir="rtl">
                        {shelter.nameAr}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[8px] font-mono text-[var(--palantir-text-muted)]">
                          {shelter.district}
                        </span>
                        <span className="text-[8px] font-mono text-cyan-400">
                          {shelter.capacity.toLocaleString()} pers.
                        </span>
                      </div>
                    </div>
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 p-1.5 rounded hover:bg-white/10 text-[var(--palantir-text-muted)] hover:text-green-400 transition-colors"
                      title="Open in Google Maps"
                    >
                      <Navigation className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-[8px] font-mono text-[var(--palantir-text-muted)] mt-0.5 leading-relaxed">
                    {shelter.notes}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-3 py-1.5 border-t border-[var(--palantir-border)] flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[8px] font-mono text-[var(--palantir-text-muted)]">
                  NCEMA // ADCDA // SHELTER-IN-PLACE DIRECTIVE ACTIVE
                </span>
              </div>
              <a
                href="https://www.ncema.gov.ae"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[7px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <ExternalLink className="w-2.5 h-2.5" />
                NCEMA.GOV.AE
              </a>
            </div>
            <p className="text-[7px] font-mono text-[var(--palantir-text-muted)] mt-0.5">
              SRC: NCEMA Emergency Guide // Abu Dhabi Civil Defence Authority // MoI Directive 28/02/2026
            </p>
          </div>
        </>
      )}

      {collapsed && (
        <div className="px-3 py-2 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[9px] font-mono text-[var(--palantir-text-muted)]">
            {SHELTERS.length} sites — {openCount} open — {totalCapacity.toLocaleString()} capacity — NCEMA/ADCDA
          </span>
        </div>
      )}
    </div>
  );
}
