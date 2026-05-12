import type { Tier } from '@/lib/quiz/types';
import type { Utms } from './utms';

/**
 * Invisible Unicode marker that identifies this lead as coming from the quiz LP.
 * Pattern: U+2061 (FUNCTION APPLICATION) repeated as ABABA — distinct from Jofi's
 * internal `sst.jofi.pet` markers (which use U+2060/U+2063/U+2064 combinations).
 * Allows the Jofi team to programmatically detect "veio do quiz LP" in inbound
 * WhatsApp messages without polluting the visible copy.
 */
const QUIZ_INVISIBLE_MARKER = '⁡⁣⁡⁣⁡';

const PLAN_BY_TIER: Record<Tier, { name: string; priceLabel: string }> = {
  quente: { name: 'Parceiro', priceLabel: 'a partir de R$ 169,90' },
  morno: { name: 'Sereno', priceLabel: 'a partir de R$ 79,90' },
  frio: { name: 'Sereninho', priceLabel: 'a partir de R$ 49,90' },
};

const ESPECIE_LABEL: Record<string, string> = {
  cao: 'cãozinho',
  gato: 'gatinho',
  outro: 'pet',
};

const IDADE_LABEL: Record<string, string> = {
  filhote: 'filhote',
  adulto: 'adulto',
  idoso: 'idoso',
};

export interface WhatsappBuildInput {
  tier: Tier;
  especie?: string;
  idade?: string;
  utms?: Utms;
}

export function buildWhatsappMessage(input: WhatsappBuildInput): string {
  const plan = PLAN_BY_TIER[input.tier];
  const especie = ESPECIE_LABEL[input.especie ?? ''] ?? 'pet';
  const idade = IDADE_LABEL[input.idade ?? ''] ?? '';

  const petDescription = idade ? `${especie} ${idade}` : especie;
  const visibleText = `Oi, Jofi! 🐾 Fiz o quiz no site e o resultado indicou o ${plan.name} (${plan.priceLabel}) pro meu ${petDescription}. Queria entender melhor pra ativar logo!`;

  return `O${QUIZ_INVISIBLE_MARKER}${visibleText.slice(1)}`;
}

export function buildWhatsappUrl(
  phoneNumber: string,
  input: WhatsappBuildInput,
): string {
  const message = buildWhatsappMessage(input);
  const params = new URLSearchParams({
    phone: phoneNumber,
    text: message,
  });
  if (input.utms?.utm_source) {
    params.set('utm_source', input.utms.utm_source);
  }
  return `https://api.whatsapp.com/send/?${params.toString()}`;
}

export const _internals = { QUIZ_INVISIBLE_MARKER, PLAN_BY_TIER };
