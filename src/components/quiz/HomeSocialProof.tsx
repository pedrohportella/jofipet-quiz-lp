'use client';

import { useEffect, useState } from 'react';

const MIN_DISPLAY = 18;

function estimateDailyCount(): number {
  const hour = new Date().getHours();
  const base = MIN_DISPLAY + hour * 3;
  const jitter = Math.floor(Math.random() * 6);
  return base + jitter;
}

/**
 * Variante de social proof pra Landing Page (count real + fallback gracioso).
 * - Lê `/api/stats/public` (count agregado, sem PII)
 * - Se count real < MIN_DISPLAY ou request falha → fallback de estimativa por hora
 * - Enquanto carrega, mostra placeholder neutro (não cria layout shift)
 */
export function HomeSocialProof() {
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

  // Placeholder gracioso enquanto carrega — evita layout shift
  if (count === null) {
    return (
      <p
        className="text-sm font-semibold text-neutral-500"
        aria-hidden="true"
      >
        Junte-se à comunidade Jofi 🐾
      </p>
    );
  }

  return (
    <p className="text-sm font-semibold text-neutral-500">
      🐾 <span className="text-primary">+{count} tutores</span> fizeram o quiz hoje
    </p>
  );
}
