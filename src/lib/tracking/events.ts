import { fbqTrack } from './meta-pixel';
import { gaEvent } from './ga4';
import type { Tier } from '@/lib/quiz/types';
import type { Utms } from './utms';

/**
 * Canonical event taxonomy. All tracking goes through these helpers — never
 * call fbq/gtag directly from components.
 */

export function trackPageView(): void {
  // PageView é disparado automaticamente pelo script inline do pixel no init.
  // Este wrapper existe para navegação client-side (SPA transitions).
  fbqTrack('PageView');
  gaEvent('page_view');
}

export function trackQuizStart(params: {
  variant?: string;
  utms?: Utms;
}): void {
  gaEvent('quiz_start', {
    variant: params.variant ?? 'default',
    utm_source: params.utms?.utm_source ?? '',
  });
}

export function trackQuizStep(step: number, questionId: string): void {
  fbqTrack('ViewContent', {
    content_name: `quiz_question_${step}`,
    content_category: 'quiz_step',
  });
  gaEvent('quiz_step_view', { question_id: questionId, step_number: step });
}

export function trackQuizAnswer(params: {
  questionId: string;
  answerValue: string | number | string[];
  stepNumber: number;
  variant?: string;
}): void {
  gaEvent('quiz_answer', {
    question_id: params.questionId,
    answer_value: Array.isArray(params.answerValue)
      ? params.answerValue.join(',')
      : String(params.answerValue),
    step_number: params.stepNumber,
    variant: params.variant ?? 'default',
  });
}

export function trackQuizAbandon(params: {
  lastQuestionId: string;
  stepNumber: number;
  timeSpentSec: number;
}): void {
  gaEvent('quiz_abandon', {
    last_question_id: params.lastQuestionId,
    step_number: params.stepNumber,
    time_spent_sec: params.timeSpentSec,
  });
}

export function trackQuizComplete(params: {
  tier: Tier;
  score: number;
  durationSec: number;
}): void {
  gaEvent('quiz_complete', {
    tier: params.tier,
    score: params.score,
    duration_sec: params.durationSec,
  });
}

export function trackLead(params: { tier: Tier; hasEmail: boolean }): void {
  fbqTrack('Lead', {
    value: 0,
    currency: 'BRL',
    content_name: params.tier,
  });
  fbqTrack('CompleteRegistration', {
    registration_method: 'quiz',
  });
  gaEvent('generate_lead', {
    tier: params.tier,
    has_email: params.hasEmail,
  });
}

export function trackInitiateCheckout(params: {
  tier: Tier;
  value?: number;
}): void {
  fbqTrack('InitiateCheckout', {
    content_name: params.tier,
    value: params.value ?? 0,
    currency: 'BRL',
  });
}

export function trackWhatsappClick(params: { tier: Tier; utms?: Utms }): void {
  fbqTrack('Lead', { value: 0, currency: 'BRL', content_name: `${params.tier}_wa` });
  gaEvent('whatsapp_click', {
    tier: params.tier,
    utm_source: params.utms?.utm_source ?? '',
  });
}

export function trackSereninhoClick(params: { utms?: Utms }): void {
  gaEvent('sereninho_click', {
    utm_source: params.utms?.utm_source ?? '',
  });
}

export function trackArticleClick(params: {
  articleId: string;
  utmContent?: string;
}): void {
  gaEvent('article_click', {
    article_id: params.articleId,
    utm_content: params.utmContent ?? '',
  });
}
