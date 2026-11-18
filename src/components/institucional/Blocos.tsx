import Image from 'next/image';
import type { ReactNode } from 'react';
import { BOTAO_CONTORNO } from './Chrome';
import { type Hospital, checkoutHref } from './dados';

/* ───────────── Tipografia e seções ───────────── */

export function Etiqueta({ children, tom = 'amarelo' }: { children: ReactNode; tom?: 'amarelo' | 'branco' }) {
  return (
    <span
      className={`inline-flex w-fit rounded-2xl px-4 py-1.5 text-[12px] font-extrabold uppercase tracking-[0.1em] text-[#004f78] ${
        tom === 'amarelo' ? 'bg-[#ffff44]' : 'bg-white'
      }`}
    >
      {children}
    </span>
  );
}

export function Titulo({
  children,
  tom = 'claro',
  className = '',
  tag: Tag = 'h2',
}: {
  children: ReactNode;
  /** `claro`: branco, para fundo azul ou laranja. `escuro`: azul, para fundo branco. */
  tom?: 'claro' | 'escuro';
  className?: string;
  tag?: 'h1' | 'h2';
}) {
  return (
    <Tag
      className={`font-display text-[46px] uppercase leading-[1.02] tracking-[0.004em] md:text-[72px] ${
        tom === 'claro' ? 'text-white' : 'text-[#009af2]'
      } ${className}`}
    >
      {children}
    </Tag>
  );
}

export const Realce = ({ children }: { children: ReactNode }) => <span className="text-[#ffff44]">{children}</span>;

export function Lead({ children, tom = 'escuro', className = '' }: { children: ReactNode; tom?: 'claro' | 'escuro'; className?: string }) {
  return (
    <p
      className={`text-[19px] font-medium leading-relaxed md:text-[21px] ${
        tom === 'claro' ? 'text-white' : 'text-[#2f5a73]'
      } ${className}`}
    >
      {children}
    </p>
  );
}

export function Secao({
  fundo,
  children,
  className = '',
  id,
  semPadding = false,
}: {
  fundo: 'azul' | 'laranja' | 'branco' | 'suave';
  children: ReactNode;
  className?: string;
  id?: string;
  semPadding?: boolean;
}) {
  const bg = { azul: 'bg-[#009af2]', laranja: 'bg-[#ff9625]', branco: 'bg-white', suave: 'bg-[#eaf6fe]' }[fundo];
  return (
    <section id={id} className={`relative overflow-hidden ${bg} ${className}`}>
      <div className={`relative z-10 mx-auto max-w-6xl px-5 ${semPadding ? '' : 'py-20 md:py-28'}`}>{children}</div>
    </section>
  );
}

/* ───────────── Formas do design system ───────────── */

type Forma = 'circulo-amarelo' | 'circulo-laranja' | 'circulo-azul' | 'quadrado-laranja' | 'quadrado-amarelo' | 'semicirculo-amarelo' | 'semicirculo-laranja' | 'estrela-amarelo' | 'estrela-laranja' | 'estrela-azul';

/** Forma oficial da marca, solta e decorativa. Posicione com `className`. */
export function Forma({ nome, className = '' }: { nome: Forma; className?: string }) {
  return (
    <Image
      src={`/institucional/${nome}.png`}
      alt=""
      aria-hidden
      width={500}
      height={500}
      className={`pointer-events-none absolute select-none ${className}`}
    />
  );
}

/** Estrelas brancas cortadas nos cantos (a marca só tem estrela em amarelo, azul e laranja: a branca sai do amarelo). */
export function EstrelasBrancas({ opacidade = 0.2 }: { opacidade?: number }) {
  const estilo = { opacity: opacidade, filter: 'brightness(0) invert(1)' };
  return (
    <>
      <Image src="/institucional/estrela-amarelo.png" alt="" aria-hidden width={500} height={500} style={estilo}
        className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 md:-left-20 md:-top-20 md:h-60 md:w-60" />
      <Image src="/institucional/estrela-amarelo.png" alt="" aria-hidden width={500} height={500} style={estilo}
        className="pointer-events-none absolute -bottom-20 -right-16 h-44 w-44 md:-bottom-28 md:-right-20 md:h-64 md:w-64" />
    </>
  );
}

