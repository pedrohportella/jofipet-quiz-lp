import Image from 'next/image';
import Link from 'next/link';
import { ENDERECO_SEDE, QUIZ_HREF, TELEFONE, whatsappHref } from './dados';

const LINKS = [
  { href: '/institucional', label: 'Início' },
  { href: '/institucional/coberturas', label: 'Coberturas' },
  { href: '/institucional/rede-credenciada', label: 'Rede credenciada' },
  { href: '/institucional/seja-parceiro', label: 'Seja parceiro' },
];

/** Botão em pílula do design system: laranja com texto branco, caixa alta. */
export const BOTAO =
  'inline-flex items-center justify-center gap-2 rounded-2xl bg-[#ff9625] px-7 py-[15px] text-[15px] font-extrabold uppercase tracking-[0.02em] text-white no-underline transition hover:brightness-95 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004f78]';

/** Variante de contorno para fundo claro ou azul-tinta no texto. */
export const BOTAO_CONTORNO =
  'inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-[#004f78] bg-white px-7 py-[13px] text-[15px] font-extrabold uppercase tracking-[0.02em] text-[#004f78] no-underline transition hover:bg-[#eaf6fe] active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004f78]';

export function Cabecalho() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#d7ecfa] bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-5">
        <Link href="/institucional" aria-label="Jofi Pet, página inicial" className="shrink-0">
          <Image
            src="/institucional/logo-colorida.png"
            alt="Jofi Pet"
            width={920}
            height={1000}
            priority
            sizes="56px"
            className="h-[52px] w-auto"
          />
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[15px] font-bold text-[#004f78] no-underline hover:text-[#009af2]"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <Link
          href={QUIZ_HREF}
          className="hidden rounded-2xl bg-[#ff9625] px-5 py-[11px] text-[13px] font-extrabold uppercase tracking-[0.02em] text-white no-underline hover:brightness-95 md:inline-flex"
        >
          Descobrir minha cobertura
        </Link>

        {/* Menu do celular sem JavaScript: <details> abre e fecha sozinho */}
        <details className="group relative md:hidden">
          <summary
            aria-label="Menu"
            className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-full bg-[#eaf6fe] text-[#004f78] [&::-webkit-details-marker]:hidden"
          >
            <svg
              viewBox="0 0 24 24"
              width="22"
              height="22"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              aria-hidden
            >
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </summary>
          <div className="absolute right-0 top-14 w-64 rounded-[28px] border border-[#d7ecfa] bg-white p-3 shadow-xl">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="block rounded-2xl px-4 py-3 text-[16px] font-bold text-[#004f78] no-underline hover:bg-[#eaf6fe]"
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

export function Rodape() {
  return (
    <footer className="bg-[#004f78] text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <Image
            src="/institucional/logo-branca.png"
            alt="Jofi Pet"
            width={920}
            height={1000}
            sizes="72px"
            className="h-[72px] w-auto"
          />
          <p className="mt-4 max-w-xs text-[15px] font-medium leading-relaxed text-white/90">
            Conectamos você com quem vai cuidar do seu pet.
          </p>
        </div>

        <nav aria-label="Rodapé">
          <p className="text-[13px] font-extrabold uppercase tracking-[0.08em] text-[#ffff44]">Navegue</p>
          <ul className="mt-4 space-y-3">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-[15px] font-medium text-white no-underline hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href={QUIZ_HREF} className="text-[15px] font-medium text-white no-underline hover:underline">
                Descobrir minha cobertura
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <p className="text-[13px] font-extrabold uppercase tracking-[0.08em] text-[#ffff44]">Fale com a Jofi</p>
          <ul className="mt-4 space-y-3 text-[15px] font-medium">
            <li>
              <a
                href={whatsappHref('Olá! Quero tirar uma dúvida sobre as assinaturas da Jofi.')}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white no-underline hover:underline"
              >
                WhatsApp e telefone: {TELEFONE}
              </a>
            </li>
            <li className="text-white/90">{ENDERECO_SEDE}</li>
            <li>
              <a
                href="https://www.instagram.com/jofi.pet/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white no-underline hover:underline"
              >
                Instagram @jofi.pet
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/20">
        <p className="mx-auto max-w-6xl px-5 py-5 text-[13px] font-medium text-white/80">
          © Jofi Pet. Plataforma de saúde pet por assinatura, com atendimento presencial nas clínicas parceiras.
        </p>
      </div>
    </footer>
  );
}
