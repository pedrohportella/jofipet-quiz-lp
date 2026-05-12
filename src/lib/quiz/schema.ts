import { z } from 'zod';

const QuestionOptionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  emoji: z.string().optional(),
});

const BaseQuestionFields = {
  id: z.string().min(1),
  text: z.string().min(1),
  emoji: z.string().optional(),
  eliminatesOnNo: z.boolean().optional(),
} as const;

const SingleChoiceQuestionSchema = z.object({
  ...BaseQuestionFields,
  type: z.literal('single-choice'),
  options: z.array(QuestionOptionSchema).min(2),
});

const MultiChoiceQuestionSchema = z.object({
  ...BaseQuestionFields,
  type: z.literal('multi-choice'),
  options: z.array(QuestionOptionSchema).min(2),
  minSelect: z.number().int().nonnegative().optional(),
  maxSelect: z.number().int().positive().optional(),
});

const ScaleQuestionSchema = z.object({
  ...BaseQuestionFields,
  type: z.literal('scale'),
  min: z.number(),
  max: z.number(),
  step: z.number().positive(),
  prefix: z.string().optional(),
  suffix: z.string().optional(),
});

const TextInputQuestionSchema = z.object({
  ...BaseQuestionFields,
  type: z.literal('text-input'),
  mask: z.enum(['cep', 'phone', 'none']).optional(),
  placeholder: z.string().optional(),
  skipAllowed: z.boolean().optional(),
});

export const QuestionSchema = z.discriminatedUnion('type', [
  SingleChoiceQuestionSchema,
  MultiChoiceQuestionSchema,
  ScaleQuestionSchema,
  TextInputQuestionSchema,
]);

export const QuizConfigSchema = z.object({
  version: z.string().min(1),
  questions: z.array(QuestionSchema).min(1),
});

const AxisSchema = z.enum(['pet_ativo', 'gasto', 'dor', 'cobertura']);

const ScoringRuleBaseFields = {
  questionId: z.string().min(1),
  axis: AxisSchema,
  notes: z.string().optional(),
} as const;

const WeightsRuleSchema = z.object({
  ...ScoringRuleBaseFields,
  type: z.literal('weights'),
  weights: z.record(z.string(), z.number()),
});

const NumericRangeRuleSchema = z.object({
  ...ScoringRuleBaseFields,
  type: z.literal('numeric-range'),
  ranges: z
    .array(z.object({ max: z.number(), score: z.number() }))
    .min(1),
});

const CepCoverageRuleSchema = z.object({
  ...ScoringRuleBaseFields,
  type: z.literal('cep-coverage'),
  coveredScore: z.number(),
  notCoveredScore: z.number(),
  skippedScore: z.number(),
  coverageSource: z.string().min(1),
});

export const ScoringRuleSchema = z.discriminatedUnion('type', [
  WeightsRuleSchema,
  NumericRangeRuleSchema,
  CepCoverageRuleSchema,
]);

export const ScoringConfigSchema = z.object({
  version: z.string().min(1),
  axes: z.array(AxisSchema).min(1),
  thresholds: z.object({
    quente: z.number(),
    morno: z.number(),
  }),
  rules: z.array(ScoringRuleSchema).min(1),
});

export const CepCoverageConfigSchema = z.object({
  version: z.string().min(1),
  mode: z.enum(['fallback-neutral', 'strict']),
  coveredRanges: z.array(
    z.object({ from: z.string(), to: z.string() }),
  ),
  coveredCities: z.array(z.string()),
});
