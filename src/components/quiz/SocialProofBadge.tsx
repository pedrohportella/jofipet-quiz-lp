'use client';

import { useEffect, useState } from 'react';

/**
 * Estimativa de social proof baseada em hora do dia.
 * Substituir por contador real lido do /api/admin/stats quando admin estiver no ar
 * com dados suficientes.
 */
function estimateDailyCount(): number {
  const now = new Date();
  const hour = now.getHours();
  const base = 18 + hour * 3;
  const jitter = Math.floor(Math.random() * 6);
  return base + jitter;
}

export function SocialProofBadge() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    setCount(estimateDailyCount());
  }, []);

  if (count === null) return null;

  return (
    <p className="text-center text-xs font-medium text-neutral-500">
      <span className="text-primary">{count} tutores</span> fizeram o quiz hoje
    </p>
  );
}
