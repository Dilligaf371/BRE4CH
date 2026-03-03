import { useState, useEffect, useCallback } from 'react';

interface SourceInfo {
  status: string;
  lastFetch: number | null;
  events?: number;
  items?: number;
  error: string | null;
}

export interface SourceStatus {
  lastRefresh: number | null;
  nextRefresh: number | null;
  refreshCount: number;
  sources: Record<string, SourceInfo>;
  running: boolean;
  intervalMs: number;
  headlineCount: number;
}

const API_URL = 'http://localhost:3001';

export function useSourceRefresh() {
  const [status, setStatus] = useState<SourceStatus | null>(null);
  const [countdown, setCountdown] = useState<number>(300); // 5 min in seconds
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/sources/status`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setStatus(data);
      setError(null);

      // Calculate countdown
      if (data.nextRefresh) {
        const remaining = Math.max(0, Math.floor((data.nextRefresh - Date.now()) / 1000));
        setCountdown(remaining);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Offline');
    }
  }, []);

  const forceRefresh = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(`${API_URL}/api/sources/refresh`, { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setStatus(data);
      if (data.nextRefresh) {
        setCountdown(Math.max(0, Math.floor((data.nextRefresh - Date.now()) / 1000)));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Refresh failed');
    }
  }, []);

  // Poll status every 30s
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30_000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  // Countdown ticker
  useEffect(() => {
    const tick = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  const onlineCount = status
    ? Object.values(status.sources).filter(s => s.status === 'ok').length
    : 0;
  const totalCount = status ? Object.keys(status.sources).length : 0;

  return {
    status,
    countdown,
    error,
    onlineCount,
    totalCount,
    forceRefresh,
    fetchStatus,
  };
}
