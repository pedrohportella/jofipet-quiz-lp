import { CapturaClient } from './captura-client';

export const metadata = {
  title: 'Quase lá! | Jofi Pet Quiz',
  robots: { index: false, follow: false },
};

export default function CapturaPage() {
  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-mobile flex-col gap-5 px-4 py-8 md:max-w-desktop md:py-12">
      <CapturaClient />
    </main>
  );
}
