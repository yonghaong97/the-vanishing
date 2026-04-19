'use client';
import { useState, useEffect } from 'react';

/** Returns a live HH:MM string, updated every 30 s. */
export function useClock(): string {
  const [time, setTime] = useState(() => fmt(new Date()));

  useEffect(() => {
    const tick = () => setTime(fmt(new Date()));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  return time;
}

function fmt(d: Date): string {
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
          .replace(' AM', '').replace(' PM', '');
}
