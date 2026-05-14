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

export function trackLead(params: {
  tier: Tier;
  hasEmail: boolean;
  /**
   * Event ID compartilhado com CAPI server-side. Quando passado, Meta deduplica
   * o evento entre Pixel (browser) e Conversions API (server) — sem isso,
   * Meta conta como 2 eventos separados.
   */
  eventID?: string;
}): void {
  const options = params.eventID ? { eventID: params.eventID } : undefined;
  fbqTrack(
    'Lead',
    { value: 0, currency: 'BRL', content_name: params.tier },
    options,
  );
  // CompleteRegistration usa derivado do eventID pra também deduplicar com server
  // (se quisermos disparar CR via CAPI no futuro)
  const crOptions = params.eventID
    ? { eventID: `${params.eventID}_cr` }
    : undefined;
  fbqTrack(
    'CompleteRegistration',
    { registration_method: 'quiz' },
    crOptions,
  );
  gaEvent('generate_lead', {
    tier: params.tier,
    has_email: params.hasEmail,
  });
}

/**
 * Dispara InitiateCheckout em ambos os lados:
 *   - Pixel client (browser) — `fbq('track', ...)` com eventID
 *   - CAPI server (POST /api/tracking/checkout) com mesmo eventID
 *
 * Meta dedup automático faz ambos contarem como 1 evento, mas garante delivery
 * mesmo com adblock/iOS ATT (server-side sempre chega).
 *
 * eventID determinístico: `${leadId}_ic_${context}` → mesmo lead/context produz
 * mesmo event_id (idempotente). Se usuário recarrega a página, dedup engole.
 *
 * `context` ajuda a separar onde o evento foi disparado:
 *   - 'view' (default): mount do ResultHot/Warm/Cold
 *   - 'sereninho_click': clique no CTA Sereninho
 *   - 'wa_click': clique no CTA WhatsApp
 */
export function trackInitiateCheckout(params: {
  tier: Tier;
  value?: number;
  leadId?: string;
  context?: 'view' | 'sereninho_click' | 'wa_click';
}): void {
  const value = params.value ?? 0;
  const context = params.context ?? 'view';
  const eventID = params.leadId
    ? `${params.leadId}_ic_${context}`
    : undefined;

  // 1) Pixel client (browser) — pode falhar por adblock/iOS, OK
  fbqTrack(
    'InitiateCheckout',
    {
      content_name: params.tier,
      value,
      currency: 'BRL',
    },
    eventID ? { eventID } : undefined,
  );

  // 2) CAPI server (fire-and-forget, keepalive sobrevive a navegação)
  // Só dispara se temos leadId — anonymous server-side é ruído sem benefício.
  if (typeof window !== 'undefined' && params.leadId && eventID) {
    fetch('/api/tracking/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tier: params.tier,
        value,
        eventId: eventID,
        leadId: params.leadId,
        context,
        sourceUrl: window.location.href,
      }),
      // keepalive: garante que o request termine mesmo se o usuário navegar
      // imediatamente após o clique (ex: clicar Sereninho que abre nova aba)
      keepalive: true,
    }).catch(() => {
      // Silent fail — tracking nunca quebra UX
    });
  }
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
