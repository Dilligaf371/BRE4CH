// =============================================================================
// OPERATION ROAR OF THE LION - EPIC FURY
// Command & Control Data Layer
// Classification: TOP SECRET // RELIDO // NOFORN
// =============================================================================

// --------------- TYPE DEFINITIONS ---------------

export type InfraType = 'nuclear' | 'military' | 'oil' | 'airbase' | 'naval' | 'command' | 'missile' | 'radar' | 'chemical';
export type InfraStatus = 'active' | 'damaged' | 'neutralized' | 'unknown';
export type ForceType = 'allied' | 'hostile';
export type AttackType = 'ballistic' | 'drone' | 'cyber' | 'artillery' | 'cruise' | 'sabotage';
export type ThreatLevel = 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'GUARDED' | 'LOW';
export type MissionPhase = 'PHASE I - ISR' | 'PHASE II - SEAD' | 'PHASE III - STRIKE' | 'PHASE IV - EXPLOIT' | 'PHASE V - STABILIZE';

export interface InfrastructurePoint {
  id: string;
  name: string;
  nameEn: string;
  type: InfraType;
  coords: [number, number];
  status: InfraStatus;
  priority: 1 | 2 | 3;
  description: string;
  defenseLevel: number; // 0-100
}

export interface MilitaryPosition {
  id: string;
  callsign: string;
  type: ForceType;
  coords: [number, number];
  unit: string;
  branch: string;
  strength: number;
  readiness: number;
  lastUpdate: string;
  mission: string;
}

export interface AttackEvent {
  id: string;
  timestamp: number;
  type: AttackType;
  origin: string;
  target: string;
  status: 'intercepted' | 'impact' | 'ongoing' | 'neutralized';
  details: string;
}

export interface IntelReport {
  id: string;
  timestamp: number;
  classification: 'TS' | 'SECRET' | 'CONFIDENTIAL';
  source: string;
  content: string;
  priority: 'FLASH' | 'IMMEDIATE' | 'PRIORITY' | 'ROUTINE';
}

// --------------- CONSTANTS ---------------

export const IRAN_CENTER: [number, number] = [32.4279, 53.688];
export const IRAN_BOUNDS: [[number, number], [number, number]] = [[25.0, 44.0], [40.0, 63.5]];

// Operation Epic Fury / Roar of the Lion began Feb 28, 2026 ~02:00 UTC
// First wave of US-Israeli strikes on Iran
export const MISSION_START = new Date('2026-02-28T02:00:00Z').getTime();
export const CURRENT_PHASE: MissionPhase = 'PHASE III - STRIKE';
export const THREAT_LEVEL: ThreatLevel = 'CRITICAL';

export const INFRA_COLORS: Record<InfraType, string> = {
  nuclear: '#ef4444',
  military: '#f59e0b',
  oil: '#eab308',
  airbase: '#3b82f6',
  naval: '#06b6d4',
  command: '#8b5cf6',
  missile: '#f97316',
  radar: '#14b8a6',
  chemical: '#ec4899',
};

export const STATUS_COLORS: Record<InfraStatus, string> = {
  active: '#ef4444',
  damaged: '#f59e0b',
  neutralized: '#22c55e',
  unknown: '#6b7280',
};

// --------------- INFRASTRUCTURE DATA ---------------
// Iranian critical infrastructure targets

