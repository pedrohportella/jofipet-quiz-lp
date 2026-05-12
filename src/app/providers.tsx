'use client';

import { type ReactNode } from 'react';
import { QuizProvider } from '@/context/QuizContext';
import { quizConfig, scoringConfig } from '@/lib/quiz/loader';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QuizProvider config={quizConfig} scoring={scoringConfig}>
      {children}
    </QuizProvider>
  );
}
