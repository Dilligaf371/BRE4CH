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
export const CURRENT_PHASE: MissionPhase = 'PHASE IV - EXPLOIT';
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
  // VERIFIED: Iran IAEA ambassador says Natanz was targeted (Al Jazeera, Mar 2)
  // VERIFIED: IAEA says NO confirmed damage to nuclear facilities as of Mar 2
  // VERIFIED: IAEA "cannot rule out radiological release" (Reuters)
  // VERIFIED: June 2025 strikes already damaged Fordow/Natanz — "almost all sensitive equipment at Fordow destroyed" (IAEA Sep 2025)
  { id: 'inf-01', name: 'Natanz', nameEn: 'Natanz Enrichment', type: 'nuclear', coords: [33.7233, 51.7233], status: 'unknown', priority: 1, description: 'Iran IAEA ambassador confirms targeted — IAEA: no confirmed damage as of Mar 2 — cannot rule out radiological release (Reuters/Al Jazeera)', defenseLevel: 50 },
  { id: 'inf-02', name: 'Fordow', nameEn: 'Fordow Underground', type: 'nuclear', coords: [34.7083, 51.5833], status: 'damaged', priority: 1, description: 'Already damaged by June 2025 strikes — almost all sensitive equipment destroyed (IAEA Sep 2025) — current status unknown', defenseLevel: 40 },
  { id: 'inf-03', name: 'Bushehr', nameEn: 'Bushehr NPP', type: 'nuclear', coords: [28.8333, 50.8833], status: 'active', priority: 2, description: 'Nuclear power plant — VVER-1000 — NOT targeted (Russian-built civilian reactor — Reuters)', defenseLevel: 72 },
  { id: 'inf-04', name: 'Isfahan UCF', nameEn: 'Isfahan Nuclear Tech', type: 'nuclear', coords: [32.6546, 51.6680], status: 'damaged', priority: 2, description: 'Uranium conversion — damaged in June 2025 strikes — part of 24/31 provinces hit (IDF)', defenseLevel: 30 },
  { id: 'inf-05', name: 'Arak', nameEn: 'Arak Heavy Water', type: 'nuclear', coords: [34.0493, 49.2433], status: 'unknown', priority: 1, description: 'Heavy water reactor IR-40 — no specific confirmed reports from verified sources', defenseLevel: 50 },

  // Command & Control
  // VERIFIED: 40+ senior Iranian leaders killed including Khamenei (Reuters)
  // VERIFIED: 7 Iranian security leaders confirmed killed (IDF)
  { id: 'inf-06', name: 'Tehran HQ IRGC', nameEn: 'IRGC Supreme Command', type: 'command', coords: [35.6892, 51.3890], status: 'damaged', priority: 1, description: '40+ senior leaders killed incl. Khamenei — 7 security leaders confirmed KIA (Reuters/IDF)', defenseLevel: 40 },
  { id: 'inf-07', name: 'Parchin', nameEn: 'Parchin Military Complex', type: 'command', coords: [35.5175, 51.7711], status: 'unknown', priority: 1, description: 'Military complex — part of 1,000+ targets hit (Reuters) — no specific BDA from verified sources', defenseLevel: 50 },

  // Airbases — IDF confirms 24/31 provinces hit, 1,200+ munitions (IDF)
  { id: 'inf-08', name: 'Shiraz AFB', nameEn: 'Shiraz Air Base', type: 'airbase', coords: [29.5392, 52.5898], status: 'unknown', priority: 2, description: 'Tactical air base — within 24/31 provinces hit (IDF) — no specific BDA confirmed', defenseLevel: 50 },
  { id: 'inf-09', name: 'Tabriz AFB', nameEn: 'Tabriz Air Base', type: 'airbase', coords: [38.0667, 46.2833], status: 'unknown', priority: 3, description: 'Northern air base — within 24/31 provinces hit (IDF) — no specific BDA confirmed', defenseLevel: 50 },
  { id: 'inf-10', name: 'Isfahan AFB', nameEn: 'Isfahan 8th TAB', type: 'airbase', coords: [32.7500, 51.8612], status: 'unknown', priority: 2, description: '8th tactical air base — within 24/31 provinces hit (IDF) — no specific BDA confirmed', defenseLevel: 50 },
  { id: 'inf-11', name: 'Mehrabad', nameEn: 'Mehrabad Air Base', type: 'airbase', coords: [35.6894, 51.3113], status: 'unknown', priority: 2, description: 'Tehran joint-use base — no specific BDA confirmed from verified sources', defenseLevel: 50 },

  // Naval
  // VERIFIED: 9 Iranian naval ships sunk, naval HQ "largely destroyed" (Reuters/Trump)
  // VERIFIED: Iranian naval presence denied in Gulf of Oman within 48 hours (Reuters)
  // VERIFIED: Strait of Hormuz declared closed by Iranian general (Al Jazeera)
  { id: 'inf-12', name: 'Bandar Abbas', nameEn: 'Bandar Abbas Naval HQ', type: 'naval', coords: [27.1833, 56.2667], status: 'damaged', priority: 1, description: 'Naval HQ "largely destroyed" — 9 ships sunk — naval presence denied in Gulf of Oman within 48h (Reuters)', defenseLevel: 25 },
  { id: 'inf-13', name: 'Jask', nameEn: 'Jask Naval Forward', type: 'naval', coords: [25.6514, 57.7711], status: 'unknown', priority: 2, description: 'Forward naval base — Strait of Hormuz declared closed (Al Jazeera) — EW activity detected (Fox News)', defenseLevel: 40 },

  // Missile sites — IRGC still firing True Promise 4 waves (Al Jazeera)
  { id: 'inf-14', name: 'Khorramabad', nameEn: 'Khorramabad MRBM', type: 'missile', coords: [33.4878, 48.3558], status: 'unknown', priority: 1, description: 'Ballistic missile base — IRGC still launching True Promise 4 waves (Al Jazeera)', defenseLevel: 50 },
  { id: 'inf-15', name: 'Tabriz Missiles', nameEn: 'Tabriz Missile Base', type: 'missile', coords: [37.8500, 46.3500], status: 'unknown', priority: 2, description: 'Northwest missile base — within 24/31 provinces hit (IDF)', defenseLevel: 50 },
  { id: 'inf-16', name: 'Semnan', nameEn: 'Semnan Space/Missile', type: 'missile', coords: [35.5833, 53.4167], status: 'unknown', priority: 1, description: 'Space/missile center — within 24/31 provinces hit (IDF) — no specific BDA confirmed', defenseLevel: 50 },

  // Oil / Energy
  { id: 'inf-17', name: 'Abadan', nameEn: 'Abadan Refinery', type: 'oil', coords: [30.3472, 48.2933], status: 'unknown', priority: 2, description: 'Oil refinery — no specific confirmed reports from Reuters/Fox/IDF/Al Jazeera', defenseLevel: 50 },
  { id: 'inf-18', name: 'Kharg Island', nameEn: 'Kharg Oil Terminal', type: 'oil', coords: [29.2333, 50.3167], status: 'unknown', priority: 1, description: 'Offshore terminal — oil exports disrupted — no specific BDA from verified sources', defenseLevel: 50 },

  // Radar / Air Defense — part of 30+ strike operations against BM and AD arrays (IDF)
  { id: 'inf-19', name: 'S-300 Tehran', nameEn: 'Tehran AD Network', type: 'radar', coords: [35.7500, 51.5000], status: 'unknown', priority: 1, description: 'S-300PMU2 — IDF confirms 30+ strike ops vs BM and AD arrays — specific BDA unconfirmed', defenseLevel: 50 },
  { id: 'inf-20', name: 'Bavar-373', nameEn: 'Bavar-373 Isfahan', type: 'radar', coords: [32.8000, 51.9000], status: 'unknown', priority: 2, description: 'Bavar-373 system — part of AD arrays targeted by 30+ IDF strike ops — specific BDA unconfirmed', defenseLevel: 50 },

  // Military bases
  { id: 'inf-21', name: 'Qom IRGC', nameEn: 'Qom IRGC Base', type: 'military', coords: [34.6401, 50.8764], status: 'unknown', priority: 1, description: 'IRGC base — within 24/31 provinces hit (IDF) — no specific BDA confirmed', defenseLevel: 50 },
  { id: 'inf-22', name: 'Kerman', nameEn: 'Kerman Military', type: 'military', coords: [30.2839, 57.0834], status: 'unknown', priority: 3, description: 'Eastern military base — within 24/31 provinces hit (IDF) — no specific BDA confirmed', defenseLevel: 50 },

  // State Media — VERIFIED: struck and dismantled (IDF)
  { id: 'inf-23', name: 'IRIB Tehran', nameEn: 'State Broadcaster', type: 'command', coords: [35.7000, 51.4200], status: 'neutralized', priority: 2, description: 'Iranian state broadcaster — struck and dismantled (IDF confirmed)', defenseLevel: 0 },
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
  // HOSTILE (IRGC) POSITIONS — Verified data from Reuters/Al Jazeera/IDF/Fox News
  // =======================================================================
  // VERIFIED: 40+ senior leaders killed incl Khamenei (Reuters)
  // VERIFIED: 9 naval ships sunk, naval HQ destroyed (Reuters)
  // VERIFIED: IRGC still launching True Promise 4 waves (Al Jazeera)
  // VERIFIED: Strait of Hormuz declared closed (Al Jazeera)
  // VERIFIED: 555 killed in Iran (Red Crescent via Reuters)
  // VERIFIED: 158 students killed Minab school (Iran claims via Al Jazeera)
  { id: 'hst-01', callsign: 'IRGC-QF', type: 'hostile', coords: [34.2, 51.5], unit: 'Quds Force', branch: 'IRGC', strength: 50, readiness: 50, lastUpdate: 'LIVE', mission: 'Leadership decimated — 40+ senior leaders killed including Khamenei (Reuters) — 7 security leaders confirmed KIA (IDF)' },
  { id: 'hst-02', callsign: 'IRGC-GF', type: 'hostile', coords: [33.5, 50.5], unit: 'IRGC Ground Forces', branch: 'IRGC', strength: 60, readiness: 50, lastUpdate: 'LIVE', mission: '555 killed across Iran (Red Crescent via Reuters) — 1,000+ US targets hit (Reuters)' },
  { id: 'hst-03', callsign: 'IRGC-ASF', type: 'hostile', coords: [35.3, 51.8], unit: 'IRGC Aerospace Force', branch: 'IRGC', strength: 50, readiness: 50, lastUpdate: 'LIVE', mission: 'True Promise 4 ongoing — 7th/8th waves launched (Al Jazeera) — 27 US bases targeted' },
  { id: 'hst-04', callsign: 'IRGCN-1', type: 'hostile', coords: [26.9, 56.0], unit: 'IRGC Navy', branch: 'IRGCN', strength: 30, readiness: 30, lastUpdate: 'LIVE', mission: '9 ships sunk — naval HQ largely destroyed — Hormuz declared closed — EW activity (Reuters/Al Jazeera/Fox News)' },
  { id: 'hst-05', callsign: 'BASIJ-1', type: 'hostile', coords: [32.8, 52.0], unit: 'Basij Resistance', branch: 'Basij', strength: 60, readiness: 50, lastUpdate: 'LIVE', mission: 'Civil defense — 158 students killed Minab school (Al Jazeera) — martial law reported' },
];

