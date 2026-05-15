/**
 * Tracking dedicado pra LP /oferta.
 *
 * Cada evento carrega `variant: 'oferta_lp'` pra comparação direta com o
 * quiz funnel (variant: 'quiz'). Compatível com Pixel + GA4 + futuras
 * análises no Meta Ads Manager e GA Explore.
 */
import { fbqTrack } from './meta-pixel';
import { gaEvent } from './ga4';
import type { PlanId } from '@/lib/plans/catalog';

const VARIANT = 'oferta_lp' as const;

/**
 * View da LP /oferta — equivalente ao trackQuizStart do funil quiz.
 * Dispara no mount da página.
 */
export function trackLpOfertaView(): void {
  fbqTrack('ViewContent', {
    content_name: 'lp_oferta',
    content_category: 'landing_page',
    variant: VARIANT,
  });
  gaEvent('lp_oferta_view', { variant: VARIANT });
}

/**
 * Clique em um dos 4 cards de plano (CTA "Quero esse").
 * eventID determinístico permite dedup com CAPI server-side se quisermos
 * adicionar no futuro.
 */
export function trackLpOfertaPlanClick(planId: PlanId, source: 'card' | 'comparison'): void {
  fbqTrack(
    'AddToCart',
    {
      content_ids: [planId],
      content_name: `plan_${planId}`,
      content_category: 'plan_selection',
      variant: VARIANT,
      source,
    },
  );
  gaEvent('lp_oferta_plan_click', {
    plan_id: planId,
    source,
    variant: VARIANT,
  });
}

/**
 * Clique no CTA WhatsApp principal (hero / mid / final / sticky).
 * Pixel já trata via trackWhatsappClick — aqui só GA pra variant tag.
 */
export function trackLpOfertaWhatsappClick(position: 'hero' | 'mid' | 'final' | 'sticky'): void {
  gaEvent('lp_oferta_wa_click', { position, variant: VARIANT });
}

/**
 * FAQ abriu — mede engajamento profundo (quem se preocupa em ler objeções).
 */
export function trackLpOfertaFaqOpen(questionId: string): void {
  gaEvent('lp_oferta_faq_open', {
    question_id: questionId,
    variant: VARIANT,
  });
}

/**
 * Play no vídeo institucional (quando habilitado).
 */
export function trackLpOfertaVideoPlay(): void {
  gaEvent('lp_oferta_video_play', { variant: VARIANT });
}

/**
 * Scroll depth — sinal de engajamento. Dispara em 25/50/75/100%.
 * Usar com debounce/throttle no callsite.
 */
export function trackLpOfertaScroll(percent: 25 | 50 | 75 | 100): void {
  gaEvent('lp_oferta_scroll', {
    depth: percent,
    variant: VARIANT,
  });
}
