'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useHaptic } from '@/hooks/useHaptic';

export interface QuizOptionProps {
  id: string;
  label: string;
  emoji?: string;
  selected: boolean;
  disabled?: boolean;
  onSelect: (id: string) => void;
  variant?: 'single' | 'multi';
}

export function QuizOption({
  id,
  label,
  emoji,
  selected,
  disabled = false,
  onSelect,
  variant = 'single',
}: QuizOptionProps) {
  const haptic = useHaptic();

  const handleClick = () => {
    if (disabled) return;
    haptic('light');
    onSelect(id);
  };

  return (
    <motion.button
      type="button"
      role={variant === 'single' ? 'radio' : 'checkbox'}
      aria-checked={selected}
      aria-label={label}
      disabled={disabled}
      onClick={handleClick}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.08 }}
      className={cn(
        'flex min-h-[56px] w-full items-center gap-3 rounded-2xl border border-neutral-300 bg-white px-4 text-left',
        'text-base font-medium text-neutral-900 transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2',
        selected && 'border-primary bg-primary/10',
        disabled && 'cursor-not-allowed opacity-40',
      )}
    >
      {emoji && (
        <span className="text-2xl" aria-hidden="true">
          {emoji}
        </span>
      )}
      <span className="flex-1">{label}</span>
      {selected && variant === 'multi' && (
        <Check className="h-5 w-5 text-primary" aria-hidden="true" />
      )}
    </motion.button>
  );
}
