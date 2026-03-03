import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * LIVE FEED MACRO — Pulls real headlines from backend every 30s
 * and distributes them to OSINT, SOCMINT, Events, and Map panels.
 */

export interface LiveHeadline {
  title: string;
  link: string;
  pubDate: string;
  source: string;
}

interface LiveFeedState {
  headlines: LiveHeadline[];
  lastFetch: number | null;
  error: string | null;
  loading: boolean;
}

const API_URL = 'http://localhost:3001';
const POLL_INTERVAL = 30_000; // 30s — polls cached backend data

export function useLiveFeed() {
  const [state, setState] = useState<LiveFeedState>({
    headlines: [],
    lastFetch: null,
    error: null,
    loading: true,
  });
  const prevHeadlinesRef = useRef<string[]>([]);

  const fetchHeadlines = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/sources/headlines`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setState({
        headlines: data.items || [],
        lastFetch: Date.now(),
        error: null,
        loading: false,
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Offline',
      }));
    }
  }, []);

  useEffect(() => {
    fetchHeadlines();
    const interval = setInterval(fetchHeadlines, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchHeadlines]);

  // Detect new headlines that weren't in previous fetch
  const newHeadlines = state.headlines.filter(
    h => !prevHeadlinesRef.current.includes(h.title)
  );

  useEffect(() => {
    prevHeadlinesRef.current = state.headlines.map(h => h.title);
  }, [state.headlines]);

  return {
    ...state,
    newHeadlines,
    headlineCount: state.headlines.length,
  };
}
