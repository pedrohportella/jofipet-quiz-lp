/**
 * Eventos específicos do funil quiz — complementam src/lib/tracking/events.ts
 * com sinais novos pra Sprint 2 (dossiê WhatsApp pré-preenchido).
 *
 * Eventos canônicos (quiz_start, quiz_step_view, quiz_answer, quiz_complete)
 * ficam em events.ts. Aqui mora o que é novo do Sprint 2.
 */
import { fbqTrack } from './meta-pixel';
import { gaEvent } from './ga4';
import type { Tier } from '@/lib/quiz/types';

interface QuizDossierPayload {
  tier: Tier;
  especie?: string | null;
  idade?: string | null;
  cidade?: string | null;
  preocupacao?: string | null;
  gastoMensal?: number | null;
  planoAtual?: string | null;
  ultimaVet?: string | null;
}

/**
 * Disparado quando o lead clica no CTA WhatsApp da tela de resultado
 * COM dossiê pré-preenchido (UTMs + respostas do quiz).
 *
 * Diferencia de trackWhatsappClick (events.ts) porque carrega o dossiê
 * completo — útil pra cruzar com lead chegando no inbox da Jofi e medir
 * qualidade do quiz pra qualificação.
 */
export function trackWhatsAppClickFromQuiz(payload: QuizDossierPayload): void {
  fbqTrack('Lead', {
    value: 0,
    currency: 'BRL',
    content_name: `${payload.tier}_wa_from_quiz`,
    content_category: 'wa_dossier',
  });
  gaEvent('wa_click_from_quiz', {
    tier: payload.tier,
    especie: payload.especie ?? '',
    idade: payload.idade ?? '',
    cidade: payload.cidade ?? '',
    preocupacao: payload.preocupacao ?? '',
    gasto_mensal: payload.gastoMensal ?? 0,
    plano_atual: payload.planoAtual ?? '',
    ultima_vet: payload.ultimaVet ?? '',
  });
}
