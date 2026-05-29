/**
 * Helper de formatação de respostas do quiz pra exibição humana.
 *
 * Os IDs das perguntas e options vivem em `config/quiz.json`. Esse módulo
 * faz lookup pra transformar:
 *   answers["ultima-vet"] = "menos-1-mes"
 * em algo legível:
 *   { questionText: "Há quanto tempo seu pet não vai ao vet?", emoji: "🩺",
 *     valueLabel: "Há menos de 1 mês" }
 *
 * Usado no /admin/leads/[leadId] e no dashboard de analytics.
 */

import quizConfig from '../../../config/quiz.json';

interface QuizOption {
  id: string;
  label: string;
  emoji?: string;
}

interface QuizQuestionRaw {
  id: string;
  type: string;
  text: string;
  emoji?: string;
  options?: QuizOption[];
  prefix?: string;
  suffix?: string;
}

const QUESTIONS: QuizQuestionRaw[] = (quizConfig.questions ?? []) as QuizQuestionRaw[];
const QUESTION_BY_ID = new Map<string, QuizQuestionRaw>(
  QUESTIONS.map((q) => [q.id, q]),
);

export interface FormattedAnswer {
  questionId: string;
  questionText: string;
  questionEmoji: string;
  valueLabel: string;
  valueRaw: string | number | string[];
  isMulti: boolean;
  /** Posição no quiz (1-indexed) — útil pra ordenar */
  step: number;
}

const QUESTION_STEP: Record<string, number> = Object.fromEntries(
  QUESTIONS.map((q, i) => [q.id, i + 1]),
);

/**
 * Formata uma resposta única.
 * Aceita string, number ou string[] (multi-choice).
 */
export function formatQuizAnswer(
  questionId: string,
  value: string | number | string[],
): FormattedAnswer {
  const question = QUESTION_BY_ID.get(questionId);
  const step = QUESTION_STEP[questionId] ?? 999;

  if (!question) {
    // Pergunta desconhecida — provavelmente quiz mudou e o lead é antigo
    return {
      questionId,
      questionText: questionId,
      questionEmoji: '❓',
      valueLabel: String(value),
      valueRaw: value,
      isMulti: Array.isArray(value),
      step,
    };
  }

  const base = {
    questionId,
    questionText: question.text,
    questionEmoji: question.emoji ?? '🔸',
    valueRaw: value,
    step,
  };

  // Multi-choice
  if (Array.isArray(value)) {
    const labels = value.map((v) => {
      const opt = question.options?.find((o) => o.id === v);
      return opt ? `${opt.emoji ? opt.emoji + ' ' : ''}${opt.label}` : v;
    });
    return {
      ...base,
      valueLabel: labels.join(', '),
      isMulti: true,
    };
  }

  // Single-choice — lookup pela id
  if (question.type === 'single-choice' && question.options) {
    const opt = question.options.find((o) => o.id === String(value));
    if (opt) {
      return {
        ...base,
        valueLabel: `${opt.emoji ? opt.emoji + ' ' : ''}${opt.label}`,
        isMulti: false,
      };
    }
  }

  // Scale (numérico, ex: gasto_mensal) — formata com prefix/suffix
  if (question.type === 'scale' && typeof value === 'number') {
    return {
      ...base,
      valueLabel: `${question.prefix ?? ''}${value}${question.suffix ?? ''}`,
      isMulti: false,
    };
  }

  // Text-input (ex: CEP) — mostra direto
  return {
    ...base,
    valueLabel: String(value),
    isMulti: false,
  };
}

/**
 * Formata o map inteiro de answers e ordena por step (ordem do quiz).
 */
export function formatAnswers(
  answers: Record<string, string | number | string[]>,
): FormattedAnswer[] {
  return Object.entries(answers)
    .map(([k, v]) => formatQuizAnswer(k, v))
    .sort((a, b) => a.step - b.step);
}

/**
 * Lista todas as perguntas conhecidas — útil pra dashboard agregar
 * mesmo perguntas que nenhum lead respondeu ainda.
 */
export function listAllQuestions(): Array<{
  id: string;
  text: string;
  emoji: string;
  type: string;
  step: number;
  options?: QuizOption[];
}> {
  return QUESTIONS.map((q, i) => ({
    id: q.id,
    text: q.text,
    emoji: q.emoji ?? '🔸',
    type: q.type,
    step: i + 1,
    options: q.options,
  }));
}
