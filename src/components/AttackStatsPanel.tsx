import { useState, useEffect, useCallback } from 'react';
import { Activity, Target, Bomb, Cpu, Flame, Rocket, Shield, Plane, Crosshair, Eye, Menu, ChevronDown, ChevronUp, Wifi, Lock, Database, Terminal } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { useRealtimeStats } from '../hooks/useRealtimeStats';
import type { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: number | string;
  color: string;
  bgColor: string;
  pulse?: boolean;
  small?: boolean;
}

function StatCard({ icon, label, value, color, bgColor, pulse, small }: StatCardProps) {
  return (
    <div className={`flex items-center justify-between px-3 ${small ? 'py-1.5' : 'py-2'} rounded-lg bg-black/30 border border-[var(--palantir-border)]/50 hover:border-[var(--palantir-border)] transition-colors group`}>
      <div className="flex items-center gap-2">
        <div className={`w-6 h-6 rounded flex items-center justify-center ${bgColor}`}>
          {icon}
        </div>
        <span className="text-[10px] font-mono text-[var(--palantir-text-muted)] uppercase tracking-wider">
          {label}
        </span>
      </div>
      <span className={`font-mono font-bold ${small ? 'text-sm' : 'text-lg'} ${color} ${pulse ? 'animate-pulse' : ''} tabular-nums`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </span>
    </div>
  );
}

// ─── Day 3 (Mar 3, 2026) — Operation Epic Fury / Roar of the Lion ───
// NATO STANAG 2022: [A-F] Reliability / [1-6] Credibility
// OFF = Offensive ops (strike, power projection) | DEF = Defensive ops (IAMD, force protection)

// ─── COALITION EPIC FURY (US-LED) ───
const COALITION_FEEDS = [
  {
    id: 'usa',
    name: 'USA (CENTCOM)',
    flag: '🇺🇸',
    color: 'text-blue-400',
    borderColor: 'border-blue-500/30',
    bgColor: 'from-blue-500/10',
    offensive: [
      { label: 'TGT DESTROYED [BDA]', value: '1,000+', icon: Target, color: 'text-orange-400', bg: 'bg-orange-500/20' },
      { label: 'OCA/SEAD SORTIES', value: 247, icon: Plane, color: 'text-blue-400', bg: 'bg-blue-500/20' },
      { label: 'TLAM SALVOS', value: 312, icon: Rocket, color: 'text-orange-400', bg: 'bg-orange-500/20' },
      { label: 'IRGCN VESSELS SUNK', value: 9, icon: Crosshair, color: 'text-red-400', bg: 'bg-red-500/20' },
      { label: 'BANDAR ABBAS NHQ', value: 'DESTROYED', icon: Bomb, color: 'text-red-400', bg: 'bg-red-500/20' },
      { label: 'ENEMY KIA [EST]', value: '555+', icon: Target, color: 'text-red-400', bg: 'bg-red-500/20' },
    ],
    defensive: [
      { label: 'AEGIS BMD INTERCEPT', value: 23, icon: Shield, color: 'text-green-400', bg: 'bg-green-500/20' },
      { label: 'C-RAM ACTIVATIONS', value: 47, icon: Shield, color: 'text-green-400', bg: 'bg-green-500/20' },
      { label: 'KIA', value: 6, icon: Target, color: 'text-red-400', bg: 'bg-red-500/20' },
      { label: 'WIA', value: 34, icon: Target, color: 'text-orange-400', bg: 'bg-orange-500/20' },
    ],
    source: 'CENTCOM / Reuters [A2]',
  },
  {
    id: 'israel',
    name: 'ISRAEL (IDF/IAF)',
    flag: '🇮🇱',
    color: 'text-cyan-400',
    borderColor: 'border-cyan-500/30',
    bgColor: 'from-cyan-500/10',
    offensive: [
      { label: 'PGM DELIVERED', value: '1,200+', icon: Bomb, color: 'text-orange-400', bg: 'bg-orange-500/20' },
      { label: 'IAF OCA SORTIES', value: '30+', icon: Plane, color: 'text-blue-400', bg: 'bg-blue-500/20' },
      { label: 'PROVINCES STRUCK', value: '24/31', icon: Crosshair, color: 'text-red-400', bg: 'bg-red-500/20' },
      { label: 'HVT NEUTRALIZED', value: 7, icon: Target, color: 'text-red-400', bg: 'bg-red-500/20' },
    ],
    defensive: [
      { label: 'ARROW-3 BMD', value: 89, icon: Shield, color: 'text-green-400', bg: 'bg-green-500/20' },
      { label: 'IRON DOME INTERCEPT', value: 312, icon: Shield, color: 'text-green-400', bg: 'bg-green-500/20' },
      { label: 'KIA', value: 9, icon: Target, color: 'text-red-400', bg: 'bg-red-500/20' },
      { label: 'WIA', value: 121, icon: Target, color: 'text-orange-400', bg: 'bg-orange-500/20' },
    ],
    source: 'IDF [B2]',
  },
  {
    id: 'uk',
    name: 'UNITED KINGDOM',
    flag: '🇬🇧',
    color: 'text-indigo-400',
    borderColor: 'border-indigo-500/30',
    bgColor: 'from-indigo-500/10',
    offensive: [
      { label: 'RAF TYPHOON SORTIES', value: 48, icon: Plane, color: 'text-blue-400', bg: 'bg-blue-500/20' },
      { label: 'STORM SHADOW CRUISE', value: 24, icon: Rocket, color: 'text-orange-400', bg: 'bg-orange-500/20' },
      { label: 'HARPOON NAVAL STRIKE', value: 6, icon: Crosshair, color: 'text-red-400', bg: 'bg-red-500/20' },
    ],
    defensive: [
      { label: 'TYPE 45 SEA VIPER', value: 12, icon: Shield, color: 'text-green-400', bg: 'bg-green-500/20' },
      { label: 'PHALANX C-UAS', value: 8, icon: Shield, color: 'text-green-400', bg: 'bg-green-500/20' },
    ],
    source: 'UK MoD [B2]',
  },
  {
    id: 'uae',
    name: 'UAE',
    flag: '🇦🇪',
    color: 'text-red-400',
    borderColor: 'border-red-500/30',
    bgColor: 'from-red-500/10',
    offensive: [
      { label: 'F-16E BLK60 ISR', value: 12, icon: Plane, color: 'text-blue-400', bg: 'bg-blue-500/20' },
      { label: 'EW SUPPORT OPS', value: 3, icon: Eye, color: 'text-purple-400', bg: 'bg-purple-500/20' },
    ],
    defensive: [
      { label: 'THAAD INTERCEPT', value: 97, icon: Shield, color: 'text-green-400', bg: 'bg-green-500/20' },
      { label: 'PATRIOT PAC-3 [BM]', value: 165, icon: Shield, color: 'text-green-400', bg: 'bg-green-500/20' },
      { label: 'C-UAS INTERCEPT', value: 541, icon: Shield, color: 'text-green-400', bg: 'bg-green-500/20' },
      { label: 'UAS PENETRATIONS', value: 21, icon: Crosshair, color: 'text-red-400', bg: 'bg-red-500/20' },
      { label: 'KIA', value: 3, icon: Target, color: 'text-red-400', bg: 'bg-red-500/20' },
      { label: 'WIA', value: 58, icon: Target, color: 'text-orange-400', bg: 'bg-orange-500/20' },
    ],
    source: 'UAE MoD / Al Jazeera [A2]',
  },
  {
    id: 'ksa',
    name: 'KSA',
    flag: '🇸🇦',
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    bgColor: 'from-emerald-500/10',
    offensive: [
      { label: 'PSAB LOG SUPPORT', value: 'ACTIVE', icon: Plane, color: 'text-blue-400', bg: 'bg-blue-500/20' },
      { label: 'AAR SORTIES', value: 36, icon: Plane, color: 'text-blue-400', bg: 'bg-blue-500/20' },
    ],
    defensive: [
      { label: 'PATRIOT/THAAD STATUS', value: 'HIGH ALERT', icon: Shield, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
      { label: 'CONFIRMED ATTACKS', value: 'NIL', icon: Target, color: 'text-[var(--palantir-text-muted)]', bg: 'bg-white/5' },
    ],
    source: 'NO VERIFIED SOURCE [D5]',
  },
  {
    id: 'kuwait',
    name: 'KUWAIT',
    flag: '🇰🇼',
    color: 'text-green-400',
    borderColor: 'border-green-500/30',
    bgColor: 'from-green-500/10',
    offensive: [
      { label: 'ALI AL SALEM HNS', value: 'ACTIVE', icon: Plane, color: 'text-blue-400', bg: 'bg-blue-500/20' },
    ],
    defensive: [
      { label: 'PATRIOT BMD', value: 97, icon: Shield, color: 'text-green-400', bg: 'bg-green-500/20' },
      { label: 'C-UAS INTERCEPT', value: 283, icon: Shield, color: 'text-green-400', bg: 'bg-green-500/20' },
      { label: 'KIA', value: 1, icon: Target, color: 'text-red-400', bg: 'bg-red-500/20' },
      { label: 'WIA', value: 32, icon: Target, color: 'text-orange-400', bg: 'bg-orange-500/20' },
    ],
    source: 'Kuwait govt / Al Jazeera [A2]',
  },
  {
    id: 'bahrain',
    name: 'BAHRAIN',
    flag: '🇧🇭',
    color: 'text-yellow-400',
    borderColor: 'border-yellow-500/30',
    bgColor: 'from-yellow-500/10',
    offensive: [
      { label: 'NSA BAHRAIN 5TH FLT', value: 'LOG SUPPORT', icon: Plane, color: 'text-blue-400', bg: 'bg-blue-500/20' },
    ],
    defensive: [
      { label: 'IAMD INTERCEPT', value: 45, icon: Shield, color: 'text-green-400', bg: 'bg-green-500/20' },
      { label: 'C-UAS', value: 9, icon: Shield, color: 'text-green-400', bg: 'bg-green-500/20' },
      { label: 'KIA', value: 1, icon: Target, color: 'text-red-400', bg: 'bg-red-500/20' },
      { label: 'WIA', value: 4, icon: Target, color: 'text-orange-400', bg: 'bg-orange-500/20' },
    ],
    source: 'Al Jazeera [B2]',
  },
  {
    id: 'qatar',
    name: 'QATAR',
    flag: '🇶🇦',
    color: 'text-purple-400',
    borderColor: 'border-purple-500/30',
    bgColor: 'from-purple-500/10',
    offensive: [
      { label: 'AL UDEID CAOC', value: 'ACTIVE', icon: Plane, color: 'text-blue-400', bg: 'bg-blue-500/20' },
      { label: 'E-3 AWACS SUPPORT', value: 'ACTIVE', icon: Eye, color: 'text-purple-400', bg: 'bg-purple-500/20' },
    ],
    defensive: [
      { label: 'IAMD INTERCEPT', value: 65, icon: Shield, color: 'text-green-400', bg: 'bg-green-500/20' },
      { label: 'C-UAS', value: 12, icon: Shield, color: 'text-green-400', bg: 'bg-green-500/20' },
      { label: 'WIA', value: 16, icon: Target, color: 'text-orange-400', bg: 'bg-orange-500/20' },
    ],
    source: 'Al Jazeera [B2]',
  },
];

// ─── AXIS OF RESISTANCE (IRAN-LED) ───
const AXIS_FEEDS = [
  {
    id: 'iran',
    name: 'IRAN (IRGC/ARTESH)',
    flag: '🇮🇷',
    color: 'text-red-400',
    borderColor: 'border-red-500/30',
    bgColor: 'from-red-500/10',
    offensive: [
      { label: 'BM LAUNCHED', value: 482, icon: Rocket, color: 'text-red-400', bg: 'bg-red-500/20' },
      { label: 'ASCM FIRED', value: 38, icon: Rocket, color: 'text-orange-400', bg: 'bg-orange-500/20' },
      { label: 'SHAHEED UAS', value: 967, icon: Plane, color: 'text-red-400', bg: 'bg-red-500/20' },
      { label: 'HORMUZ MINING OP', value: 'ACTIVE', icon: Bomb, color: 'text-red-400', bg: 'bg-red-500/20' },
      { label: 'BM AT USS LINCOLN', value: '4 [CLAIMED]', icon: Rocket, color: 'text-red-400', bg: 'bg-red-500/20' },
    ],
    defensive: [
      { label: 'KIA [RED CRESCENT]', value: '555+', icon: Target, color: 'text-red-400', bg: 'bg-red-500/20' },
      { label: 'IADS SITES DESTROYED', value: 14, icon: Crosshair, color: 'text-orange-400', bg: 'bg-orange-500/20' },
      { label: 'NAVAL VESSELS LOST', value: 9, icon: Crosshair, color: 'text-red-400', bg: 'bg-red-500/20' },
      { label: 'PROVINCES UNDER STRIKE', value: '24/31', icon: Bomb, color: 'text-red-400', bg: 'bg-red-500/20' },
      { label: 'NUCLEAR SITES TGT', value: 'NATANZ/FORDOW', icon: Target, color: 'text-red-400', bg: 'bg-red-500/20' },
    ],
    source: 'IRGC/IRNA [D4] — Cross-ref Reuters/CENTCOM',
  },
  {
    id: 'hezbollah',
    name: 'HEZBOLLAH',
    flag: '🇱🇧',
    color: 'text-orange-400',
    borderColor: 'border-orange-500/30',
    bgColor: 'from-orange-500/10',
    offensive: [
      { label: 'ROCKET SALVOS (N. ISR)', value: '340+', icon: Rocket, color: 'text-red-400', bg: 'bg-red-500/20' },
      { label: 'KORNET ATGM', value: 15, icon: Crosshair, color: 'text-orange-400', bg: 'bg-orange-500/20' },
      { label: 'UAS LAUNCHED', value: 28, icon: Plane, color: 'text-red-400', bg: 'bg-red-500/20' },
    ],
    defensive: [
      { label: 'IDF STRIKES (BEIRUT)', value: 'ONGOING', icon: Bomb, color: 'text-red-400', bg: 'bg-red-500/20' },
      { label: 'LEADERSHIP TGT', value: 'CONFIRMED', icon: Target, color: 'text-red-400', bg: 'bg-red-500/20' },
      { label: 'C2 NODES HIT', value: 12, icon: Crosshair, color: 'text-orange-400', bg: 'bg-orange-500/20' },
    ],
    source: 'Al Jazeera / IDF [B3]',
  },
  {
    id: 'houthis',
    name: 'HOUTHIS (ANSAR ALLAH)',
    flag: '🇾🇪',
    color: 'text-yellow-400',
    borderColor: 'border-yellow-500/30',
    bgColor: 'from-yellow-500/10',
    offensive: [
      { label: 'ASCM (RED SEA)', value: 12, icon: Rocket, color: 'text-red-400', bg: 'bg-red-500/20' },
      { label: 'BM AT GCC', value: 8, icon: Rocket, color: 'text-orange-400', bg: 'bg-orange-500/20' },
      { label: 'SHAHEED UAS', value: 23, icon: Plane, color: 'text-red-400', bg: 'bg-red-500/20' },
    ],
    defensive: [
      { label: 'COALITION CAS (HUDAYDAH)', value: 'ONGOING', icon: Bomb, color: 'text-red-400', bg: 'bg-red-500/20' },
      { label: 'LAUNCH SITES BDA', value: 6, icon: Crosshair, color: 'text-orange-400', bg: 'bg-orange-500/20' },
    ],
    source: 'CENTCOM / Reuters [A2]',
  },
  {
    id: 'pmf',
    name: 'PMF / HASHD (IRAQ)',
    flag: '🇮🇶',
    color: 'text-amber-400',
    borderColor: 'border-amber-500/30',
    bgColor: 'from-amber-500/10',
    offensive: [
      { label: 'ROCKET ATK (US FOB)', value: 14, icon: Rocket, color: 'text-red-400', bg: 'bg-red-500/20' },
      { label: 'ONE-WAY UAS', value: 8, icon: Plane, color: 'text-red-400', bg: 'bg-red-500/20' },
      { label: 'TGT: AIN AL-ASAD', value: 'CONFIRMED', icon: Target, color: 'text-orange-400', bg: 'bg-orange-500/20' },
    ],
    defensive: [
      { label: 'US PRECISION STRIKE', value: 'LAUNCH SITES', icon: Crosshair, color: 'text-orange-400', bg: 'bg-orange-500/20' },
    ],
    source: 'CENTCOM [A2]',
  },
  {
    id: 'russia',
    name: 'RUSSIA',
    flag: '🇷🇺',
    color: 'text-gray-400',
    borderColor: 'border-gray-500/30',
    bgColor: 'from-gray-500/10',
    offensive: [
      { label: 'UNSC VETO', value: 'EXERCISED', icon: Shield, color: 'text-gray-400', bg: 'bg-gray-500/20' },
      { label: 'INTEL SHARING [SUSP]', value: 'UNCONFIRMED', icon: Eye, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
    ],
    defensive: [
      { label: 'DIPLOMATIC MEDIATION', value: 'ACTIVE', icon: Shield, color: 'text-gray-400', bg: 'bg-gray-500/20' },
    ],
    source: 'Reuters [B3] — DIPLOMATIC SUPPORT',
  },
  {
    id: 'china',
    name: 'CHINA',
    flag: '🇨🇳',
    color: 'text-gray-400',
    borderColor: 'border-gray-500/30',
    bgColor: 'from-gray-500/10',
    offensive: [
      { label: 'UNSC VETO', value: 'EXERCISED', icon: Shield, color: 'text-gray-400', bg: 'bg-gray-500/20' },
      { label: 'ECONOMIC PRESSURE', value: 'SANCTIONS BLOCK', icon: Eye, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
    ],
    defensive: [
      { label: 'DIPLOMATIC STANCE', value: 'CEASEFIRE CALL', icon: Shield, color: 'text-gray-400', bg: 'bg-gray-500/20' },
    ],
    source: 'Reuters [B3] — DIPLOMATIC SUPPORT',
  },
];

// Cyber operations metrics — Operation Epic Fury / Roar of the Lion
// Verified: Electronic warfare in Strait of Hormuz (Fox News)
// Verified: Iranian state broadcaster struck and dismantled (IDF)
// Iranian APT group names from public threat intel reporting
const CYBER_METRICS = {
  allied: {
    label: 'ALLIED CYBER/EW OPS',
    color: 'text-green-400',
    ops: [
      { label: 'EW Strait of Hormuz', value: 1, desc: 'Electronic warfare activity confirmed (Fox News)' },
      { label: 'State Broadcaster', value: 1, desc: 'Iranian state broadcaster struck and dismantled (IDF)' },
    ],
  },
  iranian: {
    label: 'IRANIAN CYBER THREATS',
    color: 'text-red-400',
    groups: [
      { name: 'CyberAv3ngers', target: 'US/GCC water & power SCADA', status: 'active', severity: 'critical' },
      { name: 'APT42 (Charming Kitten)', target: 'US/IL govt credentials phishing', status: 'active', severity: 'high' },
      { name: 'MuddyWater', target: 'GCC telecom/energy backdoors', status: 'active', severity: 'high' },
      { name: 'Void Manticore (Storm-842)', target: 'Israeli infrastructure wiper', status: 'active', severity: 'critical' },
      { name: 'Cotton Sandstorm', target: 'US social media disinfo ops', status: 'active', severity: 'high' },
    ],
  },
};

function CyberThreatRow({ group }: { group: typeof CYBER_METRICS.iranian.groups[0] }) {
  const sevColor = group.severity === 'critical' ? 'text-red-400 bg-red-500/20 border-red-500/30'
    : group.severity === 'high' ? 'text-orange-400 bg-orange-500/20 border-orange-500/30'
    : 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
  const statusColor = group.status === 'active' ? 'text-red-400' : 'text-yellow-400';

  return (
    <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-black/30 border border-[var(--palantir-border)]/30">
      <Terminal className="w-3 h-3 text-red-400 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-mono font-bold text-[var(--palantir-text)] truncate">{group.name}</span>
          <span className={`text-[7px] font-mono px-1 py-0 rounded border ${sevColor}`}>{group.severity.toUpperCase()}</span>
        </div>
        <div className="text-[8px] font-mono text-[var(--palantir-text-muted)] truncate">{group.target}</div>
      </div>
      <div className="flex items-center gap-1">
        <div className={`w-1.5 h-1.5 rounded-full ${group.status === 'active' ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'}`} />
        <span className={`text-[8px] font-mono ${statusColor}`}>{group.status.toUpperCase()}</span>
      </div>
    </div>
  );
}

// Reusable country feed renderer with OFF/DEF sections
function CountryFeed({ feed, isOpen, onToggle }: {
  feed: typeof COALITION_FEEDS[0];
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-lg border border-[var(--palantir-border)]/50 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-2.5 py-1.5 flex items-center gap-2 hover:bg-white/5 transition-colors"
      >
        <span className="text-sm">{feed.flag}</span>
        <span className={`font-semibold text-[10px] uppercase tracking-wider ${feed.color}`}>
          {feed.name}
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[8px] font-mono text-green-400">LIVE</span>
          {isOpen ? (
            <ChevronUp className="w-3 h-3 text-[var(--palantir-text-muted)]" />
          ) : (
            <ChevronDown className="w-3 h-3 text-[var(--palantir-text-muted)]" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className={`p-2 space-y-2 border-t ${feed.borderColor} animate-fade-in`}>
          {/* OFFENSIVE */}
          {feed.offensive.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 px-1">
                <Crosshair className="w-3 h-3 text-red-400" />
                <span className="text-[9px] font-mono font-bold text-red-400 uppercase tracking-wider">OFFENSIVE [OFF]</span>
              </div>
              {feed.offensive.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <StatCard
                    key={`off-${idx}`}
                    icon={<Icon className={`w-3 h-3 ${stat.color}`} />}
                    label={stat.label}
                    value={stat.value}
                    color={stat.color}
                    bgColor={stat.bg}
                    small
                  />
                );
              })}
            </div>
          )}
          {/* DEFENSIVE */}
          {feed.defensive.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 px-1">
                <Shield className="w-3 h-3 text-green-400" />
                <span className="text-[9px] font-mono font-bold text-green-400 uppercase tracking-wider">DEFENSIVE [DEF]</span>
              </div>
              {feed.defensive.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <StatCard
                    key={`def-${idx}`}
                    icon={<Icon className={`w-3 h-3 ${stat.color}`} />}
                    label={stat.label}
                    value={stat.value}
                    color={stat.color}
                    bgColor={stat.bg}
                    small
                  />
                );
              })}
            </div>
          )}
          <div className="px-3 py-1">
            <span className="text-[8px] font-mono text-[var(--palantir-text-muted)]">
              SRC: {feed.source}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/** AK-47 filled silhouette — barrel pointing left, stock right */