/* ───────────── Ícones de linha, traço arredondado (estilo Lucide) ───────────── */

const TRACO = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export function Icone({ nome, className = 'h-6 w-6' }: { nome: 'casa' | 'etiqueta' | 'check' | 'chave' | 'seta' | 'mais'; className?: string }) {
  const d = {
    casa: <><path d="M3 11.5 12 4l9 7.5" /><path d="M5 10v10h14V10" /><path d="M10 20v-6h4v6" /></>,
    etiqueta: <><path d="M3 12V4h8l10 10-8 8z" /><circle cx="7.5" cy="8.5" r="1.2" /></>,
    check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
    chave: <><circle cx="8" cy="14" r="4" /><path d="M11 11l9-9" /><path d="M16 6l3 3" /></>,
    seta: <path d="M5 12h14M13 6l6 6-6 6" />,
    mais: <path d="M12 5v14M5 12h14" />,
  }[nome];
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...TRACO}>
      {d}
    </svg>
  );
}

/** Bola laranja com ícone branco: o item de lista do design system. */
export function BolaIcone({ nome, tamanho = 'h-12 w-12' }: { nome: Parameters<typeof Icone>[0]['nome']; tamanho?: string }) {
  return (
    <span className={`flex shrink-0 items-center justify-center rounded-full bg-[#ff9625] text-white ${tamanho}`}>
      <Icone nome={nome} className="h-[52%] w-[52%]" />
    </span>
  );
}

/* ───────────── Rede credenciada ───────────── */

export function HospitalCard({ h }: { h: Hospital }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-[32px] border border-[#d7ecfa] bg-white">
      <div className="relative h-52 w-full overflow-hidden bg-[#009af2]">
        {h.foto ? (
          <Image src={h.foto.src} alt={h.foto.alt} fill sizes="(min-width: 768px) 380px, 100vw" className="object-cover" />
        ) : (
          <>
            <Forma nome="estrela-amarelo" className="-right-8 -top-8 h-44 w-44" />
            <Forma nome="circulo-laranja" className="-bottom-12 left-6 h-32 w-32" />
          </>
        )}
        {h.atendimento24h && (
          <span className="absolute left-4 top-4 rounded-2xl bg-[#ffff44] px-3 py-1 text-[12px] font-extrabold uppercase tracking-[0.08em] text-[#004f78]">
            Atendimento 24h
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-[34px] uppercase leading-[1.04] text-[#009af2]">{h.nome}</h3>
        <p className="mt-1 text-[15px] font-bold text-[#004f78]">
          {h.cidade}/{h.uf}
        </p>
        <ul className="mt-5 flex-1 space-y-3">
          {h.unidades.map((u) => (
            <li key={u.unidadeId} className="rounded-2xl bg-[#eaf6fe] p-4">
              <p className="text-[15px] font-extrabold text-[#004f78]">{u.bairro}</p>
              <p className="text-[14px] font-medium text-[#2f5a73]">{u.endereco}</p>
              <a
                href={checkoutHref(u.unidadeId)}
                target="_blank"
                rel="noopener noreferrer"
                className={`${BOTAO_CONTORNO} mt-3 w-full !py-[10px] !text-[13px]`}
              >
                Contratar nesta unidade
              </a>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

/* ───────────── Perguntas frequentes ───────────── */

export function Faq({ itens }: { itens: { p: string; r: string }[] }) {
  return (
    <div className="divide-y divide-[#d7ecfa] overflow-hidden rounded-[32px] border border-[#d7ecfa] bg-white">
      {itens.map((i) => (
        <details key={i.p} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-[17px] font-extrabold text-[#004f78] [&::-webkit-details-marker]:hidden">
            {i.p}
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ff9625] text-white transition group-open:rotate-45">
              <Icone nome="mais" className="h-5 w-5" />
            </span>
          </summary>
          <p className="px-6 pb-6 text-[16px] font-medium leading-relaxed text-[#2f5a73]">{i.r}</p>
        </details>
      ))}
    </div>
  );
}
