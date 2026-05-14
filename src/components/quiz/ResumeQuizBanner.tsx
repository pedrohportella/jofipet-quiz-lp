'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useQuizState } from '@/hooks/useQuizState';

/**
 * Banner discreto que aparece no topo da LP se o usuário começou
 * (mas não terminou) um quiz em sessão anterior.
 *
 * UX hypothesis: usuários que abandonam o quiz frequentemente voltam pra LP
 * sem perceber que podem retomar. Banner reduz fricção de re-entrada.
 *
 * - Aparece só se: startedAt set, finishedAt null, e há >=1 resposta
 * - Dismissable (não persistido — volta na próxima visita)
 * - "Continuar" pula direto pro currentStep salvo no sessionStorage
 */
export function ResumeQuizBanner() {
  const { state, hydrated } = useQuizState();
  const [dismissed, setDismissed] = useState(false);

  if (!hydrated) return null;
  if (dismissed) return null;
  if (!state.startedAt) return null;
  if (state.finishedAt) return null;

  const answered = Object.keys(state.answers).length;
  const total = state.config.questions.length;
  if (answered === 0) return null;

  const resumeStep = Math.min(state.currentStep, total - 1);

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
        className="pointer-events-none fixed inset-x-0 top-0 z-40 px-4 pt-3"
        aria-label="Continuar quiz iniciado"
      >
        <div className="pointer-events-auto mx-auto flex max-w-sm items-center gap-2 rounded-2xl bg-primary text-white shadow-lg">
          <Link
            href={`/quiz/${resumeStep}`}
            className="flex flex-1 items-center justify-between gap-3 rounded-l-2xl px-4 py-3 transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
          >
            <span className="text-left text-sm leading-tight">
              <strong className="block">Você começou um quiz</strong>
              <span className="text-xs opacity-90">
                {answered} de {total} respondidas · Continuar →
              </span>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Fechar aviso"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-r-2xl text-white/80 transition-colors hover:bg-primary/90 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}