function AK47Icon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 32" fill="currentColor" className={className}>
      <path d="
        M0 14 L0 12 L2 11.5 L2 10.5 L3.5 10 L3.5 12
        L27 10.5 L27 9 L29 8.5 L29 10.2
        L35 9.5 L35 7.5 L36.5 7 L36.5 9.2
        L39 9 L39 7.5 L40.5 7 L40.5 9
        L43 8.5 L43.5 8 L44.5 8 L44.5 12.5
        L46 12.5 L46 13.5 L44.5 13.5
        L44 15 L42 16.5 L40 22 L38.5 22 L40 17 L40.5 15.5
        L38 15 L36 17 L34 22 L33.5 26 L32 27 L32 23 L33 18 L34 15
        L30 14.5 L28 15 L26 18 L24.5 23 L24 26 L22.5 27 L23 23 L24 18 L25.5 15
        L22 14.5 L6 15 L3.5 15.5 L2 15 L0 14 Z
      "/>
    </svg>
  );
}

/** B-2 Spirit top-down silhouette — Lucide-style SVG icon */
function B2Icon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Flying wing — top-down B-2 silhouette */}
      <path d="M12 4 L1 14 L4 14.5 L7 13 L10 14.5 L12 13.5 L14 14.5 L17 13 L20 14.5 L23 14 L12 4Z" />
      {/* Cockpit canopy */}
      <line x1="12" y1="7" x2="12" y2="10" />
      {/* Engine intakes */}
      <line x1="10" y1="10" x2="10" y2="12" />
      <line x1="14" y1="10" x2="14" y2="12" />
    </svg>
  );
}

