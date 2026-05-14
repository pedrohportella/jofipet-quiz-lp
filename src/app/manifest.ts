import type { MetadataRoute } from 'next';

/**
 * Web App Manifest — serve em /manifest.webmanifest automaticamente.
 *
 * Habilita "Add to Home Screen" no mobile + identifica como PWA-ready
 * mesmo sem service worker. Lighthouse e Search Console usam pra
 * sinalizar mobile-friendliness.
 *
 * Não é PWA completa (sem offline/service worker) — só metadata pra
 * tornar a LP instalável no home screen com branding correto.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Jofi Pet Quiz',
    short_name: 'Jofi Quiz',
    description:
      'Descubra qual plano de saúde pet é ideal pro seu pequeno em ~90 segundos.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFFBF5',
    theme_color: '#7090D8',
    orientation: 'portrait',
    lang: 'pt-BR',
    categories: ['lifestyle', 'pets', 'health'],
    icons: [
      {
        src: '/icon',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
