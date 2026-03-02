import { useState, useEffect } from 'react';
import { generateEvent, type AttackEvent } from '../data/mockData';

export function useEventFeed(maxEvents = 50) {
  const [events, setEvents] = useState<AttackEvent[]>([]);

  useEffect(() => {
    // Seed with initial events
    const seed: AttackEvent[] = [];
    for (let i = 0; i < 8; i++) {
      const evt = generateEvent();
      evt.timestamp = Date.now() - (8 - i) * 5000;
      seed.push(evt);
    }
    setEvents(seed);

    const interval = setInterval(() => {
      if (Math.random() > 0.4) {
        const evt = generateEvent();
        setEvents((prev) => {
          const next = [evt, ...prev];
          return next.length > maxEvents ? next.slice(0, maxEvents) : next;
        });
      }
    }, 2000 + Math.random() * 4000);

    return () => clearInterval(interval);
  }, [maxEvents]);

  return events;
}
