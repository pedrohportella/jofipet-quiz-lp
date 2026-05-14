import type { Metadata, Viewport } from 'next';
import { Nunito, Anton } from 'next/font/google';
import { GoogleAnalytics } from '@next/third-parties/google';
import { Providers } from './providers';
import { MetaPixelScript } from '@/components/tracking/MetaPixelScript';
import { UtmCapture } from '@/components/tracking/UtmCapture';
import './globals.css';

const nunito = Nunito({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-nunito',
  weight: ['400', '600', '700', '800'],
});

const anton = Anton({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-anton',
  weight: ['400'],
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://jofipet-quiz-lp.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Jofi Pet Quiz — Descubra o plano ideal pro seu pet',
    template: '%s · Jofi Pet',
  },
  description:
    'Em ~90 segundos, descubra qual plano de saúde pet ideal pro seu pequeno. Quiz personalizado da Jofi com recomendação na hora 🐾',
  applicationName: 'Jofi Pet Quiz',
  authors: [{ name: 'Jofi Pet', url: 'https://jofi.pet' }],
  generator: 'Next.js',
  keywords: [
    'plano de saúde pet',
    'plano pet',
    'jofi',
    'jofi pet',
    'pet care',
    'seguro pet',
    'plano veterinário',
    'saúde do pet',
    'cuidados pet',
  ],
  referrer: 'origin-when-cross-origin',
  creator: 'Jofi Pet',
  publisher: 'Jofi Pet',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Jofi Pet Quiz — Descubra o plano ideal pro seu pet',
    description:
      'Em ~90 segundos, descubra qual plano de saúde pet é ideal pro seu pequeno 🐾',
    type: 'website',
    locale: 'pt_BR',
    url: SITE_URL,
    siteName: 'Jofi Pet',
    // images: Next 14 detecta automaticamente app/opengraph-image.tsx
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jofi Pet Quiz — Descubra o plano ideal pro seu pet',
    description:
      'Em ~90 segundos, descubra qual plano de saúde pet é ideal pro seu pequeno 🐾',
    // images: Next 14 detecta automaticamente app/twitter-image.tsx
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'pets',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#7090D8' },
    { media: '(prefers-color-scheme: dark)', color: '#7090D8' },
  ],
};

/**
 * JSON-LD schema.org — sinaliza pra Google que isso é um produto/serviço
 * de uma organização real. Aumenta confiança em rich snippets e ad quality.
 *
 * @id absoluto vira a "entity reference" da Jofi Pet nessa página.
 */
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: 'Jofi Pet',
  url: 'https://jofi.pet',
  logo: `${SITE_URL}/icon`,
  description:
    'Planos de saúde pet acessíveis para tutores que cuidam de seus pequenos com carinho.',
  sameAs: ['https://www.instagram.com/jofi.pet/'],
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: SITE_URL,
  name: 'Jofi Pet Quiz',
  description:
    'Quiz interativo Jofi pra descobrir o plano de saúde pet ideal em ~90 segundos.',
  publisher: { '@id': `${SITE_URL}/#organization` },
  inLanguage: 'pt-BR',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? '';
  const gaId = process.env.NEXT_PUBLIC_GA_ID ?? '';

  return (
    <html lang="pt-BR" className={`${nunito.variable} ${anton.variable}`}>
      <head>
        {/* JSON-LD: Organization + WebSite. Google lê e usa em rich results. */}
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="min-h-screen bg-secondary font-sans text-neutral-900 antialiased">
        <UtmCapture />
        <Providers>{children}</Providers>
        {pixelId && <MetaPixelScript pixelId={pixelId} />}
        {gaId && gaId !== 'G-XXXXXXXXXX' && <GoogleAnalytics gaId={gaId} />}
      </body>
    </html>
  );
}
