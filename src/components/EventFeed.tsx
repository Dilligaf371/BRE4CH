import { useState } from 'react';
import { AlertTriangle, Shield, Crosshair, Cpu, Bomb, Rocket, Tv, Newspaper, Globe, MapPin, Menu, ChevronUp } from 'lucide-react';
import { useEventFeed } from '../hooks/useEventFeed';
import { useOsintFeed, SOURCE_CONFIG } from '../hooks/useOsintFeed';
import type { AttackEvent } from '../data/mockData';
import type { OsintItem, OsintPriority } from '../hooks/useOsintFeed';

type FeedTab = 'events' | 'osint' | 'streams';

const TYPE_CONFIG: Record<string, { icon: typeof AlertTriangle; color: string; bg: string }> = {
  ballistic: { icon: Rocket, color: 'text-orange-400', bg: 'bg-orange-500/20' },
  drone: { icon: Crosshair, color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
  cyber: { icon: Cpu, color: 'text-purple-400', bg: 'bg-purple-500/20' },
  artillery: { icon: Bomb, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  cruise: { icon: Rocket, color: 'text-rose-400', bg: 'bg-rose-500/20' },
  sabotage: { icon: Shield, color: 'text-teal-400', bg: 'bg-teal-500/20' },
};

const STATUS_COLORS: Record<string, string> = {
  intercepted: 'text-green-400 bg-green-500/20 border-green-500/30',
  impact: 'text-red-400 bg-red-500/20 border-red-500/30',
  ongoing: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
  neutralized: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
};

const PRIORITY_STYLES: Record<OsintPriority, string> = {
  flash: 'text-red-400 bg-red-500/20 border-red-500/30',
  immediate: 'text-orange-400 bg-orange-500/20 border-orange-500/30',
  priority: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
  routine: 'text-[var(--palantir-text-muted)] bg-white/5 border-white/10',
};

function EventRow({ event }: { event: AttackEvent }) {
  const config = TYPE_CONFIG[event.type] || TYPE_CONFIG.ballistic;
  const Icon = config.icon;
  const statusClass = STATUS_COLORS[event.status] || STATUS_COLORS.ongoing;
  const time = new Date(event.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="flex items-start gap-2 px-2.5 py-2 rounded-lg bg-black/20 border border-[var(--palantir-border)]/30 hover:border-[var(--palantir-border)] transition-all group animate-fade-in">
      <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${config.bg}`}>
        <Icon className={`w-3 h-3 ${config.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border ${statusClass}`}>
            {event.status}
          </span>
          <span className={`text-[9px] font-mono ${config.color} uppercase`}>{event.type}</span>
          <span className="text-[9px] font-mono text-[var(--palantir-text-muted)] ml-auto">{time}</span>
        </div>
        <p className="text-[10px] text-[var(--palantir-text-muted)] leading-relaxed truncate group-hover:text-[var(--palantir-text)] transition-colors">
          {event.details}
        </p>
      </div>
    </div>
  );
}

function OsintRow({ item }: { item: OsintItem }) {
  const srcConfig = SOURCE_CONFIG[item.source];
  const priorityClass = PRIORITY_STYLES[item.priority];
  const time = new Date(item.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`px-2.5 py-2 rounded-lg bg-black/20 border border-[var(--palantir-border)]/30 hover:border-[var(--palantir-border)] transition-all group animate-fade-in ${item.priority === 'flash' ? 'ring-1 ring-red-500/20' : ''}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className={`text-[8px] font-mono font-bold ${srcConfig.color}`}>{srcConfig.label}</span>
        <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded border ${priorityClass}`}>
          {item.priority.toUpperCase()}
        </span>
        <div className="flex items-center gap-1 ml-auto">
          <MapPin className="w-2.5 h-2.5 text-[var(--palantir-text-muted)]" />
          <span className="text-[8px] font-mono text-[var(--palantir-text-muted)]">{item.region}</span>
          <span className="text-[8px] font-mono text-[var(--palantir-text-muted)]">{time}</span>
        </div>
      </div>
      <p className="text-[10px] font-semibold text-[var(--palantir-text)] leading-tight mb-0.5 truncate">
        {item.title}
      </p>
      <p className="text-[9px] text-[var(--palantir-text-muted)] leading-relaxed truncate group-hover:text-[var(--palantir-text)] transition-colors">
        {item.summary}
      </p>
    </div>
  );
}

function StreamsView() {
  return (
    <div className="flex-1 flex gap-2 p-2 min-h-0">
      {/* Fox News */}
      <div className="flex-1 flex flex-col bg-black rounded-lg overflow-hidden border border-[var(--palantir-border)]/50">
        <div className="flex items-center gap-1.5 px-2 py-1 bg-black/80 border-b border-[var(--palantir-border)]/30 flex-shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[9px] font-mono font-bold text-blue-400">FOX NEWS</span>
          <span className="text-[8px] font-mono text-[var(--palantir-text-muted)] bg-white/5 px-1 rounded">US</span>
          <span className="text-[8px] font-mono text-red-400 ml-auto">LIVE</span>
        </div>
        <div className="flex-1 relative min-h-0">
          <iframe
            src="https://www.youtube.com/embed/R_lRjToLD3U?autoplay=1&mute=1"
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Fox News Live"
            loading="lazy"
          />
        </div>
      </div>
      {/* Al Jazeera */}
      <div className="flex-1 flex flex-col bg-black rounded-lg overflow-hidden border border-[var(--palantir-border)]/50">
        <div className="flex items-center gap-1.5 px-2 py-1 bg-black/80 border-b border-[var(--palantir-border)]/30 flex-shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[9px] font-mono font-bold text-amber-400">AL JAZEERA</span>
          <span className="text-[8px] font-mono text-[var(--palantir-text-muted)] bg-white/5 px-1 rounded">QA</span>
          <span className="text-[8px] font-mono text-red-400 ml-auto">LIVE</span>
        </div>
        <div className="flex-1 relative min-h-0">
          <iframe
            src="https://www.youtube.com/embed/gCNeDWCI0vo?autoplay=1&mute=1"
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Al Jazeera Live"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}

export function EventFeed() {
  const events = useEventFeed(30);
  const osintItems = useOsintFeed(20);
  const [activeTab, setActiveTab] = useState<FeedTab>('events');
  const [collapsed, setCollapsed] = useState(false);

  const tabs: { id: FeedTab; label: string; icon: typeof AlertTriangle; count?: number }[] = [
    { id: 'events', label: 'EVENTS', icon: AlertTriangle, count: events.length },
    { id: 'osint', label: 'OSINT', icon: Newspaper, count: osintItems.length },
    { id: 'streams', label: 'LIVE TV', icon: Tv },
  ];

  return (
    <div className="flex flex-col h-full bg-[var(--palantir-surface)] border border-[var(--palantir-border)] rounded-lg overflow-hidden">
      {/* Header with tabs */}
      <div className="px-2 py-1.5 border-b border-[var(--palantir-border)] flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-white/5 transition-colors"
          title={collapsed ? 'Expand panel' : 'Collapse panel'}
        >
          {collapsed ? <Menu className="w-3.5 h-3.5 text-amber-400" /> : <ChevronUp className="w-3.5 h-3.5 text-amber-400" />}
        </button>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setCollapsed(false); }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] font-mono uppercase tracking-wider transition-all ${
                isActive
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'text-[var(--palantir-text-muted)] hover:text-[var(--palantir-text)] hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon className={`w-3 h-3 ${isActive && tab.id === 'events' ? 'animate-pulse text-red-400' : isActive && tab.id === 'streams' ? 'text-red-400' : ''}`} />
              {tab.label}
              {tab.count !== undefined && (
                <span className={`text-[8px] px-1 rounded ${isActive ? 'bg-amber-500/30' : 'bg-white/5'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}

        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[9px] font-mono text-red-400">LIVE</span>
        </div>
      </div>

      {/* Tab content */}
      {!collapsed && activeTab === 'events' && (
        <div className="flex-1 overflow-y-auto p-2 space-y-1 min-h-0 scrollbar-hide">
          {events.map((event) => (
            <EventRow key={event.id} event={event} />
          ))}
        </div>
      )}

      {!collapsed && activeTab === 'osint' && (
        <div className="flex-1 min-h-0 flex flex-col">
          {/* Source legend */}
          <div className="px-2 py-1 border-b border-[var(--palantir-border)]/30 flex items-center gap-2 flex-wrap flex-shrink-0">
            <Globe className="w-3 h-3 text-[var(--palantir-text-muted)]" />
            {Object.entries(SOURCE_CONFIG).map(([key, cfg]) => (
              <span key={key} className={`text-[8px] font-mono ${cfg.color}`}>{cfg.label}</span>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 min-h-0 scrollbar-hide">
            {osintItems.map((item) => (
              <OsintRow key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {!collapsed && activeTab === 'streams' && <StreamsView />}

      {collapsed && (
        <div className="px-3 py-2 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[9px] font-mono text-[var(--palantir-text-muted)]">{events.length} events — {osintItems.length} OSINT — LIVE</span>
        </div>
      )}
    </div>
  );
}
