'use client';

import { useEffect, useState } from 'react';
import type { TextInputQuestion } from '@/lib/quiz/types';
import { cn } from '@/lib/utils/cn';

function formatCep(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits ? `(${digits}` : '';
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export interface QuizTextInputProps {
  question: TextInputQuestion;
  value: string | undefined;
  onChange: (value: string) => void;
}

export function QuizTextInput({
  question,
  value,
  onChange,
}: QuizTextInputProps) {
  const [local, setLocal] = useState<string>(value ?? '');

  useEffect(() => {
    if (value !== undefined && value !== local) setLocal(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const applyMask = (raw: string): string => {
    if (question.mask === 'cep') return formatCep(raw);
    if (question.mask === 'phone') return formatPhone(raw);
    return raw;
  };

  const handleChange = (raw: string) => {
    const masked = applyMask(raw);
    setLocal(masked);
    onChange(masked);
  };

  return (
    <div className="flex w-full flex-col">
      <input
        type={question.mask === 'phone' ? 'tel' : 'text'}
        inputMode={question.mask ? 'numeric' : 'text'}
        placeholder={question.placeholder ?? ''}
        value={local}
        onChange={(e) => handleChange(e.target.value)}
        aria-label={question.text}
        autoComplete="off"
        className={cn(
          'h-14 w-full rounded-2xl border border-neutral-300 bg-white px-4 text-lg',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2',
        )}
      />
    </div>
  );
}
