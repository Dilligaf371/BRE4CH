import { useState, useEffect } from 'react';
import { Radio } from 'lucide-react';
import { TICKER_MESSAGES } from '../data/mockData';

export function BottomTicker() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % TICKER_MESSAGES.length);
        setFade(true);
      }, 300);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const msg = TICKER_MESSAGES[currentIndex];
  const isPriorityFlash = msg.startsWith('FLASH');

  return (
    <div className="h-8 flex-shrink-0 border-t border-[var(--palantir-border)] bg-[var(--palantir-surface)] px-4 flex items-center gap-3 overflow-hidden">
      <div className="flex items-center gap-2 flex-shrink-0">
        <Radio className={`w-3 h-3 ${isPriorityFlash ? 'text-red-400 animate-pulse' : 'text-amber-400'}`} />
        <span className={`text-[10px] font-mono font-bold tracking-wider ${isPriorityFlash ? 'text-red-400' : 'text-amber-400'}`}>
          INTEL
        </span>
        <div className="w-px h-3 bg-[var(--palantir-border)]" />
      </div>
      <div className={`flex-1 overflow-hidden transition-opacity duration-300 ${fade ? 'opacity-100' : 'opacity-0'}`}>
        <p className={`text-[10px] font-mono truncate ${isPriorityFlash ? 'text-red-300' : 'text-[var(--palantir-text-muted)]'}`}>
          {msg}
        </p>
      </div>
      <div className="flex-shrink-0 flex items-center gap-2">
        <span className="text-[9px] font-mono text-[var(--palantir-text-muted)]">
          {currentIndex + 1}/{TICKER_MESSAGES.length}
        </span>
      </div>
    </div>
  );
}
