'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuizState } from '@/hooks/useQuizState';
import { trackQuizStep } from '@/lib/tracking/events';
import { QuizProgressBar } from './QuizProgressBar';
import { QuizBackButton } from './QuizBackButton';
import { QuizOption } from './QuizOption';
import { QuizScaleInput } from './QuizScaleInput';
import { QuizTextInput } from './QuizTextInput';
import { QuizMultiChoice } from './QuizMultiChoice';
import type {
  AnswerValue,
  SingleChoiceQuestion,
  MultiChoiceQuestion,
  ScaleQuestion,
  TextInputQuestion,
} from '@/lib/quiz/types';

const AUTO_ADVANCE_DELAY_MS = 200;

export function QuizStep({ stepIndex }: { stepIndex: number }) {
  const { state, dispatch, hydrated } = useQuizState();
  const router = useRouter();
  const [pendingAdvance, setPendingAdvance] = useState(false);

  const total = state.config.questions.length;
  const clampedIndex = Math.min(Math.max(stepIndex, 0), total - 1);
  const question = state.config.questions[clampedIndex];
  const currentAnswer = question ? state.answers[question.id] : undefined;

  useEffect(() => {
    if (!state.startedAt) dispatch({ type: 'START' });
    dispatch({ type: 'GO_TO', step: clampedIndex });
  }, [clampedIndex, dispatch, state.startedAt]);

  useEffect(() => {
    if (!question) return;
    trackQuizStep(clampedIndex + 1, question.id);
  }, [clampedIndex, question?.id, question]);

  const goNext = () => {
    if (clampedIndex + 1 >= total) {
      dispatch({ type: 'FINISH' });
      router.push('/captura');
      return;
    }
    dispatch({ type: 'NEXT' });
    router.push(`/quiz/${clampedIndex + 1}`);
  };

  const goBack = () => {
    if (clampedIndex === 0) {
      router.push('/');
      return;
    }
    dispatch({ type: 'BACK' });
    router.push(`/quiz/${clampedIndex - 1}`);
  };

  const handleAnswer = (value: AnswerValue, options?: { autoAdvance?: boolean }) => {
    if (!question) return;
    dispatch({ type: 'ANSWER', questionId: question.id, value });

    if (question.id === 'pet-ativo' && value === 'nao') {
      router.push('/obrigado-sem-pet');
      return;
    }

    if (options?.autoAdvance) {
      setPendingAdvance(true);
      window.setTimeout(() => {
        setPendingAdvance(false);
        goNext();
      }, AUTO_ADVANCE_DELAY_MS);
    }
  };

  if (!question) {
    return null;
  }

  // Evita hydration mismatch: aguarda o QuizProvider rehidratar do sessionStorage
  // antes de renderizar controles interativos cujo valor depende do state client-only.
  if (!hydrated) {
    return (
      <main className="mx-auto flex min-h-[100dvh] max-w-mobile flex-col px-4 pb-6 pt-safe-top md:max-w-desktop">
        <header className="flex items-center justify-between py-3">
          <span aria-hidden="true" className="h-11 w-11" />
          <span className="text-sm font-semibold text-neutral-500">
            {clampedIndex + 1} de {total}
          </span>
        </header>
        <div className="h-1 w-full rounded-full bg-neutral-300" aria-hidden="true" />
      </main>
    );
  }

  const needsManualAdvance =
    question.type !== 'single-choice' ||
    (question as SingleChoiceQuestion).eliminatesOnNo === undefined;

  const canAdvance = (() => {
    if (question.type === 'text-input' && question.skipAllowed) return true;
    if (currentAnswer === undefined) return false;
    if (Array.isArray(currentAnswer) && currentAnswer.length === 0) return false;
    return true;
  })();

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-mobile flex-col px-4 pb-6 pt-safe-top md:max-w-desktop">
      <header className="flex items-center justify-between py-3">
        <QuizBackButton onClick={goBack} />
        <span className="text-sm font-semibold text-neutral-500">
          {clampedIndex + 1} de {total}
        </span>
      </header>
      <QuizProgressBar current={clampedIndex + 1} total={total} />

      <AnimatePresence mode="wait">
        <motion.section
          key={question.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
          className="mt-8 flex flex-1 flex-col gap-6"
        >
          {question.emoji && (
            <span
              className="text-5xl"
              aria-hidden="true"
              role="presentation"
            >
              {question.emoji}
            </span>
          )}

          <h1 className="text-2xl font-bold leading-tight text-neutral-900 md:text-3xl">
            {question.text}
          </h1>

          <div className="flex-1">
            {question.type === 'single-choice' && (
              <SingleChoiceView
                question={question}
                selected={currentAnswer as string | undefined}
                disabled={pendingAdvance}
                onSelect={(id) =>
                  handleAnswer(id, { autoAdvance: true })
                }
              />
            )}
            {question.type === 'multi-choice' && (
              <QuizMultiChoice
                question={question as MultiChoiceQuestion}
                selected={(currentAnswer as string[] | undefined) ?? []}
                onChange={(next) => handleAnswer(next)}
              />
            )}
            {question.type === 'scale' && (
              <QuizScaleInput
                question={question as ScaleQuestion}
                value={currentAnswer as number | undefined}
                onChange={(v) => handleAnswer(v)}
              />
            )}
            {question.type === 'text-input' && (
              <QuizTextInput
                question={question as TextInputQuestion}
                value={currentAnswer as string | undefined}
                onChange={(v) => handleAnswer(v)}
              />
            )}
          </div>

          {needsManualAdvance && question.type !== 'single-choice' && (
            <footer className="sticky bottom-4 flex flex-col gap-2 pt-6">
              <button
                type="button"
                onClick={goNext}
                disabled={!canAdvance}
                className="h-14 w-full rounded-full bg-primary text-base font-semibold text-white shadow-sm transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Próxima →
              </button>
              {question.type === 'text-input' &&
                (question as TextInputQuestion).skipAllowed && (
                  <button
                    type="button"
                    onClick={goNext}
                    className="text-sm text-neutral-500 underline"
                  >
                    Pular essa pergunta
                  </button>
                )}
            </footer>
          )}
        </motion.section>
      </AnimatePresence>
    </main>
  );
}

function SingleChoiceView({
  question,
  selected,
  disabled,
  onSelect,
}: {
  question: SingleChoiceQuestion;
  selected: string | undefined;
  disabled: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={question.text}
      className="flex w-full flex-col gap-3"
    >
      {question.options.map((option) => (
        <QuizOption
          key={option.id}
          id={option.id}
          label={option.label}
          emoji={option.emoji}
          selected={selected === option.id}
          disabled={disabled && selected !== option.id}
          onSelect={onSelect}
          variant="single"
        />
      ))}
    </div>
  );
}
