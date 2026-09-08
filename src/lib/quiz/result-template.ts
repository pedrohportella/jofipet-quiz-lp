import type { Answers, Tier } from './types';
import { getAnswerLabel } from './loader';
import { getRecommendedPlan } from '@/lib/plans/catalog';

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

const PREOCUPACAO_LABEL: Record<string, string> = {
  saude: 'saúde e imprevistos',
  custo: 'custo das consultas',
  rotina: 'rotina de cuidado',
  'tudo-bem': 'tranquilidade',
};

export interface ResultContext {
  tier: Tier;
  leadName: string | null;
  answers: Answers;
}

export interface ResultVars {
  primeiroNome: string;
  especie: string;
  idade: string;
  preocupacao: string;
  gastoMensal: number | null;
  planoAtual: string;
  /** Nome da cobertura recomendada (sai do gasto mensal, ver catalog.ts) */
  planoNome: string;
  /** Label de preço da cobertura recomendada (ex: "R$ 79,90/mês") */
  planoPreco: string;
  /** Três primeiras coberturas do plano recomendado, pra bullet de features */
  planoBullets: string;
  /**
   * Fecho do bullet de preço. A comparação "mais barato que sua despesa" só
   * é verdade quando a mensalidade fica MESMO abaixo do gasto declarado —
   * com as faixas de 08/09/26 quem declara R$0 cai no Sereno de R$79,90, e
   * afirmar economia ali seria mentira na tela.
   */
  comparativoGasto: string;
}

export function buildResultVars(ctx: ResultContext): ResultVars {
  const firstName = (ctx.leadName ?? '').split(' ')[0]?.trim() || 'tutor';
  const especieRaw = String(ctx.answers['especie'] ?? '');
  const idadeRaw = String(ctx.answers['idade'] ?? '');
  const preocupacaoRaw = String(ctx.answers['preocupacao'] ?? '');
  const gastoRaw = ctx.answers['gasto-mensal'];
  const planoRaw = String(ctx.answers['plano-atual'] ?? '');

  const gastoMensal = typeof gastoRaw === 'number' ? gastoRaw : null;
  const plano = getRecommendedPlan(gastoMensal, ctx.tier);
  const economiza = gastoMensal !== null && plano.priceMonthly < gastoMensal;

  return {
    primeiroNome: firstName,
    especie: ESPECIE_LABEL[especieRaw] ?? 'pet',
    idade: IDADE_LABEL[idadeRaw] ?? '',
    preocupacao: PREOCUPACAO_LABEL[preocupacaoRaw] ?? '',
    gastoMensal,
    planoAtual: getAnswerLabel('plano-atual', planoRaw),
    planoNome: plano.name,
    planoPreco: plano.priceLabel,
    planoBullets: plano.bullets.slice(0, 3).join(' + '),
    comparativoGasto: economiza
      ? `— menos que os R$ ${gastoMensal} que você gasta hoje`
      : '— sem coparticipação, você paga só a mensalidade',
  };
}

export function renderTemplate(template: string, vars: ResultVars): string {
  return template
    .replace(/\{primeiroNome\}/g, vars.primeiroNome)
    .replace(/\{especie\}/g, vars.especie)
    .replace(/\{idade\}/g, vars.idade || 'do seu pet')
    .replace(/\{preocupacao\}/g, vars.preocupacao || 'o cuidado com o pet')
    .replace(
      /\{gastoMensal\}/g,
      vars.gastoMensal !== null ? `R$ ${vars.gastoMensal}` : 'esse valor',
    )
    .replace(/\{planoAtual\}/g, vars.planoAtual)
    .replace(/\{planoNome\}/g, vars.planoNome)
    .replace(/\{planoPreco\}/g, vars.planoPreco)
    .replace(/\{planoBullets\}/g, vars.planoBullets)
    .replace(/\{comparativoGasto\}/g, vars.comparativoGasto);
}

// Nome de plano NUNCA vem escrito à mão aqui — sai de {planoNome}, que o
// buildResultVars resolve pelo gasto mensal. Foi escrito à mão até 08/09/26 e
// as telas divergiram: o morno anunciava "Sereninho" e o WhatsApp, "Sereno".
const HEADLINES: Record<Tier, string> = {
  quente: 'Seu pet precisa da cobertura completa',
  morno: 'Comece com o {planoNome}',
  frio: 'Toma um café com a gente',
};

const SUBHEADLINES: Record<Tier, string> = {
  quente: '{primeiroNome}, seu {especie} {idade} se beneficia do {planoNome} Jofi — cobertura ampla pra {preocupacao}.',
  // Sem "cabe no bolso": a cobertura agora sai do gasto e pode ser o Melhor
  // Amigo de R$ 259,90 — a promessa de preço vive no bullet, que sabe comparar.
  morno: '{primeiroNome}, o {planoNome} cobre {preocupacao} com tranquilidade.',
  frio: '{primeiroNome}, montamos conteúdo pra você cuidar melhor do seu {especie} 🐾',
};

// IDADE_LABEL retorna lowercase ("filhote", "adulto", "idoso") — bullets
// que começam com {idade} viraria "adulto? Cobertura..." (visualmente ruim).
// Solução: bullets reescritos com {idade} no MEIO da frase, fluindo natural.
const BULLETS: Record<Tier, string[]> = {
  quente: [
    '{planoBullets}',
    'Cobertura imediata pro seu pet {idade}, com carências reduzidas na assinatura anual',
    'Sem coparticipação — você paga só a mensalidade',
  ],
  morno: [
    '{planoBullets}',
    '{planoPreco} {comparativoGasto}',
    'Cobertura sem coparticipação na rede Jofi',
  ],
  frio: [
    'Conteúdo sobre vacinação, alimentação e check-ups essenciais',
    'Quando quiser, conheça as coberturas a partir de R$ 49,90',
    'Sem spam — só dicas úteis pro seu {especie}',
  ],
};

export function getHeadline(tier: Tier, vars: ResultVars): string {
  return renderTemplate(HEADLINES[tier], vars);
}

export function getSubheadline(tier: Tier, vars: ResultVars): string {
  return renderTemplate(SUBHEADLINES[tier], vars);
}

export function getBullets(tier: Tier, vars: ResultVars): string[] {
  return BULLETS[tier].map((b) => renderTemplate(b, vars));
}
