import Image from 'next/image';
import { AlertCircle } from 'lucide-react';
import { safeNextPath } from '@/lib/admin/session';

export const metadata = {
  title: 'Entrar · Admin Jofi Quiz',
  robots: { index: false, follow: false },
};

const ERROR_MESSAGE: Record<string, string> = {
  credenciais: 'Usuário ou senha incorretos.',
  limite: 'Muitas tentativas. Espere alguns minutos e tente de novo.',
};

const inputClass =
  'min-h-[48px] w-full rounded-pill border border-neutral-300 bg-white px-4 text-base text-neutral-900 placeholder:text-neutral-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30';

/**
 * Tela de login do painel. O formulário posta direto em
 * /api/admin-auth/login (sem JS no cliente), que grava o cookie de sessão
 * e redireciona pro `next`. Quem já tem sessão nem chega aqui: o middleware
 * manda de volta pro /admin.
 */
export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: { erro?: string; next?: string };
}) {
  const error = searchParams.erro ? ERROR_MESSAGE[searchParams.erro] : undefined;
  const next = safeNextPath(searchParams.next);

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm rounded-3xl border border-neutral-300 bg-white p-8">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Image
            src="/institucional/logo-colorida.png"
            alt="Jofi"
            width={74}
            height={80}
            className="h-20 w-auto"
            priority
          />
          <div>
            <h1 className="text-xl font-extrabold text-neutral-900">Painel do quiz</h1>
            <p className="text-sm text-neutral-500">Entre pra ver leads e conversas.</p>
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="mb-4 flex items-start gap-2 rounded-lg bg-primary-50 px-3 py-2 text-sm font-semibold text-neutral-900"
          >
            <AlertCircle size={18} strokeWidth={2} aria-hidden="true" className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </p>
        )}

        <form action="/api/admin-auth/login" method="post" className="flex flex-col gap-4">
          <input type="hidden" name="next" value={next} />
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-neutral-700">
            Usuário
            <input
              name="user"
              type="text"
              autoComplete="username"
              autoCapitalize="none"
              required
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-neutral-700">
            Senha
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className={inputClass}
            />
          </label>
          <button
            type="submit"
            className="mt-2 min-h-[52px] rounded-pill bg-accent px-6 text-base font-extrabold uppercase tracking-wide text-white transition-colors hover:bg-accent-300 focus:outline-none focus:ring-2 focus:ring-accent/40"
          >
            Entrar
          </button>
        </form>
      </div>
    </main>
  );
}
