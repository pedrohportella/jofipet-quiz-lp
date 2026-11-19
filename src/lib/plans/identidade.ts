import type { PlanId } from './catalog';

/**
 * Identidade visual de cada assinatura: a cor do fundo e o pet das artes de outubro
 * (`06_Criativos/2026-10/whatsapp-resumo-planos`, camadas `1-fundo` e `2-pet`). Valem para o site
 * institucional, a captura e o resultado do quiz.
 *
 * As cores NÃO são do design system oficial (que só tem azul, laranja e amarelo): vêm das artes dos
 * planos, que a Jofi já usa nos posts. O Sereninho pede texto em azul-tinta porque o branco sobre
 * `#f5b03a` não tem contraste.
 */
export interface IdentidadePlano {
  /** Cor de fundo da faixa do plano. */
  cor: string;
  /** Cor do título sobre `cor`. */
  corTexto: string;
  /** Pet do plano, recortado, em /public/institucional/planos. */
  pet: { src: string; alt: string };
}

export const IDENTIDADE_PLANO: Record<PlanId, IdentidadePlano> = {
  sereninho: {
    cor: '#f5b03a',
    corTexto: '#004f78',
    pet: { src: '/institucional/planos/pet-sereninho.png', alt: 'Cachorro caramelo, o pet do Sereninho' },
  },
  sereno: {
    cor: '#0091b9',
    corTexto: '#ffffff',
    pet: { src: '/institucional/planos/pet-sereno.png', alt: 'Cachorro beagle com a língua para fora, o pet do Sereno' },
  },
  parceiro: {
    cor: '#f47646',
    corTexto: '#ffffff',
    pet: { src: '/institucional/planos/pet-parceiro.png', alt: 'Cachorro preto de orelhas em pé, o pet do Parceiro' },
  },
  'melhor-amigo': {
    cor: '#5753a2',
    corTexto: '#ffffff',
    pet: { src: '/institucional/planos/pet-melhor-amigo.png', alt: 'Gato malhado lambendo o focinho, o pet do Melhor Amigo' },
  },
};
