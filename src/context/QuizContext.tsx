'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
  type Dispatch,
} from 'react';
import type {
  AnswerValue,
  Answers,
  QuizConfig,
  ScoreBreakdown,
  ScoringConfig,
  Tier,
} from '@/lib/quiz/types';
import { calculateTier } from '@/lib/quiz/scoring';

const SESSION_KEY = 'jofi-quiz-state-v1';

export interface QuizState {
  config: QuizConfig;
  scoring: ScoringConfig;
  currentStep: number;
  answers: Answers;
  startedAt: number | null;
  finishedAt: number | null;
  tier: Tier | null;
  score: number | null;
  breakdown: ScoreBreakdown | null;
  eliminated: boolean;
}

export type QuizAction =
  | { type: 'START' }
  | { type: 'ANSWER'; questionId: string; value: AnswerValue }
  | { type: 'NEXT' }
  | { type: 'BACK' }
  | { type: 'GO_TO'; step: number }
  | { type: 'FINISH' }
  | { type: 'HYDRATE'; state: Partial<QuizState> }
  | { type: 'RESET' };

function reducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'START':
      return state.startedAt
        ? state
        : { ...state, startedAt: Date.now(), currentStep: 0 };
    case 'ANSWER':
      return {
        ...state,
        answers: { ...state.answers, [action.questionId]: action.value },
      };
    case 'NEXT':
      return {
        ...state,
        currentStep: Math.min(
          state.currentStep + 1,
          state.config.questions.length,
        ),
      };
    case 'BACK':
      return { ...state, currentStep: Math.max(0, state.currentStep - 1) };
    case 'GO_TO':
      return {
        ...state,
        currentStep: Math.max(
          0,
          Math.min(action.step, state.config.questions.length),
        ),
      };
    case 'FINISH': {
      const result = calculateTier(state.answers, state.scoring);
      return {
        ...state,
        finishedAt: Date.now(),
        tier: result.tier,
        score: result.score,
        breakdown: result.breakdown,
        eliminated: result.eliminated,
      };
    }
    case 'HYDRATE':
      return {
        ...state,
        ...action.state,
        config: state.config,
        scoring: state.scoring,
      };
    case 'RESET':
      return buildInitialState(state.config, state.scoring);
    default:
      return state;
  }
}

function buildInitialState(
  config: QuizConfig,
  scoring: ScoringConfig,
): QuizState {
  return {
    config,
    scoring,
    currentStep: 0,
    answers: {},
    startedAt: null,
    finishedAt: null,
    tier: null,
    score: null,
    breakdown: null,
    eliminated: false,
  };
}

function readPersisted(): Partial<QuizState> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<QuizState>;
  } catch {
    return null;
  }
}

export interface QuizContextValue {
  state: QuizState;
  dispatch: Dispatch<QuizAction>;
  hydrated: boolean;
}

const QuizContext = createContext<QuizContextValue | null>(null);

export interface QuizProviderProps {
  config: QuizConfig;
  scoring: ScoringConfig;
  children: ReactNode;
}

export function QuizProvider({
  config,
  scoring,
  children,
}: QuizProviderProps) {
  const [state, dispatch] = useReducer(
    reducer,
    { config, scoring },
    ({ config: c, scoring: s }) => buildInitialState(c, s),
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const persisted = readPersisted();
    if (persisted && persisted.config?.version === config.version) {
      dispatch({ type: 'HYDRATE', state: persisted });
    }
    setHydrated(true);
  }, [config.version]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
    } catch {
      // sessionStorage bloqueado (private mode) — ignorar
    }
  }, [state, hydrated]);

  const value = useMemo(
    () => ({ state, dispatch, hydrated }),
    [state, hydrated],
  );

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}

export function useQuizContext(): QuizContextValue {
  const ctx = useContext(QuizContext);
  if (!ctx) {
    throw new Error('useQuizContext must be used inside <QuizProvider>');
  }
  return ctx;
}
