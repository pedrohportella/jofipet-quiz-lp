export interface Testimonial {
  quote: string;
  name: string;
  city: string;
  plan: string;
  rating?: number;
  initial?: string;
}

/**
 * Depoimentos reais aprovados pelo cliente.
 *
 * ⚠️ Só entra aqui caso REAL: nome + cidade + plano assinado, com autorização do tutor.
 * Enquanto array estiver vazio, a seção não renderiza (ver Testimonials.tsx).
 */
export const testimonials: Testimonial[] = [
  // { quote: "...", name: "Nome S.", city: "Recife/PE", plan: "Sereno", rating: 5, initial: "N" },
];
