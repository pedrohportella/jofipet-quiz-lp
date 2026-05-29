/**
 * Mapper StoredLead → payload de POST /api/v1/deals do RD CRM.
 *
 * Decisões (do roadmap):
 *   - Nome do deal: `{nome} (Quiz Jofi)` — sem tier embutido
 *   - Sem custom_fields no MVP (Pedro pode adicionar depois sem mexer no code,
 *     basta criar cf no painel + setar RD_CRM_CUSTOM_FIELDS_MAP)
 *   - Owner via distribuição automática do funil (defaultUserId só é usado
 *     se a distribuição falhar — passamos como fallback opcional)
 *   - prediction_value vem do TIER_LEAD_VALUE pra dar visibilidade de pipeline
 */

import type { StoredLead } from '@/lib/leads/store';
import { normalizeWhatsappToE164 } from '@/lib/validation/schemas';
import type { Tier } from '@/lib/quiz/types';
import type { RdCrmConfig } from './config';

// Valor estimado por tier (em BRL) — populariza o "valor de pipeline" no RD CRM
// Usa os mesmos valores do Pixel/CAPI Lead pra consistência cross-tracking.
const TIER_PREDICTION_VALUE: Record<Tier, number> = {
  quente: 89.9,
  morno: 49.9,
  frio: 0,
};

export interface RdCrmDealPayload {
  deal: {
    name: string;
    deal_stage_id: string;
    user_id?: string;
    prediction_date?: string;
    rating?: number;
    deal_custom_fields?: Array<{ custom_field_id: string; value: string | string[] }>;
  };
  contacts: Array<{
    name: string;
    emails?: Array<{ email: string }>;
    phones?: Array<{ phone: string; type: 'cellphone' | 'work' | 'home' }>;
  }>;
}

const TIER_RATING: Record<Tier, number> = {
  quente: 3,
  morno: 2,
  frio: 1,
};

/**
 * Stripe '+' do E.164 (RD CRM aceita só dígitos no campo phone).
 */
function phoneDigits(local: string): string {
  return normalizeWhatsappToE164(local).replace(/\D/g, '');
}

/**
 * Data ISO YYYY-MM-DD daqui 7 dias — previsão default de fechamento.
 * Útil pra relatórios "negociações com previsão pra próxima semana".
 *
 * Recebe `now` (timestamp em ms) pra ser testável.
 */
function defaultPredictionDate(nowMs: number): string {
  const d = new Date(nowMs + 7 * 24 * 60 * 60 * 1000);
  const iso = d.toISOString();
  return iso.slice(0, 10);
}

export function buildDealPayload(
  lead: StoredLead,
  cfg: RdCrmConfig,
): RdCrmDealPayload {
  const phone = phoneDigits(lead.payload.whatsapp);
  const emails = lead.payload.email
    ? [{ email: lead.payload.email }]
    : undefined;

  const deal: RdCrmDealPayload['deal'] = {
    name: `${lead.payload.name} (Quiz Jofi)`,
    deal_stage_id: cfg.dealStageId,
    rating: TIER_RATING[lead.tier],
    prediction_date: defaultPredictionDate(lead.capturedAt),
  };

  if (cfg.defaultUserId) {
    deal.user_id = cfg.defaultUserId;
  }

  // Custom fields ficam fora do MVP — quando Pedro quiser adicionar,
  // basta criar custom_fields no RD CRM + mapear aqui:
  //   deal.deal_custom_fields = [
  //     { custom_field_id: 'XYZ', value: lead.tier },
  //     { custom_field_id: 'ABC', value: String(lead.score) },
  //   ];

  return {
    deal,
    contacts: [
      {
        name: lead.payload.name,
        ...(emails ? { emails } : {}),
        phones: [{ phone, type: 'cellphone' }],
      },
    ],
  };
}

/**
 * Marker de "valor estimado" pro RD usar em projeções (não é campo da API
 * de criar deal, mas vale documentar caso queira preencher via PATCH depois).
 */
export function getPredictionValue(tier: Tier): number {
  return TIER_PREDICTION_VALUE[tier];
}
