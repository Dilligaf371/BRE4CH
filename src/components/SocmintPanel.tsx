import { useState, useEffect } from 'react';
import { Eye, MessageCircle, Camera, Filter, AlertTriangle, MapPin, Globe, Menu, ChevronDown, ChevronUp } from 'lucide-react';
import { useSocmintFeed } from '../hooks/useSocmintFeed';
import type { SocmintItem, SocmintPlatform, SocmintSeverity } from '../hooks/useSocmintFeed';

const SEVERITY_STYLES: Record<SocmintSeverity, { border: string; text: string; badge: string }> = {
  critical: { border: 'border-red-500/50', text: 'text-red-400', badge: 'bg-red-500/20 text-red-400 border-red-500/30' },
  high: { border: 'border-orange-500/30', text: 'text-orange-400', badge: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  medium: { border: 'border-yellow-500/20', text: 'text-yellow-400', badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  low: { border: 'border-[var(--palantir-border)]/30', text: 'text-[var(--palantir-text-muted)]', badge: 'bg-white/5 text-[var(--palantir-text-muted)] border-white/10' },
};

const PLATFORM_ICONS: Record<SocmintPlatform, { icon: typeof MessageCircle; color: string; bg: string; label: string }> = {
  telegram: { icon: MessageCircle, color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'TG' },
  x: { icon: Globe, color: 'text-gray-300', bg: 'bg-gray-500/20', label: 'X' },
  snapchat: { icon: Camera, color: 'text-yellow-400', bg: 'bg-yellow-500/20', label: 'SNAP' },
};

function SocmintItemRow({ item }: { item: SocmintItem }) {
  const severity = SEVERITY_STYLES[item.severity];
  const platform = PLATFORM_ICONS[item.platform];
  const Icon = platform.icon;
  const time = new Date(item.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className={`px-2.5 py-2 rounded-lg bg-black/20 border ${severity.border} hover:border-[var(--palantir-border)] transition-all group animate-fade-in ${item.flagged ? 'ring-1 ring-red-500/20' : ''}`}>
      <div className="flex items-center gap-2 mb-1">
        <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${platform.bg}`}>
          <Icon className={`w-2.5 h-2.5 ${platform.color}`} />
        </div>
        <span className={`text-[8px] font-mono font-bold ${platform.color} uppercase`}>{platform.label}</span>
        <span className={`text-[8px] font-mono px-1 py-0.5 rounded border ${severity.badge}`}>
          {item.severity.toUpperCase()}
        </span>
        {item.language !== 'EN' && (
          <span className="text-[8px] font-mono text-purple-400 bg-purple-500/10 px-1 rounded flex items-center gap-0.5">
            <Globe className="w-2 h-2" />
            {item.language}
          </span>
        )}
        {item.flagged && (
          <AlertTriangle className="w-2.5 h-2.5 text-red-400 animate-pulse" />
        )}
        <span className="text-[8px] font-mono text-[var(--palantir-text-muted)] ml-auto">{time}</span>
      </div>
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-[9px] font-mono text-[var(--palantir-text-muted)] mb-0.5 truncate">
            {item.source}
          </div>
          <p className={`text-[10px] leading-relaxed ${item.flagged ? 'text-[var(--palantir-text)]' : 'text-[var(--palantir-text-muted)]'} group-hover:text-[var(--palantir-text)] transition-colors`}
            dir={item.language === 'FA' ? 'rtl' : 'ltr'}
          >
            {item.content}
          </p>
          {item.location && (
            <div className="flex items-center gap-1 mt-1">
              <MapPin className="w-2.5 h-2.5 text-cyan-400" />
              <span className="text-[8px] font-mono text-cyan-400">{item.location}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function SocmintPanel() {
  const items = useSocmintFeed(40);
  const [filterPlatform, setFilterPlatform] = useState<'all' | SocmintPlatform>('all');
  const [filterSeverity, setFilterSeverity] = useState<'all' | SocmintSeverity>('all');
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('roar-socmint-collapsed') === 'true'; } catch {} return false;
  });

  useEffect(() => { localStorage.setItem('roar-socmint-collapsed', String(collapsed)); }, [collapsed]);

  const filtered = items.filter(item => {
    if (filterPlatform !== 'all' && item.platform !== filterPlatform) return false;
    if (filterSeverity !== 'all' && item.severity !== filterSeverity) return false;
    return true;
  });

  const criticalCount = items.filter(i => i.severity === 'critical').length;
  const telegramCount = items.filter(i => i.platform === 'telegram').length;
  const xCount = items.filter(i => i.platform === 'x').length;
  const snapCount = items.filter(i => i.platform === 'snapchat').length;

  return (
    <div className="flex flex-col h-full bg-[var(--palantir-surface)] border border-[var(--palantir-border)] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-[var(--palantir-border)] flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-white/5 transition-colors"
          title={collapsed ? 'Expand panel' : 'Collapse panel'}
        >
          {collapsed ? <Menu className="w-3.5 h-3.5 text-purple-400" /> : <ChevronUp className="w-3.5 h-3.5 text-purple-400" />}
        </button>
        <Eye className="w-4 h-4 text-purple-400" />
        <span className="font-semibold text-xs uppercase tracking-wider text-[var(--palantir-text)]">
          SOCMINT
        </span>
        <span className="text-[9px] font-mono text-[var(--palantir-text-muted)]">Social Intel</span>
        <div className="ml-auto flex items-center gap-1.5">
          {criticalCount > 0 && (
            <span className="text-[9px] font-mono text-red-400 bg-red-500/20 px-1.5 py-0.5 rounded animate-pulse">
              {criticalCount} CRIT
            </span>
          )}
          <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
        </div>
      </div>

      {!collapsed && (
        <>
          {/* Platform stats bar */}
          <div className="px-2 py-1.5 border-b border-[var(--palantir-border)]/50 flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3 text-blue-400" />
              <span className="text-[9px] font-mono text-blue-400">{telegramCount} TG</span>
            </div>
            <div className="w-px h-3 bg-[var(--palantir-border)]" />
            <div className="flex items-center gap-1">
              <Globe className="w-3 h-3 text-gray-300" />
              <span className="text-[9px] font-mono text-gray-300">{xCount} X</span>
            </div>
            <div className="w-px h-3 bg-[var(--palantir-border)]" />
            <div className="flex items-center gap-1">
              <Camera className="w-3 h-3 text-yellow-400" />
              <span className="text-[9px] font-mono text-yellow-400">{snapCount} SNAP</span>
            </div>
            <div className="w-px h-3 bg-[var(--palantir-border)]" />
            <span className="text-[9px] font-mono text-[var(--palantir-text-muted)]">{items.length} total</span>
          </div>

          {/* Filters */}
          <div className="px-2 py-1.5 border-b border-[var(--palantir-border)]/50 flex items-center gap-1.5 flex-shrink-0">
            <Filter className="w-3 h-3 text-[var(--palantir-text-muted)]" />
            {/* Platform filter */}
            <button
              onClick={() => setFilterPlatform('all')}
              className={`text-[8px] font-mono px-1.5 py-0.5 rounded border transition-colors ${filterPlatform === 'all' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'text-[var(--palantir-text-muted)] border-transparent hover:border-[var(--palantir-border)]'}`}
            >ALL</button>
            <button
              onClick={() => setFilterPlatform(filterPlatform === 'telegram' ? 'all' : 'telegram')}
              className={`text-[8px] font-mono px-1.5 py-0.5 rounded border transition-colors ${filterPlatform === 'telegram' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'text-[var(--palantir-text-muted)] border-transparent hover:border-[var(--palantir-border)]'}`}
            >TG</button>
            <button
              onClick={() => setFilterPlatform(filterPlatform === 'x' ? 'all' : 'x')}
              className={`text-[8px] font-mono px-1.5 py-0.5 rounded border transition-colors ${filterPlatform === 'x' ? 'bg-gray-500/20 text-gray-300 border-gray-500/30' : 'text-[var(--palantir-text-muted)] border-transparent hover:border-[var(--palantir-border)]'}`}
            >X</button>
            <button
              onClick={() => setFilterPlatform(filterPlatform === 'snapchat' ? 'all' : 'snapchat')}
              className={`text-[8px] font-mono px-1.5 py-0.5 rounded border transition-colors ${filterPlatform === 'snapchat' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'text-[var(--palantir-text-muted)] border-transparent hover:border-[var(--palantir-border)]'}`}
            >SNAP</button>

            <div className="w-px h-3 bg-[var(--palantir-border)]" />

            {/* Severity filter */}
            <button
              onClick={() => setFilterSeverity(filterSeverity === 'critical' ? 'all' : 'critical')}
              className={`text-[8px] font-mono px-1.5 py-0.5 rounded border transition-colors ${filterSeverity === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'text-[var(--palantir-text-muted)] border-transparent hover:border-[var(--palantir-border)]'}`}
            >CRIT</button>
            <button
              onClick={() => setFilterSeverity(filterSeverity === 'high' ? 'all' : 'high')}
              className={`text-[8px] font-mono px-1.5 py-0.5 rounded border transition-colors ${filterSeverity === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'text-[var(--palantir-text-muted)] border-transparent hover:border-[var(--palantir-border)]'}`}
            >HIGH</button>
          </div>

          {/* Feed */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 min-h-0 scrollbar-hide">
            {filtered.map((item) => (
              <SocmintItemRow key={item.id} item={item} />
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-8">
                <span className="text-[10px] font-mono text-[var(--palantir-text-muted)]">No items match filter</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-3 py-1.5 border-t border-[var(--palantir-border)] flex items-center gap-2 flex-shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
            <span className="text-[9px] font-mono text-[var(--palantir-text-muted)]">SOCMINT // {telegramCount} TG ITEMS // {xCount} X ITEMS // {snapCount} SNAP ITEMS</span>
          </div>
        </>
      )}

      {collapsed && (
        <div className="px-3 py-2 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
          <span className="text-[9px] font-mono text-[var(--palantir-text-muted)]">{items.length} items — {criticalCount} CRIT — {telegramCount} TG / {xCount} X / {snapCount} SNAP</span>
        </div>
      )}
    </div>
  );
}
