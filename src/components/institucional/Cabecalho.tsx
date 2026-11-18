'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BOTAO, LINKS } from './Chrome';
import { QUIZ_HREF } from './dados';

/** Cabeçalho com a página atual marcada. Menu do celular sem JavaScript (<details>). */
export function Cabecalho() {
  const pathname = usePathname() ?? '';
  const ativo = (href: string) => (href === '/institucional' ? pathname === href : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-50 border-b border-[#d7ecfa] bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between gap-6 px-5">
        <Link href="/institucional" aria-label="Jofi Pet, página inicial" className="shrink-0">
          <Image
            src="/institucional/logo-colorida.png"
            alt="Jofi Pet"
            width={920}
            height={1000}
            priority
            sizes="56px"
            className="h-[54px] w-auto"
          />
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={ativo(l.href) ? 'page' : undefined}
              className={`rounded-2xl px-4 py-2.5 text-[15px] font-bold no-underline transition ${
                ativo(l.href) ? 'bg-[#eaf6fe] text-[#004f78]' : 'text-[#2f5a73] hover:bg-[#eaf6fe]'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <Link
          href={QUIZ_HREF}
          className="hidden rounded-2xl bg-[#ff9625] px-5 py-[12px] text-[13px] font-extrabold uppercase tracking-[0.02em] text-white no-underline hover:brightness-95 md:inline-flex"
        >
          Descobrir minha cobertura
        </Link>

        <details className="group relative md:hidden">
          <summary
            aria-label="Menu"
            className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-full bg-[#eaf6fe] text-[#004f78] [&::-webkit-details-marker]:hidden"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </summary>
          <div className="absolute right-0 top-14 w-72 rounded-[28px] border border-[#d7ecfa] bg-white p-3 shadow-xl">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={ativo(l.href) ? 'page' : undefined}
                className={`block rounded-2xl px-4 py-3.5 text-[17px] font-bold no-underline ${
                  ativo(l.href) ? 'bg-[#eaf6fe] text-[#004f78]' : 'text-[#2f5a73]'
                }`}
              >
                {l.label}
              </Link>
            ))}
            <Link href={QUIZ_HREF} className={`${BOTAO} mt-2 w-full`}>
              Descobrir minha cobertura
            </Link>
          </div>
        </details>
      </div>
    </header>
  );
}