export const infrastructure: InfrastructurePoint[] = [
  // Nuclear facilities
  { id: 'inf-01', name: 'Natanz', nameEn: 'Natanz Enrichment', type: 'nuclear', coords: [33.7233, 51.7233], status: 'active', priority: 1, description: 'Main uranium enrichment center - IR-6/IR-8 centrifuges', defenseLevel: 95 },
  { id: 'inf-02', name: 'Fordow', nameEn: 'Fordow Underground', type: 'nuclear', coords: [34.7083, 51.5833], status: 'active', priority: 1, description: 'Underground enrichment facility - mountain bunker', defenseLevel: 98 },
  { id: 'inf-03', name: 'Bushehr', nameEn: 'Bushehr NPP', type: 'nuclear', coords: [28.8333, 50.8833], status: 'active', priority: 2, description: 'Nuclear power plant - VVER-1000 reactor', defenseLevel: 72 },
  { id: 'inf-04', name: 'Isfahan UCF', nameEn: 'Isfahan Nuclear Tech', type: 'nuclear', coords: [32.6546, 51.6680], status: 'damaged', priority: 2, description: 'Uranium conversion center UF6 - damaged', defenseLevel: 45 },
  { id: 'inf-05', name: 'Arak', nameEn: 'Arak Heavy Water', type: 'nuclear', coords: [34.0493, 49.2433], status: 'active', priority: 1, description: 'Heavy water reactor IR-40 - plutonium production', defenseLevel: 88 },

  // Command & Control
  { id: 'inf-06', name: 'Tehran HQ IRGC', nameEn: 'IRGC Supreme Command', type: 'command', coords: [35.6892, 51.3890], status: 'active', priority: 1, description: 'IRGC Supreme HQ - command center', defenseLevel: 99 },
  { id: 'inf-07', name: 'Parchin', nameEn: 'Parchin Military Complex', type: 'command', coords: [35.5175, 51.7711], status: 'active', priority: 1, description: 'Military complex - weapons R&D / nuclear testing', defenseLevel: 90 },

  // Airbases
  { id: 'inf-08', name: 'Shiraz AFB', nameEn: 'Shiraz Air Base', type: 'airbase', coords: [29.5392, 52.5898], status: 'active', priority: 2, description: 'Tactical air base - F-14 / Su-35', defenseLevel: 78 },
  { id: 'inf-09', name: 'Tabriz AFB', nameEn: 'Tabriz Air Base', type: 'airbase', coords: [38.0667, 46.2833], status: 'active', priority: 3, description: 'Northern air base - MiG-29 / Su-24', defenseLevel: 65 },
  { id: 'inf-10', name: 'Isfahan AFB', nameEn: 'Isfahan 8th TAB', type: 'airbase', coords: [32.7500, 51.8612], status: 'damaged', priority: 2, description: '8th tactical air base - damaged', defenseLevel: 30 },
  { id: 'inf-11', name: 'Mehrabad', nameEn: 'Mehrabad Air Base', type: 'airbase', coords: [35.6894, 51.3113], status: 'active', priority: 2, description: 'Tehran joint-use base - C-130 / Il-76 transport', defenseLevel: 85 },

  // Naval
  { id: 'inf-12', name: 'Bandar Abbas', nameEn: 'Bandar Abbas Naval', type: 'naval', coords: [27.1833, 56.2667], status: 'active', priority: 1, description: 'Main naval base - Strait of Hormuz - Kilo-class submarines', defenseLevel: 82 },
  { id: 'inf-13', name: 'Jask', nameEn: 'Jask Naval Forward', type: 'naval', coords: [25.6514, 57.7711], status: 'active', priority: 2, description: 'Forward naval base - IRGCN fast attack craft', defenseLevel: 60 },

  // Missile sites
  { id: 'inf-14', name: 'Khorramabad', nameEn: 'Khorramabad MRBM', type: 'missile', coords: [33.4878, 48.3558], status: 'active', priority: 1, description: 'Ballistic missile base - Shahab-3 / Emad', defenseLevel: 92 },
  { id: 'inf-15', name: 'Tabriz Missiles', nameEn: 'Tabriz Missile Base', type: 'missile', coords: [37.8500, 46.3500], status: 'active', priority: 2, description: 'Northwest missile launch base - Fateh-110', defenseLevel: 75 },
  { id: 'inf-16', name: 'Semnan', nameEn: 'Semnan Space/Missile', type: 'missile', coords: [35.5833, 53.4167], status: 'active', priority: 1, description: 'Imam Khomeini Space Center - ICBM / SLV dual-use', defenseLevel: 88 },

  // Oil / Energy
  { id: 'inf-17', name: 'Abadan', nameEn: 'Abadan Refinery', type: 'oil', coords: [30.3472, 48.2933], status: 'damaged', priority: 2, description: 'Oil refinery - 450,000 bpd - damaged', defenseLevel: 35 },
  { id: 'inf-18', name: 'Kharg Island', nameEn: 'Kharg Oil Terminal', type: 'oil', coords: [29.2333, 50.3167], status: 'active', priority: 1, description: 'Offshore oil terminal - 90% of Iran exports', defenseLevel: 70 },

  // Radar / Air Defense
  { id: 'inf-19', name: 'S-300 Tehran', nameEn: 'Tehran AD Network', type: 'radar', coords: [35.7500, 51.5000], status: 'active', priority: 1, description: 'S-300PMU2 battery - capital air defense', defenseLevel: 96 },
  { id: 'inf-20', name: 'Bavar-373', nameEn: 'Bavar-373 Isfahan', type: 'radar', coords: [32.8000, 51.9000], status: 'damaged', priority: 2, description: 'Indigenous Bavar-373 AA system - damaged', defenseLevel: 40 },

  // Military bases
  { id: 'inf-21', name: 'Qom IRGC', nameEn: 'Qom IRGC Base', type: 'military', coords: [34.6401, 50.8764], status: 'active', priority: 1, description: 'IRGC base - ground forces - T-72 armor', defenseLevel: 80 },
  { id: 'inf-22', name: 'Kerman', nameEn: 'Kerman Military', type: 'military', coords: [30.2839, 57.0834], status: 'active', priority: 3, description: 'Eastern military base - garrison + ammo depot', defenseLevel: 55 },
];

