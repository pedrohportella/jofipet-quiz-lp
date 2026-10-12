import type { LeadPayload } from '@/lib/validation/schemas';
import { normalizeWhatsappToE164 } from '@/lib/validation/schemas';
import type { RdConversionPayload } from './client';

const FIELD_PREFIX = 'cf_';

const ANSWER_FIELD_MAP: Record<string, string> = {
  especie: 'cf_pet_especie',
  idade: 'cf_pet_idade',
  'ultima-vet': 'cf_pet_ultima_vet',
  'gasto-mensal': 'cf_gasto_mensal',
  'plano-atual': 'cf_plano_atual',
  cep: 'cf_cep',
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
    cf_quiz_tier: lead.tier,
    cf_quiz_score: lead.score,
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