// --------------- EVENT TEMPLATES ---------------

export const EVENT_TEMPLATES = {
  intercept: [
    'Shahab-3 ballistic missile intercepted by SM-3 - sector {sector}',
    'Shahed-136 drone neutralized by CIWS Phalanx - {sector}',
    'Soumar cruise missile intercepted by Patriot PAC-3 - {sector}',
    'Drone swarm (x{count}) neutralized by EW jamming - {sector}',
    'Emad IRBM intercepted in terminal phase - THAAD - {sector}',
    'Fateh-110 SRBM intercepted by Arrow-2 - trajectory from {sector}',
    'Kaman-22 UAV engaged by F/A-18E AIM-9X - {sector} corridor',
    'Mobin MRBM intercepted mid-course - Aegis BMD - {sector}',
    'Houthi Toufan drone neutralized over Red Sea - Iron Dome - {sector}',
    'IRGC Arash loitering munition engaged by C-RAM - {sector}',
  ],
  strike: [
    'Tomahawk strike confirmed on {target} - BDA ongoing',
    'B-2 Spirit sortie - GBU-57 MOP munitions on {target}',
    'F-35A strike package confirmed on {target} - objective neutralized',
    'JDAM strike from F/A-18E on {target} - impact confirmed',
    'Successful cyber attack on C2 network - {target} offline',
    'F-35I Adir - SDB II strike on mobile TEL near {target} - BDA: destroyed',
    'B-52H CALCM salvo - 12x AGM-86C on {target} - secondary explosions',
    'F-15E Strike Eagle - GBU-28 bunker buster on {target} underground facility',
    'MQ-9 Reaper Hellfire strike - IRGC convoy near {target} - 4 vehicles destroyed',
    'Tomahawk Block V strike on {target} - mission kill confirmed via IMINT',
  ],
  intel: [
    'SIGINT: IRGC communications intercepted - TEL movement toward {sector}',
    'IMINT: Satellite imagery confirms abnormal activity at {target}',
    'HUMINT: Source CARDINAL reports HVT movement toward {sector}',
    'ELINT: New SA-20 radar detected at {sector} - freq {freq}MHz',
    'OSINT: Abnormal Iranian network traffic detected - possible cyber counter-attack',
    'SIGINT: IRGC Quds Force encrypted burst to Hezbollah - sector {sector}',
    'IMINT: BDA confirms {target} runway cratered - non-operational',
    'MASINT: Seismic activity consistent with underground detonation near {target}',
    'SIGINT: Iranian civil defense frequency active - evacuation order {sector}',
    'ELINT: Iranian EW jamming detected - GPS denied zone expanding {sector}',
  ],
  alert: [
    'ALERT: Launch detected from {sector} - tracking in progress',
    'ALERT: S-300 activation detected sector {sector}',
    'ALERT: Hostile force movement detected - {sector}',
    'ALERT: GPS jamming detected zone {sector} - high intensity',
    'ALERT: Unidentified submarine activity - Strait of Hormuz',
    'ALERT: IRGCN mine-laying activity detected - Strait of Hormuz sector {sector}',
    'ALERT: Proxy rocket barrage from southern Iraq - targeting {sector}',
    'ALERT: Iranian Ghadir midget submarine contact - Gulf of Oman',
    'ALERT: IRGC mobile TEL emerging from tunnel - {sector} - time-sensitive target',
    'ALERT: Houthi anti-ship missile launched toward Red Sea shipping - {sector}',
  ],
  cyber: [
    'SCADA intrusion successful - Natanz centrifuges - 12% degradation',
    'DDoS launched on IRGC telecom infrastructure - 47 nodes impacted',
    'Malware deployed on Iranian air C2 network - data exfiltration',
    'IRGC tactical communications jammed - sector {sector}',
    'Bavar-373 radar system compromised - false echoes injected',
    'Iranian banking SWIFT node disrupted - financial C2 degraded',
    'Power grid SCADA access - Isfahan province rolling blackouts initiated',
    'IRGC drone command frequency hijacked - 3 Shahed-136 redirected',
    'Iranian state TV broadcast interrupted - replaced with coalition message',
    'CyberAv3ngers counter-op detected and neutralized - no damage',
  ],
};

