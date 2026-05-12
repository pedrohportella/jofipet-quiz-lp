'use client';

import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface QuizBackButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export function QuizBackButton({
  onClick,
  disabled = false,
  className,
}: QuizBackButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label="Voltar para pergunta anterior"
      className={cn(
        'flex h-11 w-11 items-center justify-center rounded-full',
        'text-neutral-700 transition-colors hover:bg-neutral-100',
        'disabled:pointer-events-none disabled:opacity-0',
        className,
      )}
    >
      <ChevronLeft className="h-6 w-6" aria-hidden="true" />
    </button>
  );
}
