'use client';

import { cn } from '@/lib/utils/cn';

export interface QuizProgressBarProps {
  current: number;
  total: number;
  className?: string;
}

export function QuizProgressBar({
  current,
  total,
  className,
}: QuizProgressBarProps) {
  const safeTotal = Math.max(total, 1);
  const clamped = Math.min(Math.max(current, 0), safeTotal);
  const percent = Math.round((clamped / safeTotal) * 100);

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={safeTotal}
      aria-label={`Pergunta ${clamped} de ${safeTotal}`}
      className={cn('h-1 w-full overflow-hidden rounded-full bg-neutral-300', className)}
    >
      <div
        className="h-full rounded-full bg-primary transition-all duration-[400ms] ease-jofi-out"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
