'use client';

import { type ReactNode } from 'react';
import { MotionConfig } from 'framer-motion';
import { QuizProvider } from '@/context/QuizContext';
import { quizConfig, scoringConfig } from '@/lib/quiz/loader';

export function Providers({ children }: { children: ReactNode }) {
  return (
    // reducedMotion="user" → Framer Motion respeita o setting "Reduce Motion"
    // do sistema operacional do usuário (iOS Accessibility, macOS, Windows).
    // Sem isso, motion.div sempre anima mesmo com preference desligada.
    // Complementa o CSS @media (prefers-reduced-motion) que cobre só animações CSS.
    <MotionConfig reducedMotion="user">
      <QuizProvider config={quizConfig} scoring={scoringConfig}>
        {children}
      </QuizProvider>
    </MotionConfig>
  );
}
