import Image from 'next/image';
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
  'w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30';

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
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-jofi-1">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Image
            src="/brand/jofi/variant-7.svg"
            alt="Jofi"
            width={90}
            height={36}
            className="h-9 w-auto"
            priority
          />
          <div>
            <h1 className="text-lg font-bold text-neutral-900">Painel do quiz</h1>
            <p className="text-sm text-neutral-500">Entre pra ver leads e conversas.</p>
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
          >
            {error}
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
            className="mt-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90"
          >
            Entrar
          </button>
        </form>
      </div>
    </main>
  );
}
