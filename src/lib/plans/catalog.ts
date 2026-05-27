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
 */

export type PlanId = 'sereninho' | 'sereno' | 'parceiro' | 'melhor-amigo';

export interface Plan {
  id: PlanId;
  /** Label visível ao usuário (ex: "Plano Sereninho") */
  name: string;
  /** Subtitle curto (ex: "Essencial") */
  tagline: string;
  /** Preço mensal em BRL */
  priceMonthly: number;
  /** Formatted price label (ex: "R$ 49,90/mês") */
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
    tagline: 'A mais escolhida pra rotina diária',
    priceMonthly: 79.9,
    priceLabel: 'R$ 79,90/mês',
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
    popular: true, // ⭐ "Mais escolhido" — cobertura completa tradicional
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

/**
 * Mapping tier do quiz → plano recomendado.
 * Usado pelo result page do quiz pra recomendar o plano certo.
 */
export const TIER_TO_PLAN: Record<'quente' | 'morno' | 'frio', PlanId> = {
  quente: 'parceiro',
  morno: 'sereno',
  frio: 'sereninho',
  // Nota: Melhor Amigo NÃO é recomendado direto pelo quiz — é upsell
  // que aparece como opção pro lead na LP /oferta e na conversa com o time.
};
