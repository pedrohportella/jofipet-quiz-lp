import type { MetadataRoute } from 'next';

/**
 * robots.txt dinâmico — serve em /robots.txt automaticamente.
 *
 * Política:
 *   - Permite crawl da LP (/)
 *   - Bloqueia tudo que é transacional/admin/API:
 *     - /api/*           (endpoints internos)
 *     - /admin/*         (painel administrativo)
 *     - /captura         (form de captura, sem valor SEO)
 *     - /resultado/*     (página de resultado pessoal)
 *     - /obrigado-sem-pet (página de exit)
 *     - /quiz/*          (steps do quiz, sem valor SEO standalone)
 *
 * AI crawlers (GPTBot, Claude-Web, etc) recebem mesma política — permitidos
 * só na LP. Se quiser bloquear completamente, descomente o bloco específico.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://jofipet-quiz-lp.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/captura',
          '/captura/',
          '/resultado/',
          '/obrigado-sem-pet',
          '/quiz/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
