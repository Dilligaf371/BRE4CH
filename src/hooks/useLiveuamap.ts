import { useState, useEffect, useCallback } from 'react';

export interface LiveuamapEvent {
  id: string;
  name: string;
  lat: number;
  lng: number;
  time: string;
  source: string;
  url: string;
  region: string;
}

interface LiveuamapState {
  events: LiveuamapEvent[];
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
  cached: boolean;
}

const API_URL = 'http://localhost:3001/api/liveuamap';
const POLL_INTERVAL = 90_000; // Poll every 90 seconds (API has 60s cache)

export function useLiveuamap(region = 'middleeast', count = 20) {
  const [state, setState] = useState<LiveuamapState>({
    events: [],
    loading: true,
    error: null,
    lastFetch: null,
    cached: false,
  });

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}?region=${region}&count=${count}`);

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(err.error || `API returned ${res.status}`);
      }

      const data = await res.json();
      const events: LiveuamapEvent[] = data.events || [];

      setState({
        events,
        loading: false,
        error: null,
        lastFetch: Date.now(),
        cached: !!data.cached,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        loading: false,
        error: msg,
      }));
    }
  }, [region, count]);

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchEvents]);

  return state;
}
