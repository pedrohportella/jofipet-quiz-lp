import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Cabecalho } from '@/components/institucional/Cabecalho';
import { BarraCelular, Rodape } from '@/components/institucional/Chrome';

/**
 * Site institucional da Jofi no design system da Jofi (01_Marca/design-system, 29/09/2026).
 * PRÉVIA de 18/11/2026: fica fora do índice até a Jofi aprovar e trocar o jofi.pet.
 * Não toca no checkout nem na API do site atual: os botões de contratar apontam para eles.
 */
export const metadata: Metadata = {
  title: { default: 'Plataforma de saúde pet', template: '%s · Jofi Pet' },
  description: 'Conectamos você com quem vai cuidar do seu pet.',
  robots: { index: false, follow: false },
};

export default function InstitucionalLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`min-h-screen bg-white font-[family-name:var(--font-inter)] text-[#1f4a63] [scroll-behavior:smooth]`}
    >
      <Cabecalho />
      <main>{children}</main>
      <Rodape />
      <BarraCelular />
    </div>
  );
}
