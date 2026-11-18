'use client';

import Link from 'next/link';
import { useState } from 'react';
import { BOTAO } from './Chrome';
import { Icone } from './Blocos';
import { PLANOS, QUIZ_HREF } from './dados';

type Faixa = 'ate7' | 'a8mais';

/**
 * As quatro assinaturas com a idade do pet escolhida uma vez para todas: cada cartão mostra um preço só.
 * Valores da API do checkout (18/11/2026), em dados.ts.
 */
export function Assinaturas({ completo = false }: { completo?: boolean }) {
  const [faixa, setFaixa] = useState<Faixa>('ate7');

  const opcoes: { v: Faixa; r: string }[] = [
    { v: 'ate7', r: 'Até 7 anos' },
    { v: 'a8mais', r: '8 anos ou mais' },
  ];

  return (
    <div>
      <div
        role="radiogroup"
        aria-label="Idade do pet"
        className="inline-flex rounded-2xl border-2 border-[#d7ecfa] bg-white p-1"
      >
        {opcoes.map((o) => (
          <button
            key={o.v}
            type="button"
            role="radio"
            aria-checked={faixa === o.v}
            onClick={() => setFaixa(o.v)}
            className={`rounded-xl px-5 py-3 text-[15px] font-extrabold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#004f78] ${
              faixa === o.v ? 'bg-[#009af2] text-white' : 'text-[#004f78] hover:bg-[#eaf6fe]'
            }`}
          >
            {o.r}
          </button>
        ))}
      </div>
      <p className="mt-3 text-[14px] font-medium text-[#2f5a73]">Qual a idade do seu pet? O valor muda aos 8 anos completos.</p>

      {/* No celular, os cartões deslizam de lado (arrastar) em vez de empilhar quatro telas */}
      <div className="-mx-5 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 md:pb-0 xl:grid-cols-4">
        {PLANOS.map((p, i) => {
          const preco = faixa === 'ate7' ? p.ate7 : p.a8mais;
          const [reais, centavos] = preco.split(',');
          const banda = i % 2 === 0 ? 'bg-[#009af2]' : 'bg-[#ff9625]';
          return (
            <article key={p.chave} className="flex w-[84%] shrink-0 snap-center flex-col overflow-hidden rounded-[32px] bg-white ring-1 ring-[#d7ecfa] md:w-auto">
              <div className={`${banda} px-6 pb-5 pt-6`}>
                <h3 className="font-display text-[42px] uppercase leading-none text-white">{p.nome}</h3>
                <p className="mt-2 text-[15px] font-bold leading-snug text-white">{p.frase}</p>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <p className="text-[13px] font-bold text-[#2f5a73]">
                  {p.precoUnico ? 'Em qualquer idade' : faixa === 'ate7' ? 'Pet até 7 anos' : 'Pet com 8 anos ou mais'}
                </p>
                <p className="mt-1 whitespace-nowrap text-[#004f78]">
                  <span className="text-[18px] font-extrabold">R$ </span>
                  <span className="text-[54px] font-extrabold leading-none tracking-[-0.03em]">{reais}</span>
                  <span className="text-[24px] font-extrabold">,{centavos}</span>
                  <span className="ml-1 text-[15px] font-medium text-[#2f5a73]">/mês</span>
                </p>

                <div className="my-5 h-px bg-[#d7ecfa]" />

                {p.herda && <p className="mb-3 text-[14px] font-extrabold text-[#004f78]">{p.herda}</p>}
                <ul className="flex-1 space-y-2.5">
                  {(completo ? p.inclui : p.inclui.slice(0, 4)).map((c) => (
                    <li key={c} className="flex gap-3 text-[15px] font-medium leading-snug text-[#1f4a63]">
                      <span className="mt-[2px] flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#ff9625] text-white">
                        <Icone nome="check" className="h-3 w-3" />
                      </span>
                      {c}
                    </li>
                  ))}
                </ul>
                <Link href={QUIZ_HREF} className={`${BOTAO} mt-6 w-full`}>
                  Quero esta
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
