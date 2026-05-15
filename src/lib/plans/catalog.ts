/**
 * Catálogo dos 4 planos Jofi Pet — fonte única de verdade.
 *
 * Usado por:
 *   - LP /oferta (tabela comparativa)
 *   - WhatsApp messages (mensagem rica com plano selecionado)
 *   - Result pages (recomendação por tier)
 *
 * ⚠️ TODO Pedro/Jofi: REVISAR todos os bullets, carências e limites com a
 * operação Jofi. Os valores abaixo são plausíveis pro mercado de pet
 * insurance mas precisam ser confirmados antes de campanha real.
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
  /** Bullets de benefícios (3-7 por plano) */
  bullets: string[];
  /** Carência em dias antes da cobertura ativar */
  waitingDays: number;
  /** True se é o plano destacado como "Mais popular" */
  popular: boolean;
  /** Cor de destaque do card (paleta Jofi) */
  accentColor: 'primary' | 'accent' | 'success' | 'neutral';
  /** Emoji representativo */
  emoji: string;
  /** Persona alvo */
  targetPersona: string;
}

// ⚠️ VERIFICAR JOFI — bullets/preços/carências precisam ser validados
// com a operação Jofi antes de ir ao live.
export const PLANS: Plan[] = [
  {
    id: 'sereninho',
    name: 'Sereninho',
    tagline: 'Essencial',
    priceMonthly: 49.9,
    priceLabel: 'R$ 49,90/mês',
    bullets: [
      '2 consultas/ano com vet credenciado', // VERIFICAR JOFI
      'Vacinação essencial (V8/V10 + antirrábica)', // VERIFICAR JOFI
      'Exames laboratoriais básicos (hemograma, urinálise)', // VERIFICAR JOFI
      'Orientação veterinária 24h via WhatsApp', // VERIFICAR JOFI
      'Sem fidelidade — cancele quando quiser',
    ],
    waitingDays: 30, // VERIFICAR JOFI
    popular: false,
    accentColor: 'neutral',
    emoji: '💙',
    targetPersona: 'Pra quem quer começar a cuidar com tranquilidade',
  },
  {
    id: 'sereno',
    name: 'Sereno',
    tagline: 'Cuidado preventivo',
    priceMonthly: 79.9,
    priceLabel: 'R$ 79,90/mês',
    bullets: [
      'Consultas ilimitadas com vet credenciado', // VERIFICAR JOFI
      'Vacinação completa (V8/V10/V12 + antirrábica + gripe canina)', // VERIFICAR JOFI
      'Exames laboratoriais completos', // VERIFICAR JOFI
      'Exames de imagem básicos (raio-X, ultrassom)', // VERIFICAR JOFI
      'Atendimento de emergência 24h', // VERIFICAR JOFI
      'Sem coparticipação',
    ],
    waitingDays: 30, // VERIFICAR JOFI
    popular: false,
    accentColor: 'primary',
    emoji: '🌻',
    targetPersona: 'Pra quem quer prevenção sem peso no bolso',
  },
  {
    id: 'parceiro',
    name: 'Parceiro',
    tagline: 'Proteção completa',
    priceMonthly: 169.9,
    priceLabel: 'R$ 169,90/mês',
    bullets: [
      'Tudo do Sereno +', // visual: indica que é superset
      'Internação 24h em rede credenciada', // VERIFICAR JOFI
      'Cirurgias eletivas + emergenciais', // VERIFICAR JOFI
      'Especialistas inclusos (cardio, derma, oftalmo, ortopedia)', // VERIFICAR JOFI
      'Carência reduzida pra emergências', // VERIFICAR JOFI
      'Sem coparticipação · Sem limite anual',
    ],
    waitingDays: 60, // VERIFICAR JOFI
    popular: true, // ⭐ Plano destacado como "Mais popular"
    accentColor: 'accent',
    emoji: '🔥',
    targetPersona: 'Pro tutor protetor que quer cobertura ampla',
  },
  {
    id: 'melhor-amigo',
    name: 'Melhor Amigo',
    tagline: 'Cuidado premium',
    priceMonthly: 269,
    priceLabel: 'R$ 269/mês',
    bullets: [
      'Tudo do Parceiro +',
      'Cirurgias complexas (ortopédicas, oncológicas)', // VERIFICAR JOFI
      'Quimioterapia + radioterapia', // VERIFICAR JOFI
      'Fisioterapia + acupuntura veterinária', // VERIFICAR JOFI
      'Reembolso de despesas externas até R$ 5.000/ano', // VERIFICAR JOFI
      'Atendimento prioritário Nicole VIP',
    ],
    waitingDays: 90, // VERIFICAR JOFI
    popular: false,
    accentColor: 'success',
    emoji: '👑',
    targetPersona: 'Pro tutor que não quer poupar no cuidado',
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
  // que aparece como opção pro lead na LP /oferta e na conversa com Nicole.
};
