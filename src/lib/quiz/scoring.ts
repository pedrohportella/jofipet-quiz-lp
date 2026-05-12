import type {
  Answers,
  AnswerValue,
  CepCoverageConfig,
  ScoreBreakdown,
  ScoringConfig,
  TierResult,
} from './types';
import { cepCoverageConfig as defaultCepCoverage } from './loader';

const ELIMINATION_SENTINEL = -999;

function initBreakdown(): ScoreBreakdown {
  return { pet_ativo: 0, gasto: 0, dor: 0, cobertura: 0 };
}

function toNumber(value: AnswerValue | undefined): number | null {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function asString(value: AnswerValue | undefined): string | null {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return null;
}

function scoreNumericRange(
  ranges: Array<{ max: number; score: number }>,
  value: number,
): number {
  const sorted = [...ranges].sort((a, b) => a.max - b.max);
  for (const range of sorted) {
    if (value <= range.max) return range.score;
  }
  const last = sorted[sorted.length - 1];
  return last?.score ?? 0;
}

function isCepCovered(
  cep: string,
  coverage: CepCoverageConfig,
): boolean | null {
  if (coverage.mode === 'fallback-neutral') return null;
  const digits = cep.replace(/\D/g, '');
  if (digits.length !== 8) return null;
  const asNumber = Number(digits);
  for (const range of coverage.coveredRanges) {
    const from = Number(range.from.replace(/\D/g, ''));
    const to = Number(range.to.replace(/\D/g, ''));
    if (asNumber >= from && asNumber <= to) return true;
  }
  return false;
}

/**
 * Pure function: classifies a set of answers into a tier based on scoring config.
 * No I/O, no randomness. Deterministic: same input → same output.
 */
export function calculateTier(
  answers: Answers,
  scoring: ScoringConfig,
  cepCoverage: CepCoverageConfig = defaultCepCoverage,
): TierResult {
  const breakdown = initBreakdown();
  let eliminated = false;

  for (const rule of scoring.rules) {
    const rawAnswer = answers[rule.questionId];

    if (rule.type === 'weights') {
      const key = asString(rawAnswer);
      if (key === null) continue;
      const score = rule.weights[key] ?? 0;
      if (score === ELIMINATION_SENTINEL) {
        eliminated = true;
        continue;
      }
      breakdown[rule.axis] += score;
      continue;
    }

    if (rule.type === 'numeric-range') {
      const numeric = toNumber(rawAnswer);
      if (numeric === null) continue;
      breakdown[rule.axis] += scoreNumericRange(rule.ranges, numeric);
      continue;
    }

    if (rule.type === 'cep-coverage') {
      const cep = asString(rawAnswer);
      if (cep === null || cep.trim() === '') {
        breakdown[rule.axis] += rule.skippedScore;
        continue;
      }
      const covered = isCepCovered(cep, cepCoverage);
      if (covered === null) {
        // fallback-neutral: use skipped score as neutral middle ground
        breakdown[rule.axis] += rule.skippedScore;
      } else if (covered) {
        breakdown[rule.axis] += rule.coveredScore;
      } else {
        breakdown[rule.axis] += rule.notCoveredScore;
      }
      continue;
    }
  }

  const total =
    breakdown.pet_ativo +
    breakdown.gasto +
    breakdown.dor +
    breakdown.cobertura;

  let tier: TierResult['tier'];
  if (eliminated) {
    tier = 'frio';
  } else if (total >= scoring.thresholds.quente) {
    tier = 'quente';
  } else if (total >= scoring.thresholds.morno) {
    tier = 'morno';
  } else {
    tier = 'frio';
  }

  return { tier, score: total, breakdown, eliminated };
}