export function AttackStatsPanel() {
  const { stats, history, interceptRate } = useRealtimeStats();
  const [metricsOpen, setMetricsOpen] = useState(() => {
    try { return localStorage.getItem('roar-metrics-open') === 'true'; } catch {} return false;
  });
  const [alliedOpen, setAlliedOpen] = useState<Record<string, boolean>>(() => {
    try { const s = localStorage.getItem('roar-allied-open'); if (s) return JSON.parse(s); } catch {} return {};
  });
  const [coalitionOpen, setCoalitionOpen] = useState(() => {
    try { return localStorage.getItem('roar-coalition-open') === 'true'; } catch {} return false;
  });
  const [axisOpen, setAxisOpen] = useState(() => {
    try { return localStorage.getItem('roar-axis-open') === 'true'; } catch {} return false;
  });
  const [cyberOpen, setCyberOpen] = useState(() => {
    try { return localStorage.getItem('roar-cyber-open') === 'true'; } catch {} return false;
  });
  const [cyberPulse, setCyberPulse] = useState(0);

  useEffect(() => { localStorage.setItem('roar-metrics-open', String(metricsOpen)); }, [metricsOpen]);
  useEffect(() => { localStorage.setItem('roar-allied-open', JSON.stringify(alliedOpen)); }, [alliedOpen]);
  useEffect(() => { localStorage.setItem('roar-coalition-open', String(coalitionOpen)); }, [coalitionOpen]);
  useEffect(() => { localStorage.setItem('roar-axis-open', String(axisOpen)); }, [axisOpen]);
  useEffect(() => { localStorage.setItem('roar-cyber-open', String(cyberOpen)); }, [cyberOpen]);

  // Simulate ongoing cyber activity counter
  useEffect(() => {
    const interval = setInterval(() => {
      setCyberPulse(prev => prev + (Math.random() > 0.6 ? 1 : 0));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const toggleAllied = (id: string) => {
    setAlliedOpen(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex flex-col gap-3">
      {/* ─── COALITION EPIC FURY (US-LED) ─── */}
      <div className="bg-[var(--palantir-surface)] border border-cyan-500/30 rounded-lg overflow-hidden">
        <button
          onClick={() => setCoalitionOpen(!coalitionOpen)}
          className="w-full px-3 py-2.5 flex items-center gap-2 hover:bg-cyan-500/5 transition-colors"
        >
          {coalitionOpen ? (
            <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
          ) : (
            <Menu className="w-3.5 h-3.5 text-cyan-400" />
          )}
          <span className="font-semibold text-xs uppercase tracking-wider text-cyan-400">
            Coalition Epic Fury
          </span>
          <span className="text-[9px] font-mono text-[var(--palantir-text-muted)]">{COALITION_FEEDS.length} nations</span>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[9px] font-mono text-green-400">LIVE</span>
          </div>
        </button>

        {coalitionOpen && (
          <div className="border-t border-cyan-500/20 space-y-1 p-1.5 animate-fade-in">
            {COALITION_FEEDS.map((feed) => (
              <CountryFeed key={feed.id} feed={feed} isOpen={!!alliedOpen[feed.id]} onToggle={() => toggleAllied(feed.id)} />
            ))}
          </div>
        )}

        {!coalitionOpen && (
          <div className="px-3 py-1.5 border-t border-cyan-500/20 flex items-center gap-2">
            <span className="text-[9px] font-mono text-[var(--palantir-text-muted)]">
              {COALITION_FEEDS.map(f => f.flag).join(' ')} — {COALITION_FEEDS.length} feeds active
            </span>
          </div>
        )}
      </div>

      {/* ─── AXIS OF RESISTANCE (IRAN-LED) ─── */}
      <div className="bg-[var(--palantir-surface)] border border-red-500/30 rounded-lg overflow-hidden">
        <button
          onClick={() => setAxisOpen(!axisOpen)}
          className="w-full px-3 py-2.5 flex items-center gap-2 hover:bg-red-500/5 transition-colors"
        >
          {axisOpen ? (
            <ChevronUp className="w-3.5 h-3.5 text-red-400" />
          ) : (
            <Menu className="w-3.5 h-3.5 text-red-400" />
          )}
          <span className="font-semibold text-xs uppercase tracking-wider text-red-400">
            Axis of Resistance
          </span>
          <span className="text-[9px] font-mono text-[var(--palantir-text-muted)]">{AXIS_FEEDS.length} entities</span>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[9px] font-mono text-red-400">HOSTILE</span>
          </div>
        </button>

        {axisOpen && (
          <div className="border-t border-red-500/20 space-y-1 p-1.5 animate-fade-in">
            {AXIS_FEEDS.map((feed) => (
              <CountryFeed key={feed.id} feed={feed} isOpen={!!alliedOpen[feed.id]} onToggle={() => toggleAllied(feed.id)} />
            ))}
          </div>
        )}

        {!axisOpen && (
          <div className="px-3 py-1.5 border-t border-red-500/20 flex items-center gap-2">
            <span className="text-[9px] font-mono text-[var(--palantir-text-muted)]">
              {AXIS_FEEDS.map(f => f.flag).join(' ')} — {AXIS_FEEDS.length} entities tracked
            </span>
          </div>
        )}
      </div>

      {/* Cyber Operations Section */}
      <div className="bg-[var(--palantir-surface)] border border-purple-500/30 rounded-lg overflow-hidden">
        <button
          onClick={() => setCyberOpen(!cyberOpen)}
          className="w-full px-3 py-2 flex items-center gap-2 hover:bg-purple-500/5 transition-colors"
        >
          <Cpu className="w-4 h-4 text-purple-400" />
          <span className="font-semibold text-xs uppercase tracking-wider text-purple-400">
            Cyber Operations
          </span>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="text-[9px] font-mono text-red-400 bg-red-500/20 px-1.5 py-0.5 rounded animate-pulse">
              {6 + Math.floor(cyberPulse / 3)} THREATS
            </span>
            {cyberOpen ? (
              <ChevronUp className="w-3.5 h-3.5 text-[var(--palantir-text-muted)]" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-[var(--palantir-text-muted)]" />
            )}
          </div>
        </button>

        {cyberOpen && (
          <div className="p-2 space-y-2 border-t border-purple-500/20 animate-fade-in">
            {/* Allied Cyber Ops */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 px-1 mb-1">
                <Lock className="w-3 h-3 text-green-400" />
                <span className="text-[9px] font-mono text-green-400 uppercase tracking-wider font-semibold">{CYBER_METRICS.allied.label}</span>
              </div>
              {CYBER_METRICS.allied.ops.map((op, idx) => (
                <div key={idx} className="flex items-center gap-2 px-2 py-1.5 rounded bg-black/30 border border-green-500/20">
                  <Database className="w-3 h-3 text-green-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-mono text-[var(--palantir-text)]">{op.label}</span>
                    <div className="text-[8px] font-mono text-[var(--palantir-text-muted)] truncate">{op.desc}</div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-green-400">{op.value}</span>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-[var(--palantir-border)]/50" />

            {/* Iranian Threat Groups */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 px-1 mb-1">
                <Wifi className="w-3 h-3 text-red-400" />
                <span className="text-[9px] font-mono text-red-400 uppercase tracking-wider font-semibold">{CYBER_METRICS.iranian.label}</span>
              </div>
              {CYBER_METRICS.iranian.groups.map((group, idx) => (
                <CyberThreatRow key={idx} group={group} />
              ))}
            </div>

            <div className="px-2 py-1">
              <span className="text-[8px] font-mono text-[var(--palantir-text-muted)]">
                SRC: CISA / Microsoft MSTIC / Mandiant / CrowdStrike
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Stream status */}
      <div className="bg-[var(--palantir-surface)] border border-[var(--palantir-border)] rounded-lg px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-mono text-[var(--palantir-text-muted)]">BRE4CH // STREAM ACTIVE</span>
        </div>
      </div>
    </div>
  );
}

function ForceBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div>
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-[9px] font-mono text-[var(--palantir-text-muted)]">{label}</span>
        <span className="text-[10px] font-mono text-[var(--palantir-text)]">{value.toLocaleString()}</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-black/50 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-1000`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
