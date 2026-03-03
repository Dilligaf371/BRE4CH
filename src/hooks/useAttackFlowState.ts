import { useState, useCallback } from 'react';

function loadBool(key: string, fallback: boolean): boolean {
  try {
    const v = localStorage.getItem(key);
    if (v !== null) return v === 'true';
  } catch { /* ignore */ }
  return fallback;
}

function saveBool(key: string, val: boolean) {
  try { localStorage.setItem(key, String(val)); } catch { /* ignore */ }
}

const KEY_CONV = 'roar-flow-conventional';
const KEY_CYBER = 'roar-flow-cyber';

export function useAttackFlowState() {
  const [showConventional, setConv] = useState(() => loadBool(KEY_CONV, false));
  const [showCyber, setCyber] = useState(() => loadBool(KEY_CYBER, false));

  const toggleConventional = useCallback(() => {
    setConv((prev) => { const next = !prev; saveBool(KEY_CONV, next); return next; });
  }, []);

  const toggleCyber = useCallback(() => {
    setCyber((prev) => { const next = !prev; saveBool(KEY_CYBER, next); return next; });
  }, []);

  return { showConventional, showCyber, toggleConventional, toggleCyber } as const;
}