// --------------- EPIC FURY FORCE POSITIONS ---------------

export const epicFuryPositions: MilitaryPosition[] = [
  // =======================================================================
  // ALLIED FORCE POSITIONS - Based on publicly available data (OSINT)
  // Sources: USNI Fleet Tracker, CENTCOM, DoD press releases, Feb 2026
  // =======================================================================

  // --- US NAVY: CARRIER STRIKE GROUPS (5th Fleet AOR) ---
  { id: 'ef-01', callsign: 'LINCOLN-CSG3', type: 'allied', coords: [23.5, 59.0], unit: 'CVN-72 Abraham Lincoln CSG-3', branch: 'US Navy', strength: 100, readiness: 100, lastUpdate: 'LIVE', mission: 'Carrier Strike Group 3 - Arabian Sea - CVW-9 embarked (VFA-14 F/A-18E, VFA-41 F/A-18F, VFA-151 F/A-18E, VMFA-314 F-35C, VAQ-133 EA-18G, VAW-117 E-2D) - redirected from INDOPACOM Jan 2026' },
  { id: 'ef-02', callsign: 'FORD-CSG12', type: 'allied', coords: [34.5, 32.0], unit: 'CVN-78 Gerald R. Ford CSG-12', branch: 'US Navy', strength: 100, readiness: 100, lastUpdate: 'LIVE', mission: 'Carrier Strike Group 12 - Eastern Med / en route 5th Fleet AOR via Suez - ordered to join Lincoln' },

  // --- US NAVY: DESTROYERS & SURFACE COMBATANTS (5th Fleet) ---
  { id: 'ef-03', callsign: 'DESRON21-A', type: 'allied', coords: [23.8, 58.5], unit: 'DDG-121 USS Frank E. Petersen Jr.', branch: 'US Navy', strength: 95, readiness: 98, lastUpdate: 'LIVE', mission: 'DESRON 21 escort - Abraham Lincoln CSG - Arabian Sea patrol' },
  { id: 'ef-04', callsign: 'DESRON21-B', type: 'allied', coords: [26.2, 56.8], unit: 'DDG-112 USS Michael Murphy', branch: 'US Navy', strength: 95, readiness: 98, lastUpdate: 'LIVE', mission: 'DESRON 21 - Strait of Hormuz patrol / Persian Gulf' },
  { id: 'ef-05', callsign: 'DESRON21-C', type: 'allied', coords: [24.0, 58.0], unit: 'DDG-111 USS Spruance', branch: 'US Navy', strength: 95, readiness: 97, lastUpdate: 'LIVE', mission: 'DESRON 21 escort - CSG-3 screen - Arabian Sea' },
  { id: 'ef-06', callsign: 'GULF-DDG1', type: 'allied', coords: [26.5, 55.5], unit: 'DDG-57 USS Mitscher', branch: 'US Navy', strength: 92, readiness: 96, lastUpdate: 'LIVE', mission: 'Persian Gulf patrol - Strait of Hormuz maritime security' },
  { id: 'ef-07', callsign: 'NARABSEA-1', type: 'allied', coords: [24.5, 60.0], unit: 'DDG-74 USS McFaul', branch: 'US Navy', strength: 90, readiness: 95, lastUpdate: 'LIVE', mission: 'North Arabian Sea independent ops - BMD capable' },
  { id: 'ef-08', callsign: 'NARABSEA-2', type: 'allied', coords: [24.8, 61.5], unit: 'DDG-113 USS John Finn', branch: 'US Navy', strength: 92, readiness: 96, lastUpdate: 'LIVE', mission: 'North Arabian Sea - BMD / ISR screen' },
  { id: 'ef-09', callsign: 'NARABSEA-3', type: 'allied', coords: [24.2, 59.5], unit: 'DDG-119 USS Delbert D. Black', branch: 'US Navy', strength: 91, readiness: 95, lastUpdate: 'LIVE', mission: 'North Arabian Sea - anti-surface / BMD ops' },
  { id: 'ef-10', callsign: 'NARABSEA-4', type: 'allied', coords: [23.0, 60.5], unit: 'DDG-91 USS Pinckney', branch: 'US Navy', strength: 90, readiness: 94, lastUpdate: 'LIVE', mission: 'Arabian Sea patrol - ASW / surface warfare' },

  // --- US NAVY: LITTORAL COMBAT SHIPS (Bahrain-based MCM) ---
  { id: 'ef-11', callsign: 'MCM-LCS1', type: 'allied', coords: [26.2, 50.6], unit: 'LCS-30 USS Canberra', branch: 'US Navy', strength: 85, readiness: 90, lastUpdate: 'LIVE', mission: 'Mine countermeasures - Persian Gulf / Strait of Hormuz - homeport NSA Bahrain' },
  { id: 'ef-12', callsign: 'MCM-LCS2', type: 'allied', coords: [26.3, 50.5], unit: 'LCS-16 USS Tulsa', branch: 'US Navy', strength: 85, readiness: 90, lastUpdate: 'LIVE', mission: 'Mine countermeasures mission package - 5th Fleet Bahrain' },
  { id: 'ef-13', callsign: 'MCM-LCS3', type: 'allied', coords: [26.25, 50.55], unit: 'LCS-32 USS Santa Barbara', branch: 'US Navy', strength: 85, readiness: 88, lastUpdate: 'LIVE', mission: 'Mine countermeasures - first operational MCM deployment - 5th Fleet' },

  // --- US NAVY: 5TH FLEET HQ (NSA Bahrain) ---
  { id: 'ef-14', callsign: 'FIFTHFLT-HQ', type: 'allied', coords: [26.2330, 50.5860], unit: 'NAVCENT / 5th Fleet HQ', branch: 'US Navy', strength: 100, readiness: 100, lastUpdate: 'LIVE', mission: 'Naval Support Activity Bahrain - Juffair - NAVCENT/5th Fleet HQ - maritime C2 for Gulf, Red Sea, Arabian Sea - reduced to <100 mission-critical personnel Feb 26' },

  // --- US NAVY: SSGN SUBMARINE (estimated patrol area) ---
  { id: 'ef-15', callsign: 'HOTEL-SSGN', type: 'allied', coords: [23.0, 58.0], unit: 'SSGN-729 USS Georgia (est.)', branch: 'US Navy', strength: 100, readiness: 100, lastUpdate: 'LIVE', mission: 'Ohio-class SSGN - 154x Tomahawk TLAM capacity - participated in June 2025 strikes on Isfahan - Arabian Sea / Gulf of Oman patrol area (exact position classified)' },

  // --- USAF: AL UDEID AIR BASE, QATAR ---
  { id: 'ef-16', callsign: 'UDEID-MAIN', type: 'allied', coords: [25.1173, 51.3150], unit: '379th AEW / CENTCOM Fwd HQ', branch: 'USAF', strength: 100, readiness: 100, lastUpdate: 'LIVE', mission: 'Al Udeid Air Base - largest US base in Middle East - ~10,000 personnel - AFCENT HQ - CENTCOM forward HQ - KC-135 tankers, ISR, C2 platforms - 83 EAG RAF also stationed' },

  // --- USAF: AL DHAFRA AIR BASE, UAE ---
  { id: 'ef-17', callsign: 'DHAFRA-OPS', type: 'allied', coords: [24.2481, 54.5472], unit: 'USAF Al Dhafra Detachment', branch: 'USAF', strength: 92, readiness: 96, lastUpdate: 'LIVE', mission: 'Al Dhafra Air Base, Abu Dhabi - ~3,500 personnel - surveillance, refueling, F-35A, RQ-4 Global Hawk, U-2 Dragon Lady ISR - joint with UAE AF' },

  // --- USAF: PRINCE SULTAN AIR BASE, SAUDI ARABIA ---
  { id: 'ef-18', callsign: 'PSAB-AMD', type: 'allied', coords: [24.0627, 47.5805], unit: 'USAF Prince Sultan AB / Patriot-THAAD', branch: 'USAF', strength: 90, readiness: 95, lastUpdate: 'LIVE', mission: 'Prince Sultan Air Base - ~2,700 personnel - 16x KC-135 + 6x KC-46A tankers + 3x E-11A BACN + E-3 AWACS - Patriot PAC-3 & THAAD batteries - air/missile defense coordination' },

  // --- USAF: MUWAFFAQ SALTI AIR BASE, JORDAN ---
  { id: 'ef-19', callsign: 'MSAB-STRIKE', type: 'allied', coords: [31.8267, 36.7822], unit: '332nd AEW / 494th EFS', branch: 'USAF', strength: 100, readiness: 100, lastUpdate: 'LIVE', mission: 'Muwaffaq Salti AB, Azraq Jordan - 332nd AEW - 24x F-15E (48th FW/494th EFS RAF Lakenheath) + 30x F-35A + A-10s - THAAD - 60+ combat aircraft total - primary strike staging platform' },

  // --- USAF: F-22 RAPTOR DEPLOYMENT, OVDA AIRBASE ISRAEL ---
  { id: 'ef-20', callsign: 'RAPTOR-ISR', type: 'allied', coords: [29.9403, 34.9358], unit: 'F-22A Raptor Squadron (Ovda)', branch: 'USAF', strength: 100, readiness: 100, lastUpdate: 'LIVE', mission: 'Ovda Airbase, southern Israel (Negev) - 12x F-22A Raptors (up to 24 planned) - first-ever US offensive aircraft deployment in Israel - air dominance / SEAD/DEAD - deployed from RAF Lakenheath Feb 25' },

  // --- US ARMY: CAMP ARIFJAN, KUWAIT ---
  { id: 'ef-21', callsign: 'ARIFJAN-HQ', type: 'allied', coords: [28.9597, 48.0987], unit: 'ARCENT Fwd HQ / Camp Arifjan', branch: 'US Army', strength: 96, readiness: 97, lastUpdate: 'LIVE', mission: 'Camp Arifjan - Army Central fwd HQ - ~10,000 capacity - logistics hub / APS-5 prepositioned stocks - nerve center for all CENTCOM ground ops across 21 nations' },

  // --- USAF: ALI AL SALEM AIR BASE, KUWAIT ---
  { id: 'ef-22', callsign: 'ALSALEM-AIR', type: 'allied', coords: [29.3467, 47.5208], unit: '386th AEW / Ali Al Salem AB', branch: 'USAF', strength: 90, readiness: 95, lastUpdate: 'LIVE', mission: 'Ali Al Salem Air Base - 386th AEW - primary airlift hub/gateway for combat power delivery - MQ-9 Reaper drones - C-17 / C-130 airlift ops - part of ~13,500 US in Kuwait' },

  // --- US ARMY: CAMP BUEHRING, KUWAIT ---
  { id: 'ef-23', callsign: 'BUEHRING-STG', type: 'allied', coords: [29.7833, 47.6667], unit: 'Camp Buehring Staging Base', branch: 'US Army', strength: 85, readiness: 92, lastUpdate: 'LIVE', mission: 'Camp Buehring - troop staging / rotation base for deployments into Iraq & Syria - part of Kuwait 13,500 US personnel footprint' },

  // --- US FORCES: HARIR / ERBIL, IRAQ (Kurdistan) ---
  { id: 'ef-24', callsign: 'ERBIL-KRG', type: 'allied', coords: [36.6208, 43.9625], unit: 'US Forces Erbil / Harir AB', branch: 'US Army', strength: 75, readiness: 88, lastUpdate: 'LIVE', mission: 'Harir Air Base / Erbil - ~1,500 coalition troops relocated from federal Iraq - remaining until Sep 2026 per agreement - training / ISR / SOF coordination - attacked by Iran-backed drones Mar 1' },

  // --- USAF/US FORCES: INCIRLIK AIR BASE, TURKEY ---
  { id: 'ef-25', callsign: 'INCIRLIK-AB', type: 'allied', coords: [37.0021, 35.4259], unit: 'USAF 39th ABW / Incirlik AB', branch: 'USAF', strength: 85, readiness: 90, lastUpdate: 'LIVE', mission: 'Incirlik Air Base, Adana Turkey - 39th Air Base Wing - strategic depth from Iranian territory - Eastern Med access - ~5,000 personnel - B61 nuclear weapons storage (reported)' },

  // --- USAF: TANF GARRISON (DEPARTED) / SYRIA CONTEXT ---
  // Note: US departed al-Tanf garrison in early 2026 and overall Syria drawdown in progress

  // --- US MISSILE DEFENSE: THAAD/PATRIOT NETWORK ---
  { id: 'ef-26', callsign: 'AMD-QATAR', type: 'allied', coords: [25.2, 51.4], unit: 'AN/TPY-2 Radar / THAAD Qatar', branch: 'US Army', strength: 95, readiness: 98, lastUpdate: 'LIVE', mission: 'THAAD battery & AN/TPY-2 X-band radar at Al Udeid - layered BMD architecture - part of Gulf-wide integrated air/missile defense' },
  { id: 'ef-27', callsign: 'AMD-UAE', type: 'allied', coords: [24.3, 54.6], unit: 'THAAD / Patriot Al Dhafra UAE', branch: 'US Army', strength: 95, readiness: 98, lastUpdate: 'LIVE', mission: 'THAAD & Patriot batteries at Al Dhafra / UAE - hit-to-kill BMD - proven in Jan 2022 Houthi intercept & Feb 2026 Iranian strikes' },
  { id: 'ef-28', callsign: 'AMD-JORDAN', type: 'allied', coords: [31.9, 36.8], unit: 'THAAD Battery / Muwaffaq Salti', branch: 'US Army', strength: 95, readiness: 98, lastUpdate: 'LIVE', mission: 'THAAD anti-ballistic missile system deployed at MSAB Jordan - confirmed by satellite imagery - layered defense with Patriot PAC-3' },

  // --- JEBEL ALI PORT, DUBAI (USN port of call) ---
  { id: 'ef-29', callsign: 'JEBALI-PORT', type: 'allied', coords: [25.0042, 55.0580], unit: 'Jebel Ali Port Facility', branch: 'US Navy', strength: 70, readiness: 85, lastUpdate: 'LIVE', mission: 'Jebel Ali Port, Dubai - largest USN port of call in Middle East - logistics / replenishment / crew rest' },

  // =======================================================================
  // ISRAELI MILITARY ASSETS (publicly known)
  // =======================================================================

  // --- IAF: NEVATIM AIR BASE (F-35I Adir home base) ---
  { id: 'ef-30', callsign: 'NEVATIM-F35', type: 'allied', coords: [31.2083, 34.9222], unit: 'IAF Nevatim AB - F-35I Adir', branch: 'IAF', strength: 100, readiness: 100, lastUpdate: 'LIVE', mission: 'Nevatim Airbase (AFB 28), Negev - 48x F-35I Adir (116th "Lions of South", 140th "Golden Eagle", 117th sqns) - most important IAF base - underground strategic command post - US AN/TPY-2 X-band radar' },

  // --- IAF: RAMON AIR BASE (F-16I Sufa) ---
  { id: 'ef-31', callsign: 'RAMON-F16', type: 'allied', coords: [30.7761, 34.6667], unit: 'IAF Ramon AB - F-16I Sufa', branch: 'IAF', strength: 95, readiness: 98, lastUpdate: 'LIVE', mission: 'Ramon Airbase, southern Negev - F-16I Sufa multirole fighters (4 squadrons x 25 jets) - long-range strike capability with conformal fuel tanks' },

  // --- IAF: HATZERIM AIR BASE ---
  { id: 'ef-32', callsign: 'HATZERIM-AB', type: 'allied', coords: [31.2344, 34.6628], unit: 'IAF Hatzerim AB', branch: 'IAF', strength: 90, readiness: 95, lastUpdate: 'LIVE', mission: 'Hatzerim Airbase near Beersheba - F-16C/D fleet - IAF flight school - operational interceptor squadrons' },

  // --- ISRAELI NAVY: HAIFA NAVAL BASE ---
  { id: 'ef-33', callsign: 'HAIFA-NAVY', type: 'allied', coords: [32.8184, 34.9885], unit: 'Israeli Navy HQ / Haifa', branch: 'Israeli Navy', strength: 92, readiness: 96, lastUpdate: 'LIVE', mission: 'Haifa Naval Base - main IDF naval base - 7th Fleet (5x Dolphin-class submarines w/ AIP, nuclear-capable SLCMs) - 3rd Fleet (Sa\'ar 6 corvettes w/ Iron Dome & Barak-8) - missile boat squadrons' },

  // =======================================================================
  // HOSTILE (IRGC) POSITIONS
  // =======================================================================
  { id: 'hst-01', callsign: 'IRGC-QF', type: 'hostile', coords: [34.2, 51.5], unit: 'Quds Force', branch: 'IRGC', strength: 45, readiness: 60, lastUpdate: 'LIVE', mission: 'External operations - proxy coordination' },
  { id: 'hst-02', callsign: 'IRGC-GF', type: 'hostile', coords: [33.5, 50.5], unit: 'IRGC Ground Forces', branch: 'IRGC', strength: 62, readiness: 55, lastUpdate: 'LIVE', mission: 'Internal defense - Isfahan' },
  { id: 'hst-03', callsign: 'IRGC-ASF', type: 'hostile', coords: [35.3, 51.8], unit: 'IRGC Aerospace Force', branch: 'IRGC', strength: 38, readiness: 40, lastUpdate: 'LIVE', mission: 'Mobile ballistic launchers - TEL' },
  { id: 'hst-04', callsign: 'IRGCN-1', type: 'hostile', coords: [26.9, 56.0], unit: 'IRGC Navy', branch: 'IRGCN', strength: 50, readiness: 65, lastUpdate: 'LIVE', mission: 'Fast attack craft - mines - Hormuz' },
  { id: 'hst-05', callsign: 'BASIJ-1', type: 'hostile', coords: [32.8, 52.0], unit: 'Basij Resistance', branch: 'Basij', strength: 32, readiness: 25, lastUpdate: 'LIVE', mission: 'Militia - civil defense' },
];

