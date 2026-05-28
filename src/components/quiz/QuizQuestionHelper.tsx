'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

/**
 * Helper expansível pra perguntas sensíveis (CEP, gasto).
 *
 * UX hypothesis: usuários pulam ou mentem em campos que sentem como
 * "dados demais". Explicar o porquê reduz fricção e melhora qualidade
 * do dado (especialmente CEP — chave pra mostrar vets próximos).
 *
 * Microcopy direta, sem juridiquês. Tom Jofi: gentil e transparente.
 */
const HELPER_TEXTS: Record<string, string> = {
  cep: 'A gente usa o CEP só pra mostrar vets parceiros perto de você. Não é obrigatório — pode pular se preferir.',
  'gasto-mensal':
    'Saber seu gasto atual ajuda a recomendar uma cobertura que cabe no seu orçamento. Não compartilhamos com ninguém.',
};

export function QuizQuestionHelper({ questionId }: { questionId: string }) {
  const [open, setOpen] = useState(false);
  const text = HELPER_TEXTS[questionId];
  if (!text) return null;

  return (
    <div className="flex w-full flex-col gap-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={`helper-${questionId}`}
        className="inline-flex items-center gap-1.5 self-start rounded-md px-1 py-0.5 text-xs font-medium text-primary transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      >
        <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="underline-offset-4 hover:underline">
          Por que perguntamos isso?
        </span>
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 transition-transform',
            open && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`helper-${questionId}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <p className="rounded-lg bg-cream px-3 py-2 text-xs leading-relaxed text-neutral-700">
              {text}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
