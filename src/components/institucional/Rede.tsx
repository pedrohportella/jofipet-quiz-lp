'use client';

import { useState } from 'react';
import { HospitalCard } from './Blocos';
import { CIDADES, HOSPITAIS, slugDaCidade } from './dados';

/**
 * Rede credenciada com seletor de cidade. "Todas" mostra as cidades em seções, na ordem de CIDADES;
 * escolher uma cidade deixa só ela. A lista vem de dados.ts (API do checkout, 18/11/2026).
 */
export function Rede() {
  const [cidade, setCidade] = useState<string>('todas');

  const opcoes = [
    { slug: 'todas', nome: 'Todas', total: HOSPITAIS.reduce((n, h) => n + h.unidades.length, 0) },
    ...CIDADES.map((c) => ({
      slug: c.slug,
      nome: c.nome,
      total: HOSPITAIS.filter((h) => slugDaCidade(h.cidade) === c.slug).reduce((n, h) => n + h.unidades.length, 0),
    })),
  ];

  const visiveis = CIDADES.filter((c) => cidade === 'todas' || c.slug === cidade);

  return (
    <div>
      <div role="radiogroup" aria-label="Cidade" className="flex flex-wrap gap-2">
        {opcoes.map((o) => (
          <button
            key={o.slug}
            type="button"
            role="radio"
            aria-checked={cidade === o.slug}
            onClick={() => setCidade(o.slug)}
            className={`rounded-2xl border-2 px-5 py-3 text-[15px] font-extrabold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004f78] ${
              cidade === o.slug
                ? 'border-[#009af2] bg-[#009af2] text-white'
                : 'border-[#d7ecfa] bg-white text-[#004f78] hover:border-[#009af2]'
            }`}
          >
            {o.nome}
            <span className={`ml-2 text-[13px] font-bold ${cidade === o.slug ? 'text-white' : 'text-[#2f5a73]'}`}>
              {o.total}
            </span>
          </button>
        ))}
      </div>
      <p className="mt-3 text-[14px] font-medium text-[#2f5a73]">O número é a quantidade de unidades em cada cidade.</p>

      <div className="mt-10 space-y-12">
        {visiveis.map((c) => {
          const hospitais = HOSPITAIS.filter((h) => slugDaCidade(h.cidade) === c.slug);
          return (
            <section key={c.slug} aria-labelledby={`cidade-${c.slug}`}>
              <h3 id={`cidade-${c.slug}`} className="font-display text-[34px] uppercase leading-none text-[#004f78] md:text-[42px]">
                {c.nome}
              </h3>
              <div className="mt-5 space-y-5">
                {hospitais.map((h) => (
                  <HospitalCard key={h.nome} h={h} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
