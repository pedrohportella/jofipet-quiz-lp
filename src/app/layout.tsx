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

export const metadata: Metadata = {
  title: 'Jofi Pet Quiz — Descubra o plano ideal para seu pet',
  description:
    'Responda 6 perguntas rápidas e descubra o plano ideal de saúde pet para o seu pequeno. 🐾',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  ),
  openGraph: {
    title: 'Jofi Pet Quiz',
    description: 'Descubra o plano ideal para o seu pet em menos de 2 minutos.',
    type: 'website',
    locale: 'pt_BR',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#7090D8',
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
      <body className="min-h-screen bg-secondary font-sans text-neutral-900 antialiased">
        <UtmCapture />
        <Providers>{children}</Providers>
        {pixelId && <MetaPixelScript pixelId={pixelId} />}
        {gaId && gaId !== 'G-XXXXXXXXXX' && <GoogleAnalytics gaId={gaId} />}
      </body>
    </html>
  );
}
