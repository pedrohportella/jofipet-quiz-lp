import type { LeadPayload } from '@/lib/validation/schemas';
import { normalizeWhatsappToE164 } from '@/lib/validation/schemas';
import type { RdConversionPayload } from './client';

const FIELD_PREFIX = 'cf_';

/**
 * Identificadores de campo personalizado do RD — CONFERIDOS NO PAINEL EM 13/08/2026.
 *
 * ⚠️ NÃO inventar slug aqui. O RD cunha o identificador a partir do LABEL visível
 * no momento em que o campo é criado, e não do nome que a gente gostaria de usar.
 * Ex.: o label "Pet — Faixa etária" virou `cf_pet_faixa_etaria`, não `cf_pet_idade`.
 *
 * Campo enviado com slug inexistente é DESCARTADO EM SILÊNCIO pelo RD: a conversão
 * é aceita, o contato entra, e o dado some. Foi exatamente esse o bug corrigido em
 * 13/08/2026 — 7 dos 8 campos estavam com slug divergente desde o go-live.
 *
 * Antes de alterar qualquer valor abaixo, confira em:
 * Painel RD → Configurações → Campos personalizados de contato
 */
const ANSWER_FIELD_MAP: Record<string, string> = {
  especie: 'cf_pet_especie',
  idade: 'cf_pet_faixa_etaria',
  'ultima-vet': 'cf_pet_ultima_ida_ao_vet',
  'gasto-mensal': 'cf_pet_gasto_mensal_r',
  'plano-atual': 'cf_pet_plano_atual',
  cep: 'cf_endereco_cep',
};

function buildEmailPlaceholder(name: string, whatsapp: string): string {
  const safeWhats = whatsapp.replace(/\D/g, '');
  const slug = name.toLowerCase().normalize('NFD').replace(/[^\w]/g, '').slice(0, 24) || 'lead';
  return `${slug}-${safeWhats}@no-email.jofipet.local`;
}

function flattenAnswers(answers: LeadPayload['answers']): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(answers)) {
    const mappedKey = ANSWER_FIELD_MAP[key] ?? `${FIELD_PREFIX}${key}`;
    if (Array.isArray(value)) {
      out[mappedKey] = value.join(',');
    } else {
      out[mappedKey] = value;
    }
  }
  return out;
}

export function buildRdConversionPayload(lead: LeadPayload): RdConversionPayload {
  const email = lead.email && lead.email.length > 0
    ? lead.email
    : buildEmailPlaceholder(lead.name, lead.whatsapp);

  const customFields = {
    ...flattenAnswers(lead.answers),
    // Conferidos no painel em 13/08/2026 — ver nota em ANSWER_FIELD_MAP.
    cf_quiz_tier_do_lead: lead.tier,
    cf_quiz_score_numerico: lead.score,
    // ⚠️ Os 4 breakdowns abaixo NÃO existem como campo no RD (conferido 13/08/2026).
    // Seguem sendo enviados de propósito: são descartados sem erro e voltam a
    // funcionar sozinhos no dia em que os campos forem criados no painel.
    // Nenhuma lista ou workflow depende deles hoje.
    cf_quiz_breakdown_pet_ativo: lead.breakdown.pet_ativo,
    cf_quiz_breakdown_gasto: lead.breakdown.gasto,
    cf_quiz_breakdown_dor: lead.breakdown.dor,
    cf_quiz_breakdown_cobertura: lead.breakdown.cobertura,
  };

  const utmFields = lead.utms
    ? Object.fromEntries(
        Object.entries(lead.utms)
          .filter(([, v]) => typeof v === 'string' && v.length > 0)
          .map(([k, v]) => [`cf_${k}`, v as string]),
      )
    : {};

  return {
    event_type: 'CONVERSION',
    event_family: 'CDP',
    payload: {
      conversion_identifier: `jofipet-quiz-${lead.tier}`,
      email,
      name: lead.name,
      mobile_phone: normalizeWhatsappToE164(lead.whatsapp),
      tags: [`lead-${lead.tier}`, 'quiz-jofipet'],
      ...customFields,
      ...utmFields,
    },
  };
}
