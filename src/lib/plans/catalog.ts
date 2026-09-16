/**
 * Catálogo dos 4 planos Jofi Pet — fonte única de verdade.
 *
 * Dados extraídos do folder oficial Jofi (JOFI_FOLDER, conferido 2026-05-16).
 *
 * Slogan da marca: "Proteção completa que cabe no seu bolso"
 * Headline da marca: "Do check-up à emergência, tudo para o seu pet."
 *
 * Diferenciais transversais (todos os 4 planos):
 *   - SEM COPARTICIPAÇÃO
 *
 * Diferencial Parceiro + Melhor Amigo (vs Sereninho/Sereno):
 *   - SEM taxa de adesão (Sereninho e Sereno têm "taxa de adesão imediata")
 *
 * Preço por idade: a Jofi cobra por faixa etária — de 0 a 7 anos é um valor,
 * a partir dos 8 anos completos é outro (só o Sereninho não muda). Valores
 * conferidos em 16/09/2026 na API do checkout do site (`/v1/dados/faixas-etarias`
 * e `/v1/site/prestadores/{id}/planos`), iguais nos três prestadores.
 */

export type PlanId = 'sereninho' | 'sereno' | 'parceiro' | 'melhor-amigo';

export interface Plan {
  id: PlanId;
  /** Label visível ao usuário (ex: "Plano Sereninho") */
  name: string;
  /** Subtitle curto (ex: "Essencial") */
  tagline: string;
  /** Preço mensal em BRL pra pet de 0 a 7 anos (faixa base) */
  priceMonthly: number;
  /** Preço mensal em BRL pra pet com 8 anos ou mais */
  priceMonthlySenior: number;
  /**
   * Label de preço pra quando a idade do pet não é conhecida (LP /oferta).
   * "A partir de" sempre que a faixa 8+ custa mais. Com a idade em mãos,
   * usar getPlanPrice, que devolve o valor exato da faixa.
   */
  priceLabel: string;
  /** Bullets de benefícios (4-7 por plano) */
  bullets: string[];
  /**
   * Carência em dias antes da cobertura ativar.
   * null = não disponível no folder oficial (a confirmar com Jofi).
   */
  waitingDays: number | null;
  /** True se é o plano destacado como "Mais popular" */
  popular: boolean;
  /** Cor de destaque do card (paleta Jofi) */
  accentColor: 'primary' | 'accent' | 'success' | 'neutral';
  /** Emoji representativo */
  emoji: string;
  /** Persona alvo (frase de positioning do folder Jofi) */
  targetPersona: string;
  /**
   * Indica se o plano tem taxa de adesão à vista.
   * Folder Jofi: Sereninho/Sereno = `true` (taxa imediata) · Parceiro/Melhor = `false` (sem taxa).
   */
  hasOnboardingFee: boolean;
}

export const PLANS: Plan[] = [
  {
    id: 'sereninho',
    name: 'Sereninho',
    tagline: 'Pra começar com tranquilidade',
    priceMonthly: 49.9,
    priceMonthlySenior: 49.9,
    priceLabel: 'R$ 49,90/mês',
    bullets: [
      'Consultas clínicas',
      'Vacinação essencial',
      'Exames de rotina',
      'Aplicação de medicamentos',
      'Sem coparticipação',
    ],
    waitingDays: null, // A confirmar com Jofi
    popular: false,
    accentColor: 'neutral',
    emoji: '💙',
    targetPersona: 'A cobertura essencial pra quem busca economia',
    hasOnboardingFee: true,
  },
  {
    id: 'sereno',
    name: 'Sereno',
    tagline: 'Pra rotina diária com proteção',
    priceMonthly: 79.9,
    priceMonthlySenior: 109.9,
    priceLabel: 'A partir de R$ 79,90/mês',
    bullets: [
      'Consultas clínicas e de emergência',
      'Vacinação completa',
      'Exames laboratoriais',
      'Exames de imagem',
      'Sedação',
      'Sem coparticipação',
    ],
    waitingDays: null,
    popular: false,
    accentColor: 'primary',
    emoji: '🌻',
    targetPersona: 'A cobertura feita pra rotina e proteção do seu pet',
    hasOnboardingFee: true,
  },
  {
    id: 'parceiro',
    name: 'Parceiro',
    tagline: 'Pra dormir tranquilo com emergência',
    priceMonthly: 169.9,
    priceMonthlySenior: 209.9,
    priceLabel: 'A partir de R$ 169,90/mês',
    bullets: [
      'Consultas com especialistas',
      'Exames ainda mais completos',
      'Internamento',
      'Cirurgias',
      'Tomografia',
      'Anestesias',
      'Sem coparticipação · Sem taxa de adesão',
    ],
    waitingDays: null,
    popular: true, // ⭐ "Mais escolhido" — plano prioritário de conversão da Jofi (cobertura completa)
    accentColor: 'accent',
    emoji: '🔥',
    targetPersona: 'A nossa cobertura completa e tradicional',
    hasOnboardingFee: false,
  },
  {
    id: 'melhor-amigo',
    name: 'Melhor Amigo',
    tagline: 'Pra quem quer o cuidado todo',
    priceMonthly: 259.9,
    priceMonthlySenior: 309.9,
    priceLabel: 'A partir de R$ 259,90/mês',
    bullets: [
      'Consultas clínicas ilimitadas',
      'Maior quantidade de exames',
      'Transfusão sanguínea',
      'Exames de imagem especiais',
      'Ressonância Magnética',
      'Incineração',
      'Sem coparticipação · Sem taxa de adesão',
    ],
    waitingDays: null,
    popular: false,
    accentColor: 'success',
    emoji: '👑',
    targetPersona: 'A cobertura mais que completa pro seu melhor amigo',
    hasOnboardingFee: false,
  },
];

