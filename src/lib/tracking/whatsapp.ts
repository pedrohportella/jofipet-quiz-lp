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

const ULTIMA_VET_LABEL: Record<string, string> = {
  'menos-1-mes': 'menos de 1 mês',
  '1-6-meses': 'entre 1 e 6 meses',
  'mais-6-meses': 'mais de 6 meses',
  nunca: 'nunca levei',
};

export interface WhatsappBuildInput {
  tier: Tier;
  especie?: string;
  idade?: string;
  utms?: Utms;
  /** Nome do tutor (primeiro nome usado na mensagem) */
  leadName?: string | null;
  /** Gasto mensal em R$ (number do range input do quiz) */
  gastoMensal?: number | null;
  /** ID da resposta de última visita ao vet (menos-1-mes, etc.) */
  ultimaVet?: string | null;
}

/**
 * Pega o primeiro nome do lead. Fallback: vazio (a mensagem se adapta).
 * Útil pra evitar "Oi! Sou Pedro de Souza Filho Junior" (verboso demais).
 */
function firstName(name: string | null | undefined): string | null {
  if (!name) return null;
  const first = name.trim().split(/\s+/)[0];
  return first && first.length > 0 ? first : null;
}

/**
 * Constrói a mensagem rica que pré-preenche o WhatsApp do tutor pra Jofi.
 *
 * Estratégia de copy:
 *   - Quente: tom direto/urgente, foco em ativar logo
 *   - Morno: tom curioso/explorador, foco em entender melhor
 *   - Frio: tom educacional/sem pressão (pra quem clicar manualmente)
 *
 * Sempre inclui:
 *   - Nome do tutor (se disponível)
 *   - Espécie + idade do pet
 *   - Plano recomendado (com preço)
 *   - Gasto mensal (se disponível) — sinaliza budget pra Nicole calibrar
 *
 * Marker invisível no início pra identificar leads do quiz LP no inbox.
 */
export function buildWhatsappMessage(input: WhatsappBuildInput): string {
  const plan = PLAN_BY_TIER[input.tier];
  const especie = ESPECIE_LABEL[input.especie ?? ''] ?? 'pet';
  const idade = IDADE_LABEL[input.idade ?? ''] ?? '';
  const nome = firstName(input.leadName);

  const petDescription = idade ? `${especie} ${idade}` : especie;
  const greeting = nome ? `Oi, Jofi! Aqui é ${nome} 🐾` : 'Oi, Jofi! 🐾';

  const lines: string[] = [greeting, ''];

  // Pet line
  lines.push(`Fiz o quiz no site e meu ${petDescription} foi avaliado.`);

  // Gasto atual (só se foi respondido — quiz registra mesmo midpoint default)
  if (
    typeof input.gastoMensal === 'number' &&
    Number.isFinite(input.gastoMensal) &&
    input.gastoMensal > 0
  ) {
    lines.push(`Gasto hoje cerca de R$ ${input.gastoMensal}/mês com ele.`);
  }

  // Última vet (sinal extra de prontidão pra Nicole)
  const ultimaVetLabel = input.ultimaVet
    ? ULTIMA_VET_LABEL[input.ultimaVet]
    : null;
  if (ultimaVetLabel) {
    lines.push(`Última visita ao vet: ${ultimaVetLabel}.`);
  }

  lines.push('');

  // CTA por tier
  if (input.tier === 'quente') {
    lines.push(
      `O resultado indicou o Plano ${plan.name} (${plan.priceLabel}). Queria entender melhor pra ativar logo! 💛`,
    );
  } else if (input.tier === 'morno') {
    lines.push(
      `O resultado indicou o Plano ${plan.name} (${plan.priceLabel}). Posso saber mais como funciona? 💛`,
    );
  } else {
    lines.push(
      `O resultado indicou o Plano ${plan.name} (${plan.priceLabel}). Gostaria de tirar algumas dúvidas. 💛`,
    );
  }

  const visibleText = lines.join('\n');
  // Prepend invisible marker no primeiro char (sobrevive copy/paste e é invisível)
  return `${visibleText[0]}${QUIZ_INVISIBLE_MARKER}${visibleText.slice(1)}`;
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
