// Placeholder temporário — Story 2.2 implementa o formulário real.
// Mantido aqui para que QuizStep consiga router.push('/captura') sem 404.

export const metadata = {
  title: 'Captura | Jofi Pet Quiz',
  robots: { index: false, follow: false },
};

export default function CapturaPlaceholder() {
  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-mobile flex-col items-center justify-center gap-4 px-4 py-10 text-center md:max-w-desktop">
      <span className="text-5xl" aria-hidden="true">
        🎉
      </span>
      <h1 className="text-2xl font-bold">Quase lá!</h1>
      <p className="max-w-sm text-base text-neutral-700">
        Formulário de captura será implementado na Story 2.2.
      </p>
    </main>
  );
}
