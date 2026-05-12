export type Tier = 'quente' | 'morno' | 'frio';

export type QuestionType =
  | 'single-choice'
  | 'multi-choice'
  | 'scale'
  | 'text-input';

export interface QuestionOption {
  id: string;
  label: string;
  emoji?: string;
}

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  text: string;
  emoji?: string;
  eliminatesOnNo?: boolean;
}

export interface SingleChoiceQuestion extends BaseQuestion {
  type: 'single-choice';
  options: QuestionOption[];
}

export interface MultiChoiceQuestion extends BaseQuestion {
  type: 'multi-choice';
  options: QuestionOption[];
  minSelect?: number;
  maxSelect?: number;
}

export interface ScaleQuestion extends BaseQuestion {
  type: 'scale';
  min: number;
  max: number;
  step: number;
  prefix?: string;
  suffix?: string;
}

export interface TextInputQuestion extends BaseQuestion {
  type: 'text-input';
  mask?: 'cep' | 'phone' | 'none';
  placeholder?: string;
  skipAllowed?: boolean;
}

export type Question =
  | SingleChoiceQuestion
  | MultiChoiceQuestion
  | ScaleQuestion
  | TextInputQuestion;

export interface QuizConfig {
  version: string;
  questions: Question[];
}

export type AnswerValue = string | number | string[];
export type Answers = Record<string, AnswerValue>;

export interface ScoringRuleBase {
  questionId: string;
  axis: 'pet_ativo' | 'gasto' | 'dor' | 'cobertura';
  notes?: string;
}

export interface WeightsRule extends ScoringRuleBase {
  type: 'weights';
  weights: Record<string, number>;
}

export interface NumericRangeRule extends ScoringRuleBase {
  type: 'numeric-range';
  ranges: Array<{ max: number; score: number }>;
}

export interface CepCoverageRule extends ScoringRuleBase {
  type: 'cep-coverage';
  coveredScore: number;
  notCoveredScore: number;
  skippedScore: number;
  coverageSource: string;
}

export type ScoringRule = WeightsRule | NumericRangeRule | CepCoverageRule;

export interface ScoringConfig {
  version: string;
  axes: Array<'pet_ativo' | 'gasto' | 'dor' | 'cobertura'>;
  thresholds: { quente: number; morno: number };
  rules: ScoringRule[];
}

export interface ScoreBreakdown {
  pet_ativo: number;
  gasto: number;
  dor: number;
  cobertura: number;
}

export interface TierResult {
  tier: Tier;
  score: number;
  breakdown: ScoreBreakdown;
  eliminated: boolean;
}

export interface CepCoverageConfig {
  version: string;
  mode: 'fallback-neutral' | 'strict';
  coveredRanges: Array<{ from: string; to: string }>;
  coveredCities: string[];
}
