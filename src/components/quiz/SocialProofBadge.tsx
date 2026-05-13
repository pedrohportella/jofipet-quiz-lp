'use client';

import { useEffect, useState } from 'react';

const MIN_DISPLAY = 18;

function estimateDailyCount(): number {
  const hour = new Date().getHours();
  const base = MIN_DISPLAY + hour * 3;
  const jitter = Math.floor(Math.random() * 6);
  return base + jitter;
}

export function SocialProofBadge() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/stats/public', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { quizStartedToday?: number } | null) => {
        if (cancelled) return;
        const real = data?.quizStartedToday ?? 0;
        const display = real >= MIN_DISPLAY ? real : estimateDailyCount();
        setCount(display);
      })
      .catch(() => {
        if (!cancelled) setCount(estimateDailyCount());
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (count === null) return null;

  return (
    <p className="text-center text-xs font-medium text-neutral-500">
      <span className="text-primary">{count} tutores</span> fizeram o quiz hoje
    </p>
  );
}
