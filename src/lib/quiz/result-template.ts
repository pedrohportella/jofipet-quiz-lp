import type { Answers, Tier } from './types';
import { getAnswerLabel } from './loader';

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
}

export function buildResultVars(ctx: ResultContext): ResultVars {
  const firstName = (ctx.leadName ?? '').split(' ')[0]?.trim() || 'tutor';
  const especieRaw = String(ctx.answers['especie'] ?? '');
  const idadeRaw = String(ctx.answers['idade'] ?? '');
  const preocupacaoRaw = String(ctx.answers['preocupacao'] ?? '');
  const gastoRaw = ctx.answers['gasto-mensal'];
  const planoRaw = String(ctx.answers['plano-atual'] ?? '');

  return {
    primeiroNome: firstName,
    especie: ESPECIE_LABEL[especieRaw] ?? 'pet',
    idade: IDADE_LABEL[idadeRaw] ?? '',
    preocupacao: PREOCUPACAO_LABEL[preocupacaoRaw] ?? '',
    gastoMensal: typeof gastoRaw === 'number' ? gastoRaw : null,
    planoAtual: getAnswerLabel('plano-atual', planoRaw),
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
    .replace(/\{planoAtual\}/g, vars.planoAtual);
}

const HEADLINES: Record<Tier, string> = {
  quente: 'Seu pet precisa da cobertura completa',
  morno: 'Comece com o Sereninho',
  frio: 'Toma um café com a gente',
};

const SUBHEADLINES: Record<Tier, string> = {
  quente: '{primeiroNome}, seu {especie} {idade} se beneficia do Parceiro Jofi — cobertura ampla pra {preocupacao}.',
  morno: '{primeiroNome}, o Sereno cobre {preocupacao} com tranquilidade e cabe no bolso.',
  frio: '{primeiroNome}, montamos conteúdo pra você cuidar melhor do seu {especie} 🐾',
};

// IDADE_LABEL retorna lowercase ("filhote", "adulto", "idoso") — bullets
// que começam com {idade} viraria "adulto? Cobertura..." (visualmente ruim).
// Solução: bullets reescritos com {idade} no MEIO da frase, fluindo natural.
const BULLETS: Record<Tier, string[]> = {
  quente: [
    'Internação 24h + cirurgias + especialistas inclusos',
    'Cobertura imediata pro seu pet {idade}, com carências reduzidas na assinatura anual',
    'Sem coparticipação — você paga só a mensalidade',
  ],
  morno: [
    'Vacinação completa + consultas 24h + exames laboratoriais',
    'A partir de R$ 79,90/mês — mais barato que sua despesa de {gastoMensal}',
    'Cobertura sem coparticipação na rede Jofi',
  ],
  frio: [
    'Conteúdo sobre vacinação, alimentação e check-ups essenciais',
    'Quando quiser, conheça as coberturas a partir de R$ 49,90',
    'Sem spam — só dicas úteis pro seu {especie}',
  ],
};

export function getHeadline(tier: Tier): string {
  return HEADLINES[tier];
}

export function getSubheadline(tier: Tier, vars: ResultVars): string {
  return renderTemplate(SUBHEADLINES[tier], vars);
}

export function getBullets(tier: Tier, vars: ResultVars): string[] {
  return BULLETS[tier].map((b) => renderTemplate(b, vars));
}
