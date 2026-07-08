export interface Testimonial {
  quote: string;
  name: string;
  city: string;
  /** Plano assinado (opcional — avaliações do Google não informam o plano). */
  plan?: string;
  rating?: number;
  initial?: string;
}

/**
 * Nota agregada do perfil Jofi Pet no Google (Google Meu Negócio, Recife).
 * Conferida em 2026-07-07. Atualizar quando a nota/contagem mudar.
 */
export const GOOGLE_RATING = { score: '4,5', count: 78 };

/**
 * Depoimentos extraídos de avaliações públicas reais do perfil
 * Jofi Pet no Google Maps (2026-07-07). Citações encurtadas sem
 * alterar o sentido; sobrenomes abreviados por privacidade.
 *
 * TODO Pedro/Ricardo: substituir por depoimentos com autorização direta
 * (nome + cidade + plano + foto do pet) quando coletados.
 */
export const testimonials: Testimonial[] = [
  {
    quote:
      'Atendimento muito bom, profissionais competentes. Sempre atenciosos com nossos pets. Estou satisfeita com a Jofi.',
    name: 'Flora C.',
    city: 'Recife/PE',
    rating: 5,
  },
  {
    quote:
      'Foi simplesmente maravilhoso, o meu pet foi muito bem atendido, todos da clínica são maravilhosos. Super indico!',
    name: 'Vanda G.',
    city: 'Recife/PE',
    rating: 5,
  },
  {
    quote: 'Só gratidão, sempre tive total assistência da equipe Jofi.',
    // TODO: recuperar o nome da autora no painel do Google Meu Negócio (citação do resumo oficial de avaliações)
    name: 'Tutora Jofi',
    city: 'Recife/PE',
    rating: 5,
  },
];
