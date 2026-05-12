'use client';

import { useEffect, useState } from 'react';
import type { ScaleQuestion } from '@/lib/quiz/types';

export interface QuizScaleInputProps {
  question: ScaleQuestion;
  value: number | undefined;
  onChange: (value: number) => void;
}

export function QuizScaleInput({
  question,
  value,
  onChange,
}: QuizScaleInputProps) {
  const midpoint =
    question.min + Math.round((question.max - question.min) / 2);
  const [localValue, setLocalValue] = useState<number>(value ?? midpoint);

  useEffect(() => {
    if (value !== undefined) setLocalValue(value);
  }, [value]);

  useEffect(() => {
    // Registra o midpoint como resposta inicial para liberar "Próxima"
    if (value === undefined) onChange(midpoint);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatted = `${question.prefix ?? ''}${localValue}${question.suffix ?? ''}`;

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-baseline justify-between text-sm text-neutral-500">
        <span>
          {question.prefix ?? ''}
          {question.min}
        </span>
        <span
          className="text-2xl font-bold text-neutral-900"
          aria-live="polite"
        >
          {formatted}
        </span>
        <span>
          {question.prefix ?? ''}
          {question.max}
          {question.suffix ?? ''}
        </span>
      </div>
      <input
        type="range"
        min={question.min}
        max={question.max}
        step={question.step}
        value={localValue}
        onChange={(e) => {
          const next = Number(e.target.value);
          setLocalValue(next);
          onChange(next);
        }}
        aria-label={question.text}
        aria-valuenow={localValue}
        aria-valuemin={question.min}
        aria-valuemax={question.max}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-neutral-300 accent-primary"
      />
    </div>
  );
}