// --------------- EVENT TEMPLATES ---------------

export const EVENT_TEMPLATES = {
  intercept: [
    'Shahab-3 ballistic missile intercepted by SM-3 - sector {sector}',
    'Shahed-136 drone neutralized by CIWS Phalanx - {sector}',
    'Soumar cruise missile intercepted by Patriot PAC-3 - {sector}',
    'Drone swarm (x{count}) neutralized by EW jamming - {sector}',
    'Emad IRBM intercepted in terminal phase - THAAD - {sector}',
  ],
  strike: [
    'Tomahawk strike confirmed on {target} - BDA ongoing',
    'B-2 Spirit sortie - GBU-57 MOP munitions on {target}',
    'F-35A strike package confirmed on {target} - objective neutralized',
    'JDAM strike from F/A-18E on {target} - impact confirmed',
    'Successful cyber attack on C2 network - {target} offline',
  ],
  intel: [
    'SIGINT: IRGC communications intercepted - TEL movement toward {sector}',
    'IMINT: Satellite imagery confirms abnormal activity at {target}',
    'HUMINT: Source CARDINAL reports HVT movement toward {sector}',
    'ELINT: New SA-20 radar detected at {sector} - freq {freq}MHz',
    'OSINT: Abnormal Iranian network traffic detected - possible cyber counter-attack',
  ],
  alert: [
    'ALERT: Launch detected from {sector} - tracking in progress',
    'ALERT: S-300 activation detected sector {sector}',
    'ALERT: Hostile force movement detected - {sector}',
    'ALERT: GPS jamming detected zone {sector} - high intensity',
    'ALERT: Unidentified submarine activity - Strait of Hormuz',
  ],
  cyber: [
    'SCADA intrusion successful - Natanz centrifuges - 12% degradation',
    'DDoS launched on IRGC telecom infrastructure - 47 nodes impacted',
    'Malware deployed on Iranian air C2 network - data exfiltration',
    'IRGC tactical communications jammed - sector {sector}',
    'Bavar-373 radar system compromised - false echoes injected',
  ],
};

