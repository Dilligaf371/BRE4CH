// ── Attack Flow Corridors ─────────────────────────────────────────
// Source → Target definitions for Norse-style animated attack arcs.

export type FlowCategory = 'conventional' | 'cyber';

export type AttackFlowType =
  | 'ballistic'
  | 'cruise'
  | 'drone'
  | 'artillery'
  | 'cyber'
  | 'sabotage';

export interface AttackCorridor {
  id: string;
  category: FlowCategory;
  type: AttackFlowType;
  label: string;
  source: { lat: number; lng: number; name: string };
  target: { lat: number; lng: number; name: string };
}

// Colour palette per attack type (Norse-inspired neon on dark)
export const FLOW_COLORS: Record<AttackFlowType, string> = {
  ballistic: '#ef4444', // red
  cruise:    '#f97316', // orange
  drone:     '#06b6d4', // cyan
  artillery: '#eab308', // yellow
  cyber:     '#a855f7', // purple
  sabotage:  '#ec4899', // pink
};

// ── Conventional corridors ───────────────────────────────────────
const conventional: AttackCorridor[] = [
  // Iran → Israel / GCC
  {
    id: 'ir-bm-il',
    category: 'conventional',
    type: 'ballistic',
    label: 'IRGC BM → Tel Aviv',
    source: { lat: 35.6762, lng: 51.4358, name: 'Tehran' },
    target: { lat: 32.0853, lng: 34.7818, name: 'Tel Aviv' },
  },
  {
    id: 'ir-bm-dimona',
    category: 'conventional',
    type: 'ballistic',
    label: 'IRGC BM → Dimona',
    source: { lat: 33.4839, lng: 48.3534, name: 'Khorramabad' },
    target: { lat: 31.0700, lng: 35.2100, name: 'Dimona' },
  },
  {
    id: 'ir-cruise-uae',
    category: 'conventional',
    type: 'cruise',
    label: 'IRGC Cruise → Al Dhafra',
    source: { lat: 27.1832, lng: 56.2764, name: 'Bandar Abbas' },
    target: { lat: 24.2500, lng: 54.5500, name: 'Al Dhafra AB' },
  },
  {
    id: 'ir-drone-kw',
    category: 'conventional',
    type: 'drone',
    label: 'IRGC UAS → Arifjan',
    source: { lat: 30.4400, lng: 48.3500, name: 'Abadan' },
    target: { lat: 29.0700, lng: 48.0800, name: 'Camp Arifjan' },
  },
  {
    id: 'ir-cruise-qa',
    category: 'conventional',
    type: 'cruise',
    label: 'IRGC Cruise → Al Udeid',
    source: { lat: 27.1832, lng: 56.2764, name: 'Bandar Abbas' },
    target: { lat: 25.1175, lng: 51.3150, name: 'Al Udeid AB' },
  },
  {
    id: 'ir-bm-bh',
    category: 'conventional',
    type: 'ballistic',
    label: 'IRGC BM → Bahrain NSA',
    source: { lat: 32.6546, lng: 51.6680, name: 'Isfahan' },
    target: { lat: 26.2361, lng: 50.6225, name: 'NSA Bahrain' },
  },
  // Houthis
  {
    id: 'hou-ascm-red',
    category: 'conventional',
    type: 'cruise',
    label: 'Houthi ASCM → Red Sea',
    source: { lat: 14.8000, lng: 42.9500, name: 'Al Hudaydah' },
    target: { lat: 13.5000, lng: 42.5000, name: 'Bab el-Mandeb' },
  },
  {
    id: 'hou-drone-ksa',
    category: 'conventional',
    type: 'drone',
    label: 'Houthi UAS → Aramco',
    source: { lat: 15.3694, lng: 44.1910, name: "Sana'a" },
    target: { lat: 25.3800, lng: 49.6900, name: 'Abqaiq' },
  },
  // Hezbollah
  {
    id: 'hzb-arty-haifa',
    category: 'conventional',
    type: 'artillery',
    label: 'Hezbollah Rockets → Haifa',
    source: { lat: 33.8547, lng: 35.8623, name: 'Baalbek' },
    target: { lat: 32.7940, lng: 34.9896, name: 'Haifa' },
  },
  {
    id: 'hzb-atgm-golan',
    category: 'conventional',
    type: 'artillery',
    label: 'Hezbollah ATGM → Golan',
    source: { lat: 33.2774, lng: 35.5000, name: 'S. Lebanon' },
    target: { lat: 33.0000, lng: 35.7500, name: 'Golan Heights' },
  },
  // PMF / Iraq
  {
    id: 'pmf-drone-erbil',
    category: 'conventional',
    type: 'drone',
    label: 'PMF UAS → Erbil',
    source: { lat: 33.3128, lng: 44.3615, name: 'Baghdad' },
    target: { lat: 36.1912, lng: 44.0094, name: 'Erbil AB' },
  },
  {
    id: 'pmf-arty-asad',
    category: 'conventional',
    type: 'artillery',
    label: 'PMF Rockets → Ain al-Asad',
    source: { lat: 33.4500, lng: 43.2700, name: 'W. Anbar' },
    target: { lat: 33.7860, lng: 42.4410, name: 'Ain al-Asad AB' },
  },
  // Coalition return fire
  {
    id: 'us-tlam-isfahan',
    category: 'conventional',
    type: 'cruise',
    label: 'USN TLAM → Isfahan',
    source: { lat: 26.0000, lng: 56.0000, name: 'USS Bataan CSG' },
    target: { lat: 32.6546, lng: 51.6680, name: 'Isfahan' },
  },
  {
    id: 'us-pgm-tehran',
    category: 'conventional',
    type: 'cruise',
    label: 'USAF PGM → Tehran AD',
    source: { lat: 32.0000, lng: 47.0000, name: 'Jordan / CAOC' },
    target: { lat: 35.6762, lng: 51.4358, name: 'Tehran' },
  },
  {
    id: 'il-sead-syria',
    category: 'conventional',
    type: 'sabotage',
    label: 'IAF SEAD → Damascus',
    source: { lat: 31.8000, lng: 34.6500, name: 'Nevatim AB' },
    target: { lat: 33.5138, lng: 36.2765, name: 'Damascus' },
  },
  {
    id: 'us-tlam-bandar',
    category: 'conventional',
    type: 'cruise',
    label: 'USN TLAM → Bandar Abbas',
    source: { lat: 25.0000, lng: 57.0000, name: 'USS Ford CSG' },
    target: { lat: 27.1832, lng: 56.2764, name: 'Bandar Abbas' },
  },
];

