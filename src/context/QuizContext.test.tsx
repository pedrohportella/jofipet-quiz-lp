import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import {
  QuizProvider,
  useQuizContext,
} from './QuizContext';
import type {
  QuizConfig,
  ScoringConfig,
} from '@/lib/quiz/types';

const config: QuizConfig = {
  version: 'test-1',
  questions: [
    {
      id: 'pet-ativo',
      type: 'single-choice',
      text: 'Tem pet?',
      eliminatesOnNo: true,
      options: [
        { id: 'sim', label: 'Sim' },
        { id: 'nao', label: 'Não' },
      ],
    },
    {
      id: 'especie',
      type: 'single-choice',
      text: 'Qual espécie?',
      options: [
        { id: 'cao', label: 'Cão' },
        { id: 'gato', label: 'Gato' },
      ],
    },
    {
      id: 'gasto',
      type: 'scale',
      text: 'Quanto gasta?',
      min: 0,
      max: 500,
      step: 50,
    },
  ],
};

const scoring: ScoringConfig = {
  version: 'test-1',
  axes: ['pet_ativo', 'gasto', 'dor', 'cobertura'],
  thresholds: { quente: 8, morno: 5 },
  rules: [
    {
      type: 'weights',
      questionId: 'pet-ativo',
      axis: 'pet_ativo',
      weights: { sim: 10, nao: 0 },
    },
    {
      type: 'numeric-range',
      questionId: 'gasto',
      axis: 'gasto',
      ranges: [
        { max: 100, score: 2 },
        { max: 300, score: 6 },
        { max: 500, score: 10 },
      ],
    },
  ],
};

function wrapper({ children }: { children: ReactNode }) {
  return (
    <QuizProvider config={config} scoring={scoring}>
      {children}
    </QuizProvider>
  );
}

describe('<QuizProvider> + useQuizContext', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('throws when used outside QuizProvider', () => {
    expect(() => renderHook(() => useQuizContext())).toThrow(
      /must be used inside/i,
    );
  });

  it('initializes with currentStep=0 and empty answers', () => {
    const { result } = renderHook(() => useQuizContext(), { wrapper });
    expect(result.current.state.currentStep).toBe(0);
    expect(result.current.state.answers).toEqual({});
    expect(result.current.state.startedAt).toBeNull();
    expect(result.current.state.tier).toBeNull();
  });

  it('START sets startedAt and is idempotent', () => {
    const { result } = renderHook(() => useQuizContext(), { wrapper });
    act(() => result.current.dispatch({ type: 'START' }));
    const first = result.current.state.startedAt;
    expect(first).toBeGreaterThan(0);
    act(() => result.current.dispatch({ type: 'START' }));
    expect(result.current.state.startedAt).toBe(first);
  });

  it('ANSWER persists value per questionId', () => {
    const { result } = renderHook(() => useQuizContext(), { wrapper });
    act(() =>
      result.current.dispatch({
        type: 'ANSWER',
        questionId: 'pet-ativo',
        value: 'sim',
      }),
    );
    expect(result.current.state.answers['pet-ativo']).toBe('sim');
  });

  it('NEXT advances and caps at questions.length', () => {
    const { result } = renderHook(() => useQuizContext(), { wrapper });
    act(() => result.current.dispatch({ type: 'NEXT' }));
    act(() => result.current.dispatch({ type: 'NEXT' }));
    act(() => result.current.dispatch({ type: 'NEXT' }));
    act(() => result.current.dispatch({ type: 'NEXT' }));
    expect(result.current.state.currentStep).toBe(config.questions.length);
  });

  it('BACK decrements and floors at 0', () => {
    const { result } = renderHook(() => useQuizContext(), { wrapper });
    act(() => result.current.dispatch({ type: 'GO_TO', step: 2 }));
    act(() => result.current.dispatch({ type: 'BACK' }));
    expect(result.current.state.currentStep).toBe(1);
    act(() => result.current.dispatch({ type: 'BACK' }));
    act(() => result.current.dispatch({ type: 'BACK' }));
    expect(result.current.state.currentStep).toBe(0);
  });

  it('FINISH computes tier+score+breakdown', () => {
    const { result } = renderHook(() => useQuizContext(), { wrapper });
    act(() => {
      result.current.dispatch({
        type: 'ANSWER',
        questionId: 'pet-ativo',
        value: 'sim',
      });
      result.current.dispatch({
        type: 'ANSWER',
        questionId: 'gasto',
        value: 400,
      });
      result.current.dispatch({ type: 'FINISH' });
    });
    expect(result.current.state.finishedAt).toBeGreaterThan(0);
    expect(result.current.state.tier).not.toBeNull();
    expect(result.current.state.score).not.toBeNull();
    expect(result.current.state.breakdown).not.toBeNull();
  });

  it('RESET clears answers + step + tier', () => {
    const { result } = renderHook(() => useQuizContext(), { wrapper });
    act(() => {
      result.current.dispatch({ type: 'START' });
      result.current.dispatch({
        type: 'ANSWER',
        questionId: 'pet-ativo',
        value: 'sim',
      });
      result.current.dispatch({ type: 'NEXT' });
      result.current.dispatch({ type: 'RESET' });
    });
    expect(result.current.state.currentStep).toBe(0);
    expect(result.current.state.answers).toEqual({});
    expect(result.current.state.startedAt).toBeNull();
    expect(result.current.state.tier).toBeNull();
  });

  it('persists state to sessionStorage on dispatch', async () => {
    const { result } = renderHook(() => useQuizContext(), { wrapper });
    await new Promise((r) => setTimeout(r, 0));
    act(() =>
      result.current.dispatch({
        type: 'ANSWER',
        questionId: 'especie',
        value: 'cao',
      }),
    );
    const raw = window.sessionStorage.getItem('jofi-quiz-state-v1');
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw as string);
    expect(parsed.answers.especie).toBe('cao');
  });

  it('HYDRATE restores persisted state when version matches', () => {
    window.sessionStorage.setItem(
      'jofi-quiz-state-v1',
      JSON.stringify({
        config: { version: config.version },
        currentStep: 2,
        answers: { 'pet-ativo': 'sim' },
        startedAt: 123,
        finishedAt: null,
        tier: null,
        score: null,
        breakdown: null,
        eliminated: false,
      }),
    );
    const { result } = renderHook(() => useQuizContext(), { wrapper });
    expect(result.current.state.currentStep).toBe(2);
    expect(result.current.state.answers['pet-ativo']).toBe('sim');
  });

  it('HYDRATE ignores persisted state when version differs', () => {
    window.sessionStorage.setItem(
      'jofi-quiz-state-v1',
      JSON.stringify({
        config: { version: 'OLD-VERSION' },
        currentStep: 2,
        answers: { 'pet-ativo': 'sim' },
      }),
    );
    const { result } = renderHook(() => useQuizContext(), { wrapper });
    expect(result.current.state.currentStep).toBe(0);
    expect(result.current.state.answers).toEqual({});
  });
});