export const SECTORS = ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Golf', 'Hotel'];
export const TARGETS_NAMES = infrastructure.map(i => i.name);
export const FREQS = [2400, 3100, 5800, 8900, 9200, 10400, 14200];

// --------------- INTEL TICKER MESSAGES ---------------

// VERIFIED TICKER MESSAGES — Sources: Reuters, Al Jazeera, IDF, Fox News ONLY
export const TICKER_MESSAGES = [
  // Leadership — Reuters
  'FLASH // Khamenei killed in coalition strikes — 40+ senior Iranian leaders killed in opening wave (Reuters)',
  'FLASH // 7 Iranian security leaders confirmed killed by IDF strikes (IDF)',
  // US operations — Reuters
  'FLASH // US forces hit 1,000+ targets in first 2 days of Operation Epic Fury (Reuters)',
  'FLASH // 9 Iranian naval ships sunk — naval HQ "largely destroyed" (Reuters)',
  'IMMEDIATE // Iranian naval presence denied in Gulf of Oman within 48 hours (Reuters)',
  'PRIORITY // 6 US aircrew killed — F-15Es shot down by Kuwaiti Patriot battery — friendly fire [A2] (Reuters)',
  'IMMEDIATE // Trump: operation could take "four to five weeks" (Reuters)',
  'IMMEDIATE // Oil hits $155/barrel — Iranian exports disrupted — global energy crisis deepening (Reuters)',
  // IDF operations — IDF
  'FLASH // IAF drops 1,200+ munitions across 24 of 31 Iranian provinces — 30+ strike operations (IDF)',
  'FLASH // IDF strikes and dismantles Iranian state broadcaster (IDF)',
  // Iran True Promise 4 — Al Jazeera
  'FLASH // Iran True Promise 4 launched — 27 US bases targeted — 7th/8th waves ongoing (Al Jazeera)',
  'FLASH // IRGC claims targeting USS Abraham Lincoln with 4 ballistic missiles (Al Jazeera)',
  'IMMEDIATE // Explosions reported in Dubai, Doha, Manama for 3 consecutive days (Al Jazeera)',
  'FLASH // Warhead landed near Temple Mount — 40+ buildings damaged in Tel Aviv (Al Jazeera)',
  'IMMEDIATE // Strait of Hormuz declared closed by Iranian general (Al Jazeera)',
  // Gulf state damage — Al Jazeera
  'IMMEDIATE // UAE: 165 BM + 2 cruise + 541 drones fired — 3 KIA 58 WIA — 21 drones penetrated (Al Jazeera / UAE MoD)',
  'IMMEDIATE // Kuwait: 97 BM + 283 drones intercepted — Kuwait airport hit by drone — 1 KIA 32 WIA (Al Jazeera)',
  'PRIORITY // Bahrain: 45 missiles + 9 drones shot down — 5th Fleet HQ targeted — 1 KIA 4 WIA (Al Jazeera)',
  'PRIORITY // Qatar: 65 missiles + 12 drones — most intercepted — 16 injured (Al Jazeera)',
  // Israel — IDF / Al Jazeera
  'FLASH // Israel: 9+ KIA 121 WIA from Iranian strikes — Arrow-3 exo-atmospheric intercepts confirmed (IDF / Al Jazeera)',
  // Iran casualties — Reuters / Al Jazeera
  'IMMEDIATE // 555 killed in Iran per Red Crescent [B3] — 158 students killed in Minab [D4 Iran claim] (Reuters / Al Jazeera)',
  // IAEA — Reuters / Al Jazeera
  'PRIORITY // Iran IAEA ambassador confirms Natanz targeted — IAEA: no confirmed damage to nuclear facilities as of Mar 2 (Reuters / Al Jazeera)',
  'PRIORITY // IAEA: "cannot rule out radiological release" from strikes near nuclear sites (Reuters)',
  // Regional escalation — Al Jazeera
  'FLASH // Hezbollah fires rockets at northern Israel — first since Nov 2024 ceasefire — IDF retaliates on Beirut suburbs (Al Jazeera)',
  'IMMEDIATE // 31 killed, 149 wounded in Lebanon from Israeli retaliatory strikes (Al Jazeera)',
  'IMMEDIATE // Dubai International Airport damaged and shut down — regional airspace closures across 7 countries (Fox News / Al Jazeera)',
  'PRIORITY // Cyprus: drone hits British air base — limited damage (Al Jazeera)',
  // Fox News
  'IMMEDIATE // Electronic warfare activity detected in Strait of Hormuz (Fox News)',
  'PRIORITY // Burj Al Arab minor fire from intercepted drone debris — Jebel Ali Port berth fire (Al Jazeera)',
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
