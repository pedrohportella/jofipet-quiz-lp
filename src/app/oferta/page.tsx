import type { Metadata } from 'next';
import { OfertaClient } from './oferta-client';

/**
 * LP /oferta — variante long-form direct-response da Jofi.
 *
 * Funil A/B com a LP do quiz (/) — testa hipótese "lead decidido converte
 * melhor em LP de vendas vs quiz interativo".
 *
 * Tracking: variant: 'oferta_lp' em todos os eventos (vs variant: 'quiz').
 */

export const metadata: Metadata = {
  title: 'Plano de saúde pet a partir de R$ 49,90/mês',
  description:
    'Cuidado completo pro seu pet: consultas, vacinas, exames, emergências e cirurgias. Atendimento humano 24h via WhatsApp. Sem fidelidade. Comece hoje 🐾',
  alternates: {
    canonical: '/oferta',
  },
  openGraph: {
    title: 'Jofi Pet — Planos a partir de R$ 49,90/mês',
    description:
      'Cuidado completo + atendimento humano 24h via WhatsApp. Sem fidelidade. 🐾',
    type: 'website',
    locale: 'pt_BR',
    url: '/oferta',
    siteName: 'Jofi Pet',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jofi Pet — Planos a partir de R$ 49,90/mês',
    description: 'Cuidado completo + atendimento humano 24h. Sem fidelidade.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function OfertaPage() {
  const whatsappNumber = process.env.NEXT_PUBLIC_JOFI_WHATSAPP ?? '';
  // TODO Pedro/Jofi: setar env NEXT_PUBLIC_JOFI_VIDEO_URL com URL do YouTube/Vimeo
  // Quando setado, o VideoSection renderiza embed real ao invés de placeholder.
  const videoEmbedUrl = process.env.NEXT_PUBLIC_JOFI_VIDEO_URL;

  return (
    <main className="min-h-screen bg-white">
      <OfertaClient
        whatsappNumber={whatsappNumber}
        videoEmbedUrl={videoEmbedUrl}
      />
    </main>
  );
}
