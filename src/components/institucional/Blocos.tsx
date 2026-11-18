import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { BOTAO, BOTAO_CONTORNO } from './Chrome';
import { QUIZ_HREF, type Clinica, type Plano, checkoutHref } from './dados';

/**
 * Estrelas brancas cortadas nos cantos, como no componente Fundo (no máximo duas por seção).
 * A marca só tem a estrela em amarelo, azul e laranja: a branca sai do amarelo com filtro.
 */
export function Estrelas({ opacidade = 0.22 }: { cor?: string; opacidade?: number }) {
  const src = '/institucional/estrela-amarelo.png';
  return (
    <>
      <Image
        src={src}
        alt=""
        aria-hidden
        width={500}
        height={500}
        style={{ opacity: opacidade, filter: 'brightness(0) invert(1)' }}
        className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 md:-left-20 md:-top-20 md:h-56 md:w-56"
      />
      <Image
        src={src}
        alt=""
        aria-hidden
        width={500}
        height={500}
        style={{ opacity: opacidade, filter: 'brightness(0) invert(1)' }}
        className="pointer-events-none absolute -bottom-20 -right-16 h-44 w-44 md:-bottom-24 md:-right-20 md:h-60 md:w-60"
      />
    </>
  );
}

const TITULO =
  'font-display text-[44px] uppercase leading-[1.04] tracking-[0.004em] md:text-[64px]';

export function Titulo({
  children,
  tom = 'claro',
  className = '',
}: {
  children: ReactNode;
  /** `claro`: sobre azul ou laranja (branco). `escuro`: sobre branco (azul). */
  tom?: 'claro' | 'escuro';
  className?: string;
}) {
  return (
    <h2 className={`${TITULO} ${tom === 'claro' ? 'text-white' : 'text-[#009af2]'} ${className}`}>
      {children}
    </h2>
  );
}

export const Realce = ({ children }: { children: ReactNode }) => <span className="text-[#ffff44]">{children}</span>;

export function Secao({
  fundo,
  children,
  className = '',
  id,
}: {
  fundo: 'azul' | 'laranja' | 'branco' | 'suave';
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  const bg = {
    azul: 'bg-[#009af2]',
    laranja: 'bg-[#ff9625]',
    branco: 'bg-white',
    suave: 'bg-[#eaf6fe]',
  }[fundo];
  return (
    <section id={id} className={`relative overflow-hidden ${bg} ${className}`}>
      <div className="relative z-10 mx-auto max-w-6xl px-5 py-16 md:py-24">{children}</div>
    </section>
  );
}

function Preco({ plano }: { plano: Plano }) {
  return (
    <div className="mt-5 rounded-2xl bg-[#eef7fd] px-4 py-3">
      {plano.precoUnico ? (
        <>
          <p className="text-[13px] font-bold text-[#2f5a73]">Em qualquer idade</p>
          <p className="whitespace-nowrap text-[28px] font-extrabold leading-tight tracking-[-0.02em] text-[#004f78]">
            R$ {plano.ate7}
            <span className="text-[15px] font-medium text-[#2f5a73]">/mês</span>
          </p>
        </>
      ) : (
        <>
          <p className="text-[13px] font-bold text-[#2f5a73]">Pet de 0 a 7 anos</p>
          <p className="whitespace-nowrap text-[28px] font-extrabold leading-tight tracking-[-0.02em] text-[#004f78]">
            R$ {plano.ate7}
            <span className="text-[15px] font-medium text-[#2f5a73]">/mês</span>
          </p>
          <p className="mt-2 text-[13px] font-bold text-[#2f5a73]">A partir de 8 anos</p>
          <p className="whitespace-nowrap text-[22px] font-extrabold leading-tight tracking-[-0.02em] text-[#004f78]">
            R$ {plano.a8mais}
            <span className="text-[14px] font-medium text-[#2f5a73]">/mês</span>
          </p>
        </>
      )}
    </div>
  );
}

export function PlanoCard({
  plano,
  destaque = false,
  completo = false,
}: {
  plano: Plano;
  destaque?: boolean;
  completo?: boolean;
}) {
  return (
    <article
      className={`flex flex-col rounded-[32px] bg-white p-6 ${
        destaque ? 'ring-4 ring-[#ffff44]' : 'border border-[#d7ecfa]'
      }`}
    >
      <h3 className="font-display text-[40px] uppercase leading-none text-[#009af2]">{plano.nome}</h3>
      <p className="mt-2 text-[16px] font-medium leading-snug text-[#2f5a73]">{plano.frase}</p>
      <Preco plano={plano} />
      <div className="mt-5 flex-1">
        {plano.herda && <p className="mb-2 text-[14px] font-bold text-[#004f78]">{plano.herda}</p>}
        <ul className="space-y-2">
          {(completo ? plano.inclui : plano.inclui.slice(0, 4)).map((i) => (
            <li key={i} className="flex gap-3 text-[15px] font-medium leading-snug text-[#1f4a63]">
              <span
                aria-hidden
                className="mt-[3px] flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#ff9625] text-white"
              >
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              </span>
              {i}
            </li>
          ))}
        </ul>
      </div>
      <Link href={QUIZ_HREF} className={`${BOTAO} mt-6 w-full`}>
        Quero essa
      </Link>
    </article>
  );
}

export function ClinicaCard({ c }: { c: Clinica }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-[32px] border border-[#d7ecfa] bg-white">
      {c.foto ? (
        <div className="relative h-48 w-full bg-[#eaf6fe]">
          <Image
            src={c.foto.src}
            alt={c.foto.alt}
            fill
            sizes="(min-width: 768px) 360px, 100vw"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="flex h-48 items-center justify-center bg-[#eaf6fe]">
          <Image src="/institucional/estrela-azul.png" alt="" aria-hidden width={500} height={500} className="h-24 w-24" />
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        {c.atendimento24h && (
          <span className="mb-3 inline-flex w-fit rounded-2xl bg-[#ffff44] px-3 py-1 text-[12px] font-extrabold uppercase tracking-[0.06em] text-[#004f78]">
            Atendimento 24h
          </span>
        )}
        <h3 className="font-display text-[32px] uppercase leading-[1.05] text-[#009af2]">{c.nome}</h3>
        <p className="mt-2 text-[15px] font-bold text-[#004f78]">
          {c.bairro}, {c.cidade}/{c.uf}
        </p>
        <p className="mt-1 text-[15px] font-medium text-[#2f5a73]">{c.endereco}</p>
        <a
          href={checkoutHref(c.unidadeId)}
          className={`${BOTAO_CONTORNO} mt-5 w-full`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Contratar nesta clínica
        </a>
      </div>
    </article>
  );
}
