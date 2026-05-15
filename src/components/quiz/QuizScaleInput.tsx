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
  const [touched, setTouched] = useState<boolean>(value !== undefined);

  useEffect(() => {
    if (value !== undefined) {
      setLocalValue(value);
      setTouched(true);
    }
  }, [value]);

  useEffect(() => {
    // Registra o midpoint como resposta inicial para liberar "Próxima"
    if (value === undefined) onChange(midpoint);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatted = `${question.prefix ?? ''}${localValue}${question.suffix ?? ''}`;

  const handleChange = (next: number) => {
    setLocalValue(next);
    setTouched(true);
    onChange(next);
  };

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
      {/* Trilho h-3 mobile (12px) → pareia melhor com thumb 24px definido em
          globals.css. Em desktop h-2 (8px) — trilho mais discreto pq mouse não
          precisa de área grande. accent-primary mantém compat de browsers
          que não respeitam o ::-webkit-slider-thumb custom. */}
      <input
        type="range"
        min={question.min}
        max={question.max}
        step={question.step}
        value={localValue}
        onChange={(e) => handleChange(Number(e.target.value))}
        aria-label={question.text}
        aria-valuenow={localValue}
        aria-valuemin={question.min}
        aria-valuemax={question.max}
        className="h-3 w-full cursor-pointer rounded-full bg-neutral-300 accent-primary md:h-2"
      />
      {!touched && (
        <p
          className="animate-pulse text-center text-xs font-medium text-primary"
          aria-live="polite"
        >
          👆 Arraste pra ajustar o valor
        </p>
      )}
    </div>
  );
}
