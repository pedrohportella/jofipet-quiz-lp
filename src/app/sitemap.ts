import type { MetadataRoute } from 'next';

/**
 * Sitemap dinâmico — serve em /sitemap.xml automaticamente.
 *
 * Estratégia: SÓ inclui rotas que devem ser indexadas (LP pública).
 * Rotas transacionais/personalizadas (/captura, /resultado, /admin, /obrigado-sem-pet)
 * já têm `noindex` em metadata e são excluídas aqui também.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://jofipet-quiz-lp.vercel.app';

  const now = new Date();

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
  ];
}
