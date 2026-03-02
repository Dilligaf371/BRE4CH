import { useState } from 'react';
import { Tv, Volume2, VolumeX, Maximize2, Minimize2 } from 'lucide-react';

interface StreamChannel {
  id: string;
  name: string;
  label: string;
  color: string;
  embedUrl: string;
}

const CHANNELS: StreamChannel[] = [
  {
    id: 'fox-news',
    name: 'FOX NEWS',
    label: 'US',
    color: 'text-blue-400',
    embedUrl: 'https://www.youtube.com/embed/R_lRjToLD3U?autoplay=1&mute=1',
  },
  {
    id: 'i24-news',
    name: 'i24NEWS',
    label: 'IL',
    color: 'text-cyan-400',
    embedUrl: 'https://www.youtube.com/embed/live_stream?channel=UCHqC-yWZ1kri4YzwRSt6IGA&autoplay=1&mute=1',
  },
];

function StreamEmbed({ channel, expanded }: { channel: StreamChannel; expanded: boolean }) {
  const [muted, setMuted] = useState(true);
  const src = channel.embedUrl.replace('mute=1', `mute=${muted ? 1 : 0}`);

  return (
    <div className={`flex flex-col bg-black rounded-lg overflow-hidden border border-[var(--palantir-border)]/50 ${expanded ? 'flex-1' : ''}`}>
      {/* Channel label bar */}
      <div className="flex items-center justify-between px-2 py-1 bg-black/80 border-b border-[var(--palantir-border)]/30">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className={`text-[9px] font-mono font-bold ${channel.color}`}>{channel.name}</span>
          <span className="text-[8px] font-mono text-[var(--palantir-text-muted)] bg-white/5 px-1 rounded">{channel.label}</span>
        </div>
        <button
          onClick={() => setMuted(!muted)}
          className="p-0.5 hover:bg-white/10 rounded transition-colors"
        >
          {muted ? (
            <VolumeX className="w-3 h-3 text-[var(--palantir-text-muted)]" />
          ) : (
            <Volume2 className="w-3 h-3 text-amber-400" />
          )}
        </button>
      </div>
      {/* Iframe */}
      <div className="relative w-full aspect-video bg-black">
        <iframe
          key={`${channel.id}-${muted}`}
          src={src}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={channel.name}
          loading="lazy"
        />
      </div>
    </div>
  );
}

export function LiveStreams() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`flex flex-col h-full bg-[var(--palantir-surface)] border border-[var(--palantir-border)] rounded-lg overflow-hidden ${expanded ? '' : ''}`}>
      {/* Header */}
      <div className="px-3 py-2 border-b border-[var(--palantir-border)] flex items-center gap-2 flex-shrink-0">
        <Tv className="w-3.5 h-3.5 text-red-400" />
        <span className="font-semibold text-xs uppercase tracking-wider text-[var(--palantir-text)]">
          Live Feeds
        </span>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[9px] font-mono text-red-400">LIVE</span>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            {expanded ? (
              <Minimize2 className="w-3 h-3 text-[var(--palantir-text-muted)]" />
            ) : (
              <Maximize2 className="w-3 h-3 text-[var(--palantir-text-muted)]" />
            )}
          </button>
        </div>
      </div>

      {/* Streams grid */}
      <div className={`flex-1 p-2 flex gap-2 min-h-0 ${expanded ? 'flex-col' : 'flex-row'}`}>
        {CHANNELS.map((ch) => (
          <StreamEmbed key={ch.id} channel={ch} expanded={expanded} />
        ))}
      </div>
    </div>
  );
}
