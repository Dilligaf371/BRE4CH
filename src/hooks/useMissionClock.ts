import { useState, useEffect } from 'react';
import { MISSION_START } from '../data/mockData';

export interface MissionTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
  washingtonTime: string;
  tehranTime: string;
  abuDhabiTime: string;
}

export function useMissionClock(): MissionTime {
  const [time, setTime] = useState<MissionTime>(calcTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(calcTime());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return time;
}

function formatCityTime(tz: string): string {
  return new Date().toLocaleTimeString('en-GB', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

function calcTime(): MissionTime {
  const now = Date.now();
  const elapsed = now - MISSION_START;
  const totalSeconds = Math.floor(elapsed / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => String(n).padStart(2, '0');
  const formatted = `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  return {
    days, hours, minutes, seconds, formatted,
    washingtonTime: formatCityTime('America/New_York'),
    tehranTime: formatCityTime('Asia/Tehran'),
    abuDhabiTime: formatCityTime('Asia/Dubai'),
  };
}
