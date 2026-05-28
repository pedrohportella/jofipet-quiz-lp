import type { Metadata } from 'next';
import { OutOfAreaClient } from './out-of-area-client';

export const metadata: Metadata = {
  title: 'Fora da nossa área — Jofi Pet',
  description: 'Atualmente atendemos PE e PB. Avise quando a Jofi chegar na sua cidade.',
  robots: { index: false, follow: false },
};

export default function OutOfAreaPage() {
  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-mobile flex-col px-4 py-10 md:max-w-desktop md:py-16">
      <OutOfAreaClient />
    </main>
  );
}
