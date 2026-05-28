import type { Tier } from '@/lib/quiz/types';
import type { Utms } from './utms';
import { getPlanById, TIER_TO_PLAN, type PlanId } from '@/lib/plans/catalog';

/**
 * Invisible Unicode marker that identifies this lead as coming from the quiz LP.
 * Pattern: U+2061 (FUNCTION APPLICATION) repeated as ABABA — distinct from Jofi's
 * internal `sst.jofi.pet` markers (which use U+2060/U+2063/U+2064 combinations).
 * Allows the Jofi team to programmatically detect "veio do quiz LP" in inbound
 * WhatsApp messages without polluting the visible copy.
 */
const QUIZ_INVISIBLE_MARKER = '⁡⁣⁡⁣⁡';

/**
 * Lookup tier → dados do plano (nome + label de preço).
 * REUSA o catalog.ts (TIER_TO_PLAN + getPlanById) pra evitar duplicação
 * de info de preços. Se preço mudar no catalog, mensagens atualizam auto.
 */
function planByTier(tier: Tier): { name: string; priceLabel: string } {
  const plan = getPlanById(TIER_TO_PLAN[tier]);
  if (plan) return { name: plan.name, priceLabel: plan.priceLabel };
  // Fallback defensivo (não deve acontecer, mas TS exige)
  return { name: 'Jofi', priceLabel: 'a partir de R$ 49,90/mês' };
}

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
  /** Tier do quiz (quando vem do quiz funnel). Opcional pra suportar /oferta LP. */
  tier?: Tier;
  especie?: string;
  idade?: string;
  utms?: Utms;
  /** Nome do tutor (primeiro nome usado na mensagem) */
  leadName?: string | null;
  /** Gasto mensal em R$ (number do range input do quiz) */
  gastoMensal?: number | null;
  /** ID da resposta de última visita ao vet (menos-1-mes, etc.) */
  ultimaVet?: string | null;
  /**
   * Quando lead vem da LP /oferta clicando num plano específico, esse ID é
   * passado pra mensagem mencionar o plano escolhido em vez do tier do quiz.
   * Tem precedência sobre `tier` se ambos vierem.
   */
  selectedPlanId?: PlanId | null;
  /** Origem do lead — controla tom da mensagem. Default: 'quiz' (legacy). */
  source?: 'quiz' | 'oferta_lp';
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
 *   - Gasto mensal (se disponível) — sinaliza budget pro time calibrar
 *
 * Marker invisível no início pra identificar leads do quiz LP no inbox.
 */
export function buildWhatsappMessage(input: WhatsappBuildInput): string {
  const nome = firstName(input.leadName);
  const greeting = nome ? `Oi, Jofi! Aqui é ${nome} 🐾` : 'Oi, Jofi! 🐾';
  const lines: string[] = [greeting, ''];

  // === Variante 1: Lead da LP /oferta clicou num plano específico ===
  if (input.selectedPlanId) {
    const plan = getPlanById(input.selectedPlanId);
    if (plan) {
      lines.push(
        `Vi a cobertura ${plan.name} (${plan.priceLabel}) na página`,
      );
      lines.push('e quero saber mais sobre ela.');
      lines.push('');
      lines.push('Pode me explicar como funciona? 💛');

      const visibleText = lines.join('\n');
      return `${visibleText[0]}${QUIZ_INVISIBLE_MARKER}${visibleText.slice(1)}`;
    }
  }

  // === Variante 2: Lead do quiz com tier definido (mensagem rica) ===
  if (input.tier) {
    const plan = planByTier(input.tier);
    const especie = ESPECIE_LABEL[input.especie ?? ''] ?? 'pet';
    const idade = IDADE_LABEL[input.idade ?? ''] ?? '';
    const petDescription = idade ? `${especie} ${idade}` : especie;

    lines.push(`Fiz o quiz no site sobre meu ${petDescription}.`);

    if (
      typeof input.gastoMensal === 'number' &&
      Number.isFinite(input.gastoMensal) &&
      input.gastoMensal > 0
    ) {
      lines.push(`Gasto hoje cerca de R$ ${input.gastoMensal}/mês com ele.`);
    }

    const ultimaVetLabel = input.ultimaVet
      ? ULTIMA_VET_LABEL[input.ultimaVet]
      : null;
    if (ultimaVetLabel) {
      lines.push(`Última visita ao vet: ${ultimaVetLabel}.`);
    }

    lines.push('');

    // Closing por tier — tom alinhado com a temperatura do lead.
    // Inclui descritor curto do plano pra ajudar o time a abrir conversa.
    if (input.tier === 'quente') {
      lines.push(
        `O perfil indicou a cobertura ${plan.name} (${plan.priceLabel}) — proteção completa e tradicional. Quero ativar logo, pode me ajudar? 💛`,
      );
    } else if (input.tier === 'morno') {
      lines.push(
        `O perfil indicou a cobertura ${plan.name} (${plan.priceLabel}) — cuidado preventivo. Posso entender melhor como funciona? 💛`,
      );
    } else {
      lines.push(
        `O perfil indicou a cobertura ${plan.name} (${plan.priceLabel}) — o essencial. Queria tirar algumas dúvidas, pode me ajudar? 💛`,
      );
    }

    const visibleText = lines.join('\n');
    return `${visibleText[0]}${QUIZ_INVISIBLE_MARKER}${visibleText.slice(1)}`;
  }

  // === Variante 3: Fallback genérico (sem tier, sem plano selecionado) ===
  lines.push('Vi a plataforma e quero saber mais sobre as coberturas.');
  lines.push('');
  lines.push('Pode me ajudar a escolher a ideal pro meu pet? 💛');

  const visibleText = lines.join('\n');
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

  // UTMs canônicas pro WhatsApp — preservam atribuição da campanha original
  // mas adicionam camada de medium/campaign/content pra cruzar com o funil.
  // utm_source: o real (ad/instagram/...) ou fallback 'site'
  // utm_medium: sempre 'whatsapp' nesse touchpoint
  // utm_campaign: 'quiz' (quiz funnel) ou 'oferta_lp' (LP /oferta)
  // utm_content: tier do quiz OU plano selecionado na LP
  // utm_term: contexto fino (quiz_completo, plan_card, etc.)
  params.set('utm_source', input.utms?.utm_source ?? 'site');
  params.set('utm_medium', 'whatsapp');

  if (input.source === 'oferta_lp') {
    params.set('utm_campaign', 'oferta_lp');
    if (input.selectedPlanId) {
      params.set('utm_content', input.selectedPlanId);
      params.set('utm_term', 'plan_card');
    }
  } else {
    params.set('utm_campaign', 'quiz');
    if (input.tier) {
      params.set('utm_content', input.tier);
      params.set('utm_term', 'quiz_completo');
    }
  }

  return `https://api.whatsapp.com/send/?${params.toString()}`;
}

export const _internals = { QUIZ_INVISIBLE_MARKER, planByTier };