export const SECTORS = ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Golf', 'Hotel'];
export const TARGETS_NAMES = infrastructure.map(i => i.name);
export const FREQS = [2400, 3100, 5800, 8900, 9200, 10400, 14200];

// --------------- INTEL TICKER MESSAGES ---------------

export const TICKER_MESSAGES = [
  'FLASH // CVN-72 Abraham Lincoln CSG-3 operating Arabian Sea - CVW-9 strike ops active - VMFA-314 F-35C sorties ongoing',
  'IMMEDIATE // CVN-78 Gerald R. Ford CSG-12 transiting Eastern Med - ordered to 5th Fleet AOR to join Lincoln',
  'FLASH // 12x F-22A Raptors confirmed at Ovda AB Israel via satellite imagery - first-ever US offensive deployment in Israel',
  'IMMEDIATE // Muwaffaq Salti AB Jordan - 60+ combat aircraft confirmed - 24x F-15E + 30x F-35A + A-10s staged',
  'PRIORITY // Prince Sultan AB Saudi Arabia - 16x KC-135 + 6x KC-46A tankers + 3x E-11A BACN + E-3 AWACS deployed',
  'FLASH // SSGN-729 USS Georgia - 154x Tomahawk TLAM capacity - participated in Operation Midnight Hammer June 2025',
  'IMMEDIATE // NSA Bahrain 5th Fleet HQ reduced to <100 mission-critical personnel - all ships departed port Feb 26',
  'PRIORITY // THAAD batteries deployed across Qatar, UAE, Jordan, Saudi Arabia - layered BMD architecture active',
  'FLASH // Iranian missiles and drones striking 5th Fleet HQ Bahrain - 2 SATCOM terminals destroyed Feb 28',
  'IMMEDIATE // DDG-57 Mitscher + DDG-112 Michael Murphy + LCS-30 Canberra patrolling Strait of Hormuz',
  'PRIORITY // 80+ C-17A Globemaster III airlift missions into Middle East since Jan 16 - largest since 2003',
  'FLASH // IAF Nevatim AB - 48x F-35I Adir operational - 116th/140th/117th squadrons at full readiness',
  'IMMEDIATE // Camp Arifjan Kuwait - ARCENT fwd HQ - 13,500 US personnel across Kuwait bases - APS-5 prepositioned',
  'PRIORITY // Ali Al Salem AB Kuwait - 386th AEW - MQ-9 Reaper + C-17/C-130 airlift hub - primary combat power gateway',
  'FLASH // Iran-backed Saraya Awliya Al Dam drone strike on US forces Erbil - ammo depot near airport hit Mar 1',
  'IMMEDIATE // Al Dhafra AB UAE - THAAD intercepts confirmed - 3,500 US personnel - RQ-4 / U-2 ISR active',
  'PRIORITY // Israeli Navy Haifa - 5x Dolphin-class submarines w/ AIP - nuclear-capable SLCM second-strike platform',
];

