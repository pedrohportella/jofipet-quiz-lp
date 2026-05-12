import quizJson from '../../../config/quiz.json';
import scoringJson from '../../../config/scoring.json';
import cepCoverageJson from '../../../config/cep-coverage.json';
import {
  CepCoverageConfigSchema,
  QuizConfigSchema,
  ScoringConfigSchema,
} from './schema';
import type {
  CepCoverageConfig,
  QuizConfig,
  ScoringConfig,
} from './types';

function parseOrThrow<T>(
  name: string,
  schema: { safeParse: (v: unknown) => { success: boolean; data?: T; error?: unknown } },
  raw: unknown,
): T {
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new Error(
      `[quiz/loader] Config "${name}" inválido: ${JSON.stringify(result.error)}`,
    );
  }
  return result.data as T;
}

export const quizConfig: QuizConfig = parseOrThrow<QuizConfig>(
  'quiz.json',
  QuizConfigSchema,
  quizJson,
);

export const scoringConfig: ScoringConfig = parseOrThrow<ScoringConfig>(
  'scoring.json',
  ScoringConfigSchema,
  scoringJson,
);

export const cepCoverageConfig: CepCoverageConfig =
  parseOrThrow<CepCoverageConfig>(
    'cep-coverage.json',
    CepCoverageConfigSchema,
    cepCoverageJson,
  );

export function getQuestionById(id: string) {
  return quizConfig.questions.find((q) => q.id === id);
}

export function getAnswerLabel(questionId: string, answerId: string): string {
  const question = getQuestionById(questionId);
  if (!question) return answerId;
  if (question.type !== 'single-choice' && question.type !== 'multi-choice') {
    return answerId;
  }
  const option = question.options.find((o) => o.id === answerId);
  return option?.label ?? answerId;
}