/**
 * Lookup helpers — usar sempre por id pra evitar string magic.
 */
export function getPlanById(id: PlanId): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}

export function getPlanByName(name: string): Plan | undefined {
  const lower = name.trim().toLowerCase();
  return PLANS.find((p) => p.name.toLowerCase() === lower);
}

export type PriceBand = 'base' | 'senior';

/**
 * Resposta `idade` do quiz → faixa de preço da Jofi.
 *
 * Filhote e adulto (1 a 7 anos) pagam a faixa base; idoso (8 anos ou mais),
 * a faixa sênior. Até 16/09/2026 o quiz chamava de idoso o pet com 7+ e
 * mostrava um preço só por cobertura. Sem resposta reconhecida → null.
 */
export function getPriceBand(idade: unknown): PriceBand | null {
  if (idade === 'idoso') return 'senior';
  if (idade === 'filhote' || idade === 'adulto') return 'base';
  return null;
}

function formatMonthlyPrice(value: number): string {
  return `R$ ${value.toFixed(2).replace('.', ',')}/mês`;
}

export interface PlanPrice {
  /** Mensalidade em BRL (faixa base quando a idade é desconhecida) */
  value: number;
  /** Valor exato da faixa quando a idade é conhecida; senão, o priceLabel */
  label: string;
}

/**
 * Mensalidade de uma cobertura na faixa etária do pet.
 * Fonte única pra tela de resultado, mensagem de WhatsApp e value de
 * tracking — quem mostra preço de lead do quiz chama daqui.
 */
export function getPlanPrice(plan: Plan, idade: unknown): PlanPrice {
  const band = getPriceBand(idade);
  if (band === null) return { value: plan.priceMonthly, label: plan.priceLabel };
  const value = band === 'senior' ? plan.priceMonthlySenior : plan.priceMonthly;
  return { value, label: formatMonthlyPrice(value) };
}

export type QuizTier = 'quente' | 'morno' | 'frio';

/**
 * Mapping tier do quiz → plano recomendado.
 *
 * FALLBACK desde 08/09/2026: quem manda na cobertura é o gasto mensal
 * declarado (ver SPEND_TO_PLAN / getRecommendedPlan). Esse mapa só entra
 * quando não há gasto na sessão — lead antigo, sessão parcial, link direto
 * pro /resultado.
 */
export const TIER_TO_PLAN: Record<QuizTier, PlanId> = {
  quente: 'parceiro',
  morno: 'sereno',
  frio: 'sereninho',
};

/**
 * Faixas do gasto mensal declarado no quiz → cobertura recomendada.
 *
 * Decidido com o Pedro em 08/09/2026: o gasto escolhe a COBERTURA, o tier
 * segue mandando na TEMPERATURA da página (urgência, CTA, copy). Antes disso
 * o plano saía só do tier, e as telas discordavam entre si — a tela morna
 * dizia "Sereninho" enquanto a mensagem de WhatsApp dizia "Sereno".
 *
 * Consequência assumida: o Sereninho sai da recomendação do quiz (quem declara
 * R$0 já cai no Sereno) e o Melhor Amigo passa a ser recomendável, coisa que
 * antes era tratada como upsell só da LP /oferta.
 *
 * Faixas avaliadas em ordem, primeira que couber vence.
 */
export const SPEND_TO_PLAN: ReadonlyArray<{ maxSpend: number; planId: PlanId }> = [
  { maxSpend: 100, planId: 'sereno' },
  { maxSpend: 200, planId: 'parceiro' },
  { maxSpend: Number.POSITIVE_INFINITY, planId: 'melhor-amigo' },
];

/**
 * Cobertura recomendada pra um lead do quiz.
 * Fonte única — result page, preview da captura e mensagem de WhatsApp
 * chamam daqui pra não voltarem a divergir.
 */
export function getRecommendedPlan(
  gastoMensal: number | null | undefined,
  tier: QuizTier,
): Plan {
  if (typeof gastoMensal === 'number' && Number.isFinite(gastoMensal)) {
    const faixa = SPEND_TO_PLAN.find((f) => gastoMensal <= f.maxSpend);
    const plan = faixa && getPlanById(faixa.planId);
    if (plan) return plan;
  }
  const fallback = getPlanById(TIER_TO_PLAN[tier]);
  if (fallback) return fallback;
  // Inalcançável (TIER_TO_PLAN só aponta pra ids do catálogo), mas o TS exige
  // e um catálogo vazio nunca deve derrubar a tela de resultado.
  return PLANS[0] as Plan;
}
