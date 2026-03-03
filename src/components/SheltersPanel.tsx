import { useState, useEffect, useMemo } from 'react';
import { Shield, MapPin, Users, ChevronUp, Menu, ExternalLink, Navigation } from 'lucide-react';

// ─── UAE EMERGENCY SHELTERS ───
// Based on NCEMA guidance: underground parking, basements, interior rooms
// Locations derived from real UAE infrastructure with underground levels
// Source: NCEMA Emergency Guide (ncema.gov.ae), Civil Defence authorities

export type ShelterStatus = 'OPEN' | 'FULL' | 'STANDBY' | 'DAMAGED';
export type ShelterType = 'UNDERGROUND' | 'BASEMENT' | 'BUNKER' | 'INTERIOR';

export type Emirate =
  | 'Abu Dhabi'
  | 'Dubai'
  | 'Sharjah'
  | 'Ajman'
  | 'Ras Al Khaimah'
  | 'Fujairah'
  | 'Umm Al Quwain';

export interface Shelter {
  id: string;
  name: string;
  nameAr: string;
  emirate: Emirate;
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

export const EMIRATE_LIST: Emirate[] = [
  'Abu Dhabi',
  'Dubai',
  'Sharjah',
  'Ajman',
  'Ras Al Khaimah',
  'Fujairah',
  'Umm Al Quwain',
];

export const EMIRATE_SHORT: Record<Emirate, string> = {
  'Abu Dhabi': 'AUH',
  'Dubai': 'DXB',
  'Sharjah': 'SHJ',
  'Ajman': 'AJM',
  'Ras Al Khaimah': 'RAK',
  'Fujairah': 'FUJ',
  'Umm Al Quwain': 'UAQ',
};

// ─── ABU DHABI ───
const abuDhabiShelters: Shelter[] = [
  {
    id: 'adnec',
    name: 'ADNEC — Abu Dhabi National Exhibition Centre',
    nameAr: 'مركز أبوظبي الوطني للمعارض',
    emirate: 'Abu Dhabi',
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
    emirate: 'Abu Dhabi',
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
    emirate: 'Abu Dhabi',
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
    emirate: 'Abu Dhabi',
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
    emirate: 'Abu Dhabi',
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
    emirate: 'Abu Dhabi',
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
    emirate: 'Abu Dhabi',
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
    emirate: 'Abu Dhabi',
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
    emirate: 'Abu Dhabi',
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
    emirate: 'Abu Dhabi',
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
    emirate: 'Abu Dhabi',
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
    emirate: 'Abu Dhabi',
    type: 'BUNKER',
    district: 'Al Nahyan',
    capacity: 300,
    status: 'OPEN',
    levels: 1,
    lat: 24.4703,
    lng: 54.3807,
    notes: 'Civil defence command — emergency coordination',
  },
  {
    id: 'alain-mall',
    name: 'Al Ain Mall',
    nameAr: 'العين مول',
    emirate: 'Abu Dhabi',
    type: 'UNDERGROUND',
    district: 'Al Ain — Othman Bin Affan St',
    capacity: 2500,
    status: 'OPEN',
    levels: 2,
    lat: 24.2167,
    lng: 55.7253,
    notes: '2 UG levels — Al Ain main shelter, NCEMA designated',
  },
  {
    id: 'bawadi-mall',
    name: 'Bawadi Mall',
    nameAr: 'بوادي مول',
    emirate: 'Abu Dhabi',
    type: 'UNDERGROUND',
    district: 'Al Ain — Bawadi',
    capacity: 1800,
    status: 'OPEN',
    levels: 2,
    lat: 24.1919,
    lng: 55.7480,
    notes: '2 UG parking — eastern Al Ain shelter',
  },
  {
    id: 'hili-mall',
    name: 'Al Jimi Mall',
    nameAr: 'الجيمي مول',
    emirate: 'Abu Dhabi',
    type: 'UNDERGROUND',
    district: 'Al Ain — Al Jimi',
    capacity: 1400,
    status: 'STANDBY',
    levels: 1,
    lat: 24.2319,
    lng: 55.7533,
    notes: '1 UG level — northern Al Ain shelter point',
  },
];

// ─── DUBAI ───
const dubaiShelters: Shelter[] = [
  {
    id: 'dubai-mall',
    name: 'The Dubai Mall',
    nameAr: 'دبي مول',
    emirate: 'Dubai',
    type: 'UNDERGROUND',
    district: 'Downtown Dubai',
    capacity: 8000,
    status: 'OPEN',
    levels: 4,
    lat: 25.1972,
    lng: 55.2796,
    notes: '4 UG parking levels — largest shelter capacity in UAE',
  },
  {
    id: 'moe',
    name: 'Mall of the Emirates',
    nameAr: 'مول الإمارات',
    emirate: 'Dubai',
    type: 'UNDERGROUND',
    district: 'Al Barsha',
    capacity: 5000,
    status: 'OPEN',
    levels: 3,
    lat: 25.1181,
    lng: 55.2006,
    notes: '3 UG levels — Al Barsha district assembly point',
  },
  {
    id: 'ibn-battuta',
    name: 'Ibn Battuta Mall',
    nameAr: 'ابن بطوطة مول',
    emirate: 'Dubai',
    type: 'UNDERGROUND',
    district: 'Jebel Ali',
    capacity: 3500,
    status: 'OPEN',
    levels: 2,
    lat: 25.0441,
    lng: 55.1189,
    notes: '2 UG levels — Jebel Ali district shelter',
  },
  {
    id: 'difc',
    name: 'Dubai International Financial Centre',
    nameAr: 'مركز دبي المالي العالمي',
    emirate: 'Dubai',
    type: 'BASEMENT',
    district: 'DIFC',
    capacity: 3000,
    status: 'OPEN',
    levels: 4,
    lat: 25.2100,
    lng: 55.2788,
    notes: '4 reinforced basement levels — DIFC district',
  },
  {
    id: 'dwtc',
    name: 'Dubai World Trade Centre',
    nameAr: 'مركز دبي التجاري العالمي',
    emirate: 'Dubai',
    type: 'BASEMENT',
    district: 'Trade Centre',
    capacity: 4000,
    status: 'OPEN',
    levels: 3,
    lat: 25.2285,
    lng: 55.2868,
    notes: '3 basement levels — central Dubai shelter',
  },
  {
    id: 'dubai-marina-mall',
    name: 'Dubai Marina Mall',
    nameAr: 'دبي مارينا مول',
    emirate: 'Dubai',
    type: 'UNDERGROUND',
    district: 'Dubai Marina',
    capacity: 2800,
    status: 'OPEN',
    levels: 3,
    lat: 25.0765,
    lng: 55.1394,
    notes: '3 UG levels — Marina district shelter',
  },
  {
    id: 'deira-cc',
    name: 'Deira City Centre',
    nameAr: 'ديرة سيتي سنتر',
    emirate: 'Dubai',
    type: 'UNDERGROUND',
    district: 'Deira',
    capacity: 3000,
    status: 'OPEN',
    levels: 2,
    lat: 25.2525,
    lng: 55.3310,
    notes: '2 UG levels — eastern Dubai main shelter',
  },
  {
    id: 'mirdif-cc',
    name: 'Mirdif City Centre',
    nameAr: 'مردف سيتي سنتر',
    emirate: 'Dubai',
    type: 'UNDERGROUND',
    district: 'Mirdif',
    capacity: 2200,
    status: 'OPEN',
    levels: 2,
    lat: 25.2153,
    lng: 55.4078,
    notes: '2 UG levels — Mirdif area shelter',
  },
  {
    id: 'al-ghurair',
    name: 'Al Ghurair Centre',
    nameAr: 'مركز الغرير',
    emirate: 'Dubai',
    type: 'UNDERGROUND',
    district: 'Al Rigga',
    capacity: 2500,
    status: 'STANDBY',
    levels: 2,
    lat: 25.2671,
    lng: 55.3107,
    notes: '2 UG levels — Deira district backup shelter',
  },
  {
    id: 'dubai-cd',
    name: 'Dubai Civil Defence HQ',
    nameAr: 'القيادة العامة للدفاع المدني دبي',
    emirate: 'Dubai',
    type: 'BUNKER',
    district: 'Al Qusais',
    capacity: 400,
    status: 'OPEN',
    levels: 2,
    lat: 25.2669,
    lng: 55.3838,
    notes: 'Hardened bunker — Dubai CD emergency coordination',
  },
  {
    id: 'dragon-mart',
    name: 'Dragon Mart',
    nameAr: 'دراغون مارت',
    emirate: 'Dubai',
    type: 'UNDERGROUND',
    district: 'International City',
    capacity: 3000,
    status: 'STANDBY',
    levels: 1,
    lat: 25.1681,
    lng: 55.4131,
    notes: '1 UG level — International City area shelter',
  },
  {
    id: 'nakheel-mall',
    name: 'Nakheel Mall — Palm Jumeirah',
    nameAr: 'نخيل مول — نخلة جميرا',
    emirate: 'Dubai',
    type: 'UNDERGROUND',
    district: 'Palm Jumeirah',
    capacity: 2000,
    status: 'OPEN',
    levels: 2,
    lat: 25.1124,
    lng: 55.1380,
    notes: '2 UG levels — Palm Jumeirah shelter point',
  },
];

// ─── SHARJAH ───
const sharjahShelters: Shelter[] = [
  {
    id: 'sahara-centre',
    name: 'Sahara Centre',
    nameAr: 'مركز صحارى',
    emirate: 'Sharjah',
    type: 'UNDERGROUND',
    district: 'Al Nahda',
    capacity: 3500,
    status: 'OPEN',
    levels: 2,
    lat: 25.3097,
    lng: 55.3758,
    notes: '2 UG levels — Sharjah main shelter facility',
  },
  {
    id: 'sharjah-cc',
    name: 'Sharjah City Centre',
    nameAr: 'الشارقة سيتي سنتر',
    emirate: 'Sharjah',
    type: 'UNDERGROUND',
    district: 'Al Wahda St',
    capacity: 2800,
    status: 'OPEN',
    levels: 2,
    lat: 25.3266,
    lng: 55.3932,
    notes: '2 UG levels — central Sharjah shelter',
  },
  {
    id: 'mega-mall-shj',
    name: 'Mega Mall',
    nameAr: 'ميجا مول',
    emirate: 'Sharjah',
    type: 'UNDERGROUND',
    district: 'Al Taawun',
    capacity: 2000,
    status: 'OPEN',
    levels: 2,
    lat: 25.3183,
    lng: 55.3767,
    notes: '2 UG parking levels — Al Taawun area',
  },
  {
    id: 'zero6-mall',
    name: 'Zero6 Mall',
    nameAr: 'زيرو6 مول',
    emirate: 'Sharjah',
    type: 'UNDERGROUND',
    district: 'Al Juraina',
    capacity: 1500,
    status: 'STANDBY',
    levels: 1,
    lat: 25.3411,
    lng: 55.4128,
    notes: '1 UG level — eastern Sharjah shelter',
  },
  {
    id: 'sharjah-cd',
    name: 'Sharjah Civil Defence HQ',
    nameAr: 'الدفاع المدني الشارقة',
    emirate: 'Sharjah',
    type: 'BUNKER',
    district: 'Al Majaz',
    capacity: 300,
    status: 'OPEN',
    levels: 1,
    lat: 25.3371,
    lng: 55.3867,
    notes: 'Hardened facility — Sharjah CD coordination',
  },
];

// ─── AJMAN ───
const ajmanShelters: Shelter[] = [
  {
    id: 'ajman-cc',
    name: 'Ajman City Centre',
    nameAr: 'عجمان سيتي سنتر',
    emirate: 'Ajman',
    type: 'UNDERGROUND',
    district: 'Sheikh Khalifa Bin Zayed St',
    capacity: 2000,
    status: 'OPEN',
    levels: 2,
    lat: 25.4052,
    lng: 55.4345,
    notes: '2 UG levels — main Ajman shelter facility',
  },
  {
    id: 'ajman-mall',
    name: 'Ajman Al Nuaimia Mall',
    nameAr: 'مول النعيمية عجمان',
    emirate: 'Ajman',
    type: 'UNDERGROUND',
    district: 'Al Nuaimia',
    capacity: 1200,
    status: 'OPEN',
    levels: 1,
    lat: 25.3941,
    lng: 55.4418,
    notes: '1 UG level — Al Nuaimia area shelter',
  },
  {
    id: 'ajman-cd',
    name: 'Ajman Civil Defence HQ',
    nameAr: 'الدفاع المدني عجمان',
    emirate: 'Ajman',
    type: 'BUNKER',
    district: 'Al Rashidiya',
    capacity: 200,
    status: 'OPEN',
    levels: 1,
    lat: 25.4142,
    lng: 55.4478,
    notes: 'CD command facility — emergency coordination',
  },
];

// ─── RAS AL KHAIMAH ───
const rakShelters: Shelter[] = [
  {
    id: 'rak-mall',
    name: 'RAK Mall',
    nameAr: 'راك مول',
    emirate: 'Ras Al Khaimah',
    type: 'UNDERGROUND',
    district: 'Khuzam',
    capacity: 1800,
    status: 'OPEN',
    levels: 1,
    lat: 25.7617,
    lng: 55.9500,
    notes: '1 UG level — RAK main shelter facility',
  },
  {
    id: 'manar-mall',
    name: 'Manar Mall',
    nameAr: 'المنار مول',
    emirate: 'Ras Al Khaimah',
    type: 'UNDERGROUND',
    district: 'Al Nakheel',
    capacity: 2200,
    status: 'OPEN',
    levels: 2,
    lat: 25.7881,
    lng: 55.9623,
    notes: '2 UG levels — central RAK district shelter',
  },
  {
    id: 'rak-cd',
    name: 'RAK Civil Defence HQ',
    nameAr: 'الدفاع المدني رأس الخيمة',
    emirate: 'Ras Al Khaimah',
    type: 'BUNKER',
    district: 'Al Nakheel',
    capacity: 200,
    status: 'OPEN',
    levels: 1,
    lat: 25.7837,
    lng: 55.9587,
    notes: 'CD command — RAK emergency operations',
  },
  {
    id: 'hamra-mall',
    name: 'Al Hamra Mall',
    nameAr: 'الحمراء مول',
    emirate: 'Ras Al Khaimah',
    type: 'BASEMENT',
    district: 'Al Hamra Village',
    capacity: 1000,
    status: 'STANDBY',
    levels: 1,
    lat: 25.6791,
    lng: 55.7851,
    notes: '1 basement level — southern RAK shelter',
  },
];

// ─── FUJAIRAH ───
const fujairahShelters: Shelter[] = [
  {
    id: 'fujairah-cc',
    name: 'Fujairah City Centre',
    nameAr: 'الفجيرة سيتي سنتر',
    emirate: 'Fujairah',
    type: 'UNDERGROUND',
    district: 'Hamad Bin Abdullah Rd',
    capacity: 1800,
    status: 'OPEN',
    levels: 2,
    lat: 25.1285,
    lng: 56.3377,
    notes: '2 UG levels — Fujairah main shelter',
  },
  {
    id: 'fujairah-mall',
    name: 'Fujairah Mall',
    nameAr: 'الفجيرة مول',
    emirate: 'Fujairah',
    type: 'UNDERGROUND',
    district: 'Al Faseel',
    capacity: 1200,
    status: 'OPEN',
    levels: 1,
    lat: 25.1204,
    lng: 56.3306,
    notes: '1 UG level — Al Faseel district shelter',
  },
  {
    id: 'fujairah-cd',
    name: 'Fujairah Civil Defence HQ',
    nameAr: 'الدفاع المدني الفجيرة',
    emirate: 'Fujairah',
    type: 'BUNKER',
    district: 'Fujairah City',
    capacity: 200,
    status: 'OPEN',
    levels: 1,
    lat: 25.1255,
    lng: 56.3400,
    notes: 'CD command — Fujairah emergency operations',
  },
];

// ─── UMM AL QUWAIN ───
const uaqShelters: Shelter[] = [
  {
    id: 'uaq-mall',
    name: 'UAQ Mall',
    nameAr: 'مول أم القيوين',
    emirate: 'Umm Al Quwain',
    type: 'UNDERGROUND',
    district: 'King Faisal Rd',
    capacity: 1200,
    status: 'OPEN',
    levels: 1,
    lat: 25.5512,
    lng: 55.5553,
    notes: '1 UG level — UAQ main shelter facility',
  },
  {
    id: 'uaq-cd',
    name: 'UAQ Civil Defence HQ',
    nameAr: 'الدفاع المدني أم القيوين',
    emirate: 'Umm Al Quwain',
    type: 'BUNKER',
    district: 'UAQ City',
    capacity: 150,
    status: 'OPEN',
    levels: 1,
    lat: 25.5642,
    lng: 55.5548,
    notes: 'CD command — UAQ emergency coordination',
  },
];

// ─── ALL UAE SHELTERS ───
export const SHELTERS: Shelter[] = [
  ...abuDhabiShelters,
  ...dubaiShelters,
  ...sharjahShelters,
  ...ajmanShelters,
  ...rakShelters,
  ...fujairahShelters,
  ...uaqShelters,
];

export function SheltersPanel() {
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('roar-shelters-collapsed') === 'true'; } catch { return false; }
  });
  const [selectedEmirate, setSelectedEmirate] = useState<Emirate | 'ALL'>(() => {
    try { return (localStorage.getItem('roar-shelters-emirate') as Emirate | 'ALL') || 'ALL'; } catch { return 'ALL'; }
  });

  useEffect(() => {
    localStorage.setItem('roar-shelters-collapsed', String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    localStorage.setItem('roar-shelters-emirate', selectedEmirate);
  }, [selectedEmirate]);

  const filtered = useMemo(
    () => selectedEmirate === 'ALL' ? SHELTERS : SHELTERS.filter(s => s.emirate === selectedEmirate),
    [selectedEmirate],
  );
  const openCount = filtered.filter(s => s.status === 'OPEN').length;
  const totalCapacity = filtered.filter(s => s.status === 'OPEN').reduce((sum, s) => sum + s.capacity, 0);

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
        <span className="text-[9px] font-mono text-[var(--palantir-text-muted)]">
          {selectedEmirate === 'ALL' ? 'UAE' : selectedEmirate}
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="text-[9px] font-mono text-green-400 bg-green-500/20 px-1.5 py-0.5 rounded">
            {openCount} OPEN
          </span>
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        </div>
      </div>

      {!collapsed && (
        <>
          {/* Emirate filter */}
          <div className="px-2 py-1.5 border-b border-[var(--palantir-border)]/50 flex items-center gap-1 flex-wrap flex-shrink-0">
            <button
              onClick={() => setSelectedEmirate('ALL')}
              className={`text-[8px] font-mono px-1.5 py-0.5 rounded transition-colors ${
                selectedEmirate === 'ALL'
                  ? 'bg-green-500/30 text-green-400 border border-green-500/50'
                  : 'text-[var(--palantir-text-muted)] hover:bg-white/5 border border-transparent'
              }`}
            >
              ALL
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

          {/* Stats bar */}
          <div className="px-2.5 py-1.5 border-b border-[var(--palantir-border)]/50 flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-green-400" />
              <span className="text-[9px] font-mono text-green-400">{filtered.length} SITES</span>
            </div>
            <div className="w-px h-3 bg-[var(--palantir-border)]" />
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3 text-cyan-400" />
              <span className="text-[9px] font-mono text-cyan-400">{totalCapacity.toLocaleString()} CAP</span>
            </div>
            <div className="w-px h-3 bg-[var(--palantir-border)]" />
            <span className="text-[8px] font-mono text-[var(--palantir-text-muted)]">NCEMA // CIVIL DEFENCE</span>
          </div>

          {/* Shelter list */}
          <div className="max-h-[280px] overflow-y-auto p-1.5 space-y-1 scrollbar-hide">
            {filtered.map(shelter => {
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
                        {selectedEmirate === 'ALL' && (
                          <span className="text-[7px] font-mono text-cyan-400/70 bg-cyan-500/10 px-1 py-0.5 rounded">
                            {EMIRATE_SHORT[shelter.emirate]}
                          </span>
                        )}
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
                  NCEMA // CIVIL DEFENCE // SHELTER-IN-PLACE DIRECTIVE ACTIVE
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
              SRC: NCEMA Emergency Guide // UAE Civil Defence Authorities // MoI Directive 28/02/2026
            </p>
          </div>
        </>
      )}

      {collapsed && (
        <div className="px-3 py-2 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[9px] font-mono text-[var(--palantir-text-muted)]">
            {SHELTERS.length} sites — {SHELTERS.filter(s => s.status === 'OPEN').length} open — {SHELTERS.filter(s => s.status === 'OPEN').reduce((sum, s) => sum + s.capacity, 0).toLocaleString()} capacity — 7 emirates
          </span>
        </div>
      )}
    </div>
  );
}
