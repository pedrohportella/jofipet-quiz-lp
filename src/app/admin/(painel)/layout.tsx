import Link from 'next/link';
import Image from 'next/image';
import { AdminNav } from '@/components/admin/AdminNav';

/**
 * Casca do painel no design system da Jofi (fase 1 do CRM):
 * faixa azul com a logo branca, barra branca com o menu e página em fundo-suave.
 * Sem sombra: o contorno borda-suave separa as camadas.
 */
export default function AdminPainelLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header>
        <div className="bg-primary">
          <div className="mx-auto flex max-w-wide items-center gap-3 px-4 py-3 md:px-6">
            <Link href="/admin" className="flex items-center gap-3" aria-label="Jofi, painel admin">
              <Image
                src="/institucional/logo-branca.png"
                alt="Jofi"
                width={46}
                height={50}
                className="h-12 w-auto"
                priority
              />
            </Link>
            <span className="rounded-pill bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider text-neutral-900">
              Admin
            </span>
          </div>
        </div>
        <div className="border-b border-neutral-300 bg-white">
          <AdminNav />
        </div>
      </header>
      <main className="mx-auto max-w-wide px-4 py-6 md:px-6 md:py-8">{children}</main>
    </>
  );
}
