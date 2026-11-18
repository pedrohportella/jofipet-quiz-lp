import Image from 'next/image';
import Link from 'next/link';
import { ENDERECO_SEDE, QUIZ_HREF, TELEFONE, whatsappHref } from './dados';

export const LINKS = [
  { href: '/institucional', label: 'Início' },
  { href: '/institucional/coberturas', label: 'Coberturas' },
  { href: '/institucional/rede-credenciada', label: 'Rede credenciada' },
  { href: '/institucional/seja-parceiro', label: 'Seja parceiro' },
];

const FOCO =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004f78]';

/** Botão principal do design system: pílula laranja, texto branco bold em caixa alta. */
export const BOTAO = `inline-flex items-center justify-center gap-2 rounded-2xl bg-[#ff9625] px-7 py-[15px] text-[15px] font-extrabold uppercase tracking-[0.02em] text-white no-underline transition hover:brightness-95 active:scale-[0.99] ${FOCO}`;

/** Contorno para fundo claro (texto azul-tinta). */
export const BOTAO_CONTORNO = `inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-[#004f78] bg-white px-7 py-[13px] text-[15px] font-extrabold uppercase tracking-[0.02em] text-[#004f78] no-underline transition hover:bg-[#eaf6fe] active:scale-[0.99] ${FOCO}`;

/** Botão branco para fundo laranja ou azul. */
export const BOTAO_BRANCO = `inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-7 py-[15px] text-[15px] font-extrabold uppercase tracking-[0.02em] text-[#004f78] no-underline transition hover:brightness-95 active:scale-[0.99] ${FOCO}`;

/** Barra fixa do celular: a ação principal sempre à mão. */
export function BarraCelular() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#d7ecfa] bg-white/95 p-3 backdrop-blur md:hidden">
      <Link href={QUIZ_HREF} className={`${BOTAO} w-full`}>
        Descobrir minha cobertura <span aria-hidden>→</span>
      </Link>
    </div>
  );
}

export function Rodape() {
  return (
    <footer className="bg-[#004f78] pb-24 text-white md:pb-0">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-[1.3fr_1fr_1.2fr]">
        <div>
          <Image
            src="/institucional/logo-branca.png"
            alt="Jofi Pet"
            width={920}
            height={1000}
            sizes="80px"
            className="h-20 w-auto"
          />
          <p className="mt-5 max-w-xs font-display text-[30px] uppercase leading-[1.05]">
            Conectamos você com quem vai cuidar do seu pet.
          </p>
        </div>

        <nav aria-label="Rodapé">
          <p className="text-[13px] font-extrabold uppercase tracking-[0.1em] text-[#ffff44]">Navegue</p>
          <ul className="mt-4 space-y-3">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-[16px] font-medium text-white no-underline hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href={QUIZ_HREF} className="text-[16px] font-medium text-white no-underline hover:underline">
                Descobrir minha cobertura
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <p className="text-[13px] font-extrabold uppercase tracking-[0.1em] text-[#ffff44]">Fale com a Jofi</p>
          <ul className="mt-4 space-y-3 text-[16px] font-medium">
            <li>
              <a
                href={whatsappHref('Olá! Quero tirar uma dúvida sobre as assinaturas da Jofi.')}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white no-underline hover:underline"
              >
                WhatsApp e telefone
                <span className="block text-[22px] font-extrabold">{TELEFONE}</span>
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