// ── Cyber corridors ──────────────────────────────────────────────
const cyber: AttackCorridor[] = [
  {
    id: 'cy-apt-centcom',
    category: 'cyber',
    type: 'cyber',
    label: 'APT33 → CENTCOM C2',
    source: { lat: 35.6762, lng: 51.4358, name: 'Tehran NOC' },
    target: { lat: 28.3400, lng: -80.6600, name: 'CENTCOM Tampa' },
  },
  {
    id: 'cy-apt-gcc-scada',
    category: 'cyber',
    type: 'cyber',
    label: 'APT34 → GCC SCADA',
    source: { lat: 35.6762, lng: 51.4358, name: 'Tehran NOC' },
    target: { lat: 25.2769, lng: 55.2963, name: 'Dubai SCADA' },
  },
  {
    id: 'cy-apt-iec',
    category: 'cyber',
    type: 'cyber',
    label: 'MuddyWater → IEC Grid',
    source: { lat: 32.6546, lng: 51.6680, name: 'Isfahan Cyber' },
    target: { lat: 32.0853, lng: 34.7818, name: 'IEC Tel Aviv' },
  },
  {
    id: 'cy-apt-aramco',
    category: 'cyber',
    type: 'cyber',
    label: 'APT33 → Aramco IT',
    source: { lat: 35.6762, lng: 51.4358, name: 'Tehran NOC' },
    target: { lat: 26.3927, lng: 49.9777, name: 'Aramco Dhahran' },
  },
  // Coalition cyber return
  {
    id: 'cy-cmd-natanz',
    category: 'cyber',
    type: 'cyber',
    label: 'CYBERCOM → Natanz SCADA',
    source: { lat: 39.1000, lng: -76.7300, name: 'Ft. Meade' },
    target: { lat: 33.7258, lng: 51.7277, name: 'Natanz' },
  },
  {
    id: 'cy-cmd-irgc-c2',
    category: 'cyber',
    type: 'cyber',
    label: 'CYBERCOM → IRGC C2',
    source: { lat: 39.1000, lng: -76.7300, name: 'Ft. Meade' },
    target: { lat: 35.6762, lng: 51.4358, name: 'Tehran C2' },
  },
  {
    id: 'cy-il-telecom',
    category: 'cyber',
    type: 'cyber',
    label: 'Unit 8200 → IR Telecom',
    source: { lat: 31.8900, lng: 34.8100, name: 'Be\'er Sheva' },
    target: { lat: 35.6762, lng: 51.4358, name: 'Tehran Telecom' },
  },
  {
    id: 'cy-uk-gchq',
    category: 'cyber',
    type: 'cyber',
    label: 'GCHQ → IRGC Navy C2',
    source: { lat: 51.8985, lng: -2.1228, name: 'Cheltenham' },
    target: { lat: 27.1832, lng: 56.2764, name: 'Bandar Abbas C2' },
  },
];

export const ATTACK_CORRIDORS: AttackCorridor[] = [...conventional, ...cyber];
