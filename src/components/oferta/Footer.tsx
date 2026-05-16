'use client';

import { PawPrint } from 'lucide-react';
import Link from 'next/link';

export function OfertaFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-neutral-900 py-12 text-neutral-300">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <PawPrint className="h-6 w-6 text-primary" strokeWidth={2.5} aria-hidden="true" />
              <span
                className="text-xl text-white"
                style={{ fontFamily: 'var(--font-anton), Anton, Impact, sans-serif' }}
              >
                JOFI
              </span>
            </div>
            <p className="max-w-xs text-sm text-neutral-400">
              A plataforma de saúde que o seu bichinho merece. Do check-up à
              emergência, tudo para o seu pet.
            </p>
          </div>

          <nav className="flex flex-col gap-3 text-sm md:flex-row md:gap-6">
            <Link href="/" className="hover:text-white">
              Fazer o quiz
            </Link>
            <a
              href="https://jofi.pet"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white"
            >
              Site institucional
            </a>
            <Link href="/privacidade" className="hover:text-white">
              Política de privacidade
            </Link>
          </nav>
        </div>

        <div className="mt-8 border-t border-neutral-800 pt-6 text-xs text-neutral-500">
          <p>
            © {year} Jofi Pet · CNPJ 33.508.354/0001-09
          </p>
          <p className="mt-1">
            Rua Álvares Cabral, 155, 2º andar · Recife/PE · CEP 50.030-160
          </p>
          <p className="mt-3">
            Esta página é uma oferta promocional. Valores e coberturas estão
            sujeitos à aprovação e confirmação Jofi.
          </p>
        </div>
      </div>
    </footer>
  );
}
