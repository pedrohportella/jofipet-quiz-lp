'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useHaptic } from '@/hooks/useHaptic';
import { IconeEmoji } from '@/components/shared/IconeEmoji';

export interface QuizOptionProps {
  id: string;
  label: string;
  /** Emoji do dado (quiz.json). Na tela vira ícone de linha; o dado segue com o emoji. */
  emoji?: string;
  selected: boolean;
  disabled?: boolean;
  onSelect: (id: string) => void;
  variant?: 'single' | 'multi';
}

/**
 * Opção de resposta no design system da Jofi: item arredondado em borda-suave, ícone de linha
 * em bola, e o selecionado em azul (borda e fundo-suave).
 */
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
        'flex min-h-[60px] w-full items-center gap-3 rounded-[30px] border-2 border-neutral-300 bg-white px-5 text-left',
        'text-base font-bold text-neutral-900 transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2',
        selected && 'border-primary bg-primary-50',
        disabled && 'cursor-not-allowed opacity-40',
      )}
    >
      {emoji && (
        <span
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white transition-colors duration-150',
            selected ? 'bg-primary' : 'bg-accent',
          )}
          aria-hidden="true"
        >
          <IconeEmoji emoji={emoji} className="h-[18px] w-[18px]" />
        </span>
      )}
      <span className="flex-1">{label}</span>
      {selected && variant === 'multi' && (
        <Check className="h-5 w-5 text-primary" aria-hidden="true" />
      )}
    </motion.button>
  );
}
