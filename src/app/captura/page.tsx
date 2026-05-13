import { CaptureForm } from '@/components/capture/CaptureForm';

export const metadata = {
  title: 'Quase lá! | Jofi Pet Quiz',
  robots: { index: false, follow: false },
};

export default function CapturaPage() {
  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-mobile flex-col gap-6 px-4 py-8 md:max-w-desktop md:py-12">
      <header className="flex flex-col items-center gap-2 text-center">
        <span className="text-4xl" aria-hidden="true">
          🎉
        </span>
        <h1
          className="text-3xl uppercase leading-[0.95] text-neutral-900 md:text-4xl"
          style={{ fontFamily: 'var(--font-anton), Anton, Impact, sans-serif' }}
        >
          Quase lá!
        </h1>
        <p className="max-w-sm text-base text-neutral-700">
          Pra liberar seu resultado, conta um pouco sobre você 🐾
        </p>
      </header>

      <CaptureForm />
    </main>
  );
}
