import { describe, it, expect } from 'vitest';
import {
  quizConfig,
  scoringConfig,
  cepCoverageConfig,
  getQuestionById,
  getAnswerLabel,
} from './loader';
import {
  QuizConfigSchema,
  ScoringConfigSchema,
  CepCoverageConfigSchema,
} from './schema';

describe('quiz loader (Zod-validated configs)', () => {
  it('quizConfig parses without errors and exposes ≥6 questions', () => {
    expect(quizConfig.version).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(quizConfig.questions.length).toBeGreaterThanOrEqual(6);
  });

  it('scoringConfig has 4 expected axes', () => {
    expect(scoringConfig.axes).toEqual([
      'pet_ativo',
      'gasto',
      'dor',
      'cobertura',
    ]);
  });

  it('cepCoverageConfig has fallback-neutral mode or strict', () => {
    expect(['fallback-neutral', 'strict']).toContain(cepCoverageConfig.mode);
  });

  describe('getQuestionById', () => {
    it('returns the question when id exists', () => {
      const q = getQuestionById('pet-ativo');
      expect(q).toBeDefined();
      expect(q?.id).toBe('pet-ativo');
    });

    it('returns undefined for unknown id', () => {
      expect(getQuestionById('does-not-exist')).toBeUndefined();
    });
  });

  describe('getAnswerLabel', () => {
    it('returns the option label for choice questions', () => {
      const label = getAnswerLabel('pet-ativo', 'sim');
      expect(label.toLowerCase()).toContain('sim');
    });

    it('falls back to the answer id when option is unknown', () => {
      const label = getAnswerLabel('pet-ativo', 'unknown-id');
      expect(label).toBe('unknown-id');
    });

    it('falls back to the answer id when question id is unknown', () => {
      expect(getAnswerLabel('no-question', 'whatever')).toBe('whatever');
    });

    it('returns the raw answer id for non-choice questions (scale/text)', () => {
      const scaleQuestion = quizConfig.questions.find(
        (q) => q.type === 'scale',
      );
      if (!scaleQuestion) return;
      expect(getAnswerLabel(scaleQuestion.id, '200')).toBe('200');
    });
  });
});

describe('schemas reject malformed configs', () => {
  it('QuizConfigSchema rejects missing version', () => {
    const result = QuizConfigSchema.safeParse({
      questions: [
        {
          id: 'q1',
          type: 'single-choice',
          text: 'q?',
          options: [
            { id: 'a', label: 'A' },
            { id: 'b', label: 'B' },
          ],
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it('QuizConfigSchema rejects single-choice with <2 options', () => {
    const result = QuizConfigSchema.safeParse({
      version: 'x',
      questions: [
        {
          id: 'q1',
          type: 'single-choice',
          text: 'q?',
          options: [{ id: 'a', label: 'A' }],
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it('QuizConfigSchema rejects unknown question type', () => {
    const result = QuizConfigSchema.safeParse({
      version: 'x',
      questions: [
        { id: 'q1', type: 'free-form', text: 'q?' },
      ],
    });
    expect(result.success).toBe(false);
  });

  it('ScoringConfigSchema rejects empty rules', () => {
    const result = ScoringConfigSchema.safeParse({
      version: 'x',
      axes: ['pet_ativo'],
      thresholds: { quente: 8, morno: 5 },
      rules: [],
    });
    expect(result.success).toBe(false);
  });

  it('CepCoverageConfigSchema rejects invalid mode', () => {
    const result = CepCoverageConfigSchema.safeParse({
      version: 'x',
      mode: 'invalid',
      coveredRanges: [],
      coveredCities: [],
    });
    expect(result.success).toBe(false);
  });
});
