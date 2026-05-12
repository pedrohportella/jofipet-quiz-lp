import Link from 'next/link';
import { ShareButton } from '@/components/shared/ShareButton';

export const metadata = {
  title: 'Obrigada! | Jofi Pet Quiz',
};

export default function ThankYouNoPetPage() {
  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-mobile flex-col items-center justify-center gap-6 px-4 py-8 text-center md:max-w-desktop">
      <span className="text-6xl" aria-hidden="true">
        🌟
      </span>

      <h1 className="text-3xl font-extrabold leading-tight text-neutral-900 md:text-4xl">
        Poxa, a Jofi é pra quem tem pet. 🐾
      </h1>

      <p className="max-w-sm text-base text-neutral-700">
        Mas quem sabe você não conhece alguém que curtiria saber disso?
      </p>

      <div className="flex w-full max-w-sm flex-col gap-3 pt-4">
        <ShareButton
          label="Compartilhar com um amigo 💛"
          text="Descobri um quiz que me ajudaria a escolher um plano pet — dá uma olhada!"
        />

        <Link
          href="/"
          className="text-sm text-neutral-500 underline underline-offset-4"
        >
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