// --------------- HELPER FUNCTIONS ---------------

export function generateEvent(): AttackEvent {
  const types: AttackType[] = ['ballistic', 'drone', 'cyber', 'artillery', 'cruise', 'sabotage'];
  const statuses: AttackEvent['status'][] = ['intercepted', 'impact', 'ongoing', 'neutralized'];
  const type = types[Math.floor(Math.random() * types.length)];
  const status = Math.random() > 0.3 ? 'intercepted' : statuses[Math.floor(Math.random() * statuses.length)];

  const sector = SECTORS[Math.floor(Math.random() * SECTORS.length)];
  const target = TARGETS_NAMES[Math.floor(Math.random() * TARGETS_NAMES.length)];
  const freq = FREQS[Math.floor(Math.random() * FREQS.length)];
  const count = Math.floor(Math.random() * 8) + 3;

  const categories = Object.keys(EVENT_TEMPLATES) as (keyof typeof EVENT_TEMPLATES)[];
  const category = categories[Math.floor(Math.random() * categories.length)];
  const templates = EVENT_TEMPLATES[category];
  let detail = templates[Math.floor(Math.random() * templates.length)];
  detail = detail.replace('{sector}', sector).replace('{target}', target).replace('{freq}', String(freq)).replace('{count}', String(count));

  return {
    id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: Date.now(),
    type,
    origin: sector,
    target,
    status,
    details: detail,
  };
}

export function generateIntel(): IntelReport {
  const classifications: IntelReport['classification'][] = ['TS', 'SECRET', 'CONFIDENTIAL'];
  const priorities: IntelReport['priority'][] = ['FLASH', 'IMMEDIATE', 'PRIORITY', 'ROUTINE'];
  const sources = ['SIGINT', 'IMINT', 'HUMINT', 'ELINT', 'OSINT', 'MASINT'];

  const sector = SECTORS[Math.floor(Math.random() * SECTORS.length)];
  const target = TARGETS_NAMES[Math.floor(Math.random() * TARGETS_NAMES.length)];

  const allTemplates = [
    ...EVENT_TEMPLATES.intel,
    ...EVENT_TEMPLATES.alert,
  ];
  let content = allTemplates[Math.floor(Math.random() * allTemplates.length)];
  content = content.replace('{sector}', sector).replace('{target}', target).replace('{freq}', '9200');

  return {
    id: `intel-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: Date.now(),
    classification: classifications[Math.floor(Math.random() * classifications.length)],
    source: sources[Math.floor(Math.random() * sources.length)],
    content,
    priority: priorities[Math.floor(Math.random() * priorities.length)],
  };
}
