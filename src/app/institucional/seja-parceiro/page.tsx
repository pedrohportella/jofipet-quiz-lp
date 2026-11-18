import type { Metadata } from 'next';
import Image from 'next/image';
import { BOTAO } from '@/components/institucional/Chrome';
import { Estrelas, Realce, Secao, Titulo } from '@/components/institucional/Blocos';
import { whatsappHref } from '@/components/institucional/dados';

export const metadata: Metadata = {
  title: 'Seja parceiro',
  description: 'Seu hospital ou clínica veterinária pode ser parceiro da Jofi.',
};

/**
 * Texto das entregas: o que o próprio site da Jofi já diz sobre a parceria (jofi.pet, 18/11/2026),
 * reescrito mais curto. Nenhum número de retorno ou de prazo: a Jofi não deu base para isso.
 */
const ENTREGAS = [
  { t: 'Venda', d: 'A Jofi cuida de todo o processo de venda da cobertura.' },
  { t: 'Pós-venda e suporte', d: 'Pós-venda e suporte diário para a clínica.' },
  { t: 'Sistema', d: 'Implantação do sistema na clínica.' },
  { t: 'Gestão financeira', d: 'Gestão financeira e cobrança de inadimplentes.' },
  { t: 'Marketing em parceria', d: 'Trabalho de marketing feito junto com a clínica ou o hospital.' },
];

export default function Parceiro() {
  return (
    <>
      <Secao fundo="laranja">
        <Estrelas />
        <div className="grid items-center gap-8 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h1 className="font-display text-[52px] uppercase leading-[1.04] text-white md:text-[88px]">
              Seu hospital pode ser <Realce>parceiro</Realce>
            </h1>
            <p className="mt-6 max-w-xl rounded-2xl bg-white px-5 py-4 text-[18px] font-bold leading-snug text-[#004f78]">
              A Jofi é a plataforma de saúde pet que cuida da venda, do pós-venda e da gestão da
              assinatura, em parceria com a clínica.
            </p>
            <div className="mt-8">
              <a
                href={whatsappHref('Olá! Tenho uma clínica ou hospital veterinário e quero conhecer a parceria com a Jofi.')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-7 py-[15px] text-[15px] font-extrabold uppercase tracking-[0.02em] text-[#004f78] no-underline transition hover:brightness-95"
              >
                Quero ser parceiro
              </a>
            </div>
          </div>
          <div className="relative mx-auto hidden h-[420px] w-full max-w-[300px] md:block">
            <Image
              src="/institucional/cao-94.png"
              alt="Cachorro sentado dando a pata"
              fill
              sizes="300px"
              className="object-contain object-bottom"
            />
          </div>
        </div>
      </Secao>

      <Secao fundo="branco">
        <Titulo tom="escuro" className="max-w-3xl">
          O que a Jofi faz pela clínica
        </Titulo>
        <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {ENTREGAS.map((e) => (
            <li key={e.t} className="rounded-[32px] bg-[#eaf6fe] p-7">
              <h3 className="font-display text-[32px] uppercase leading-[1.05] text-[#009af2]">{e.t}</h3>
              <p className="mt-3 text-[16px] font-medium leading-relaxed text-[#2f5a73]">{e.d}</p>
            </li>
          ))}
        </ul>
      </Secao>

      <Secao fundo="azul">
        <div className="mx-auto max-w-3xl text-center">
          <Titulo>
            Vamos <Realce>conversar?</Realce>
          </Titulo>
          <p className="mx-auto mt-5 max-w-xl text-[19px] font-medium leading-snug text-white">
            Conte sobre a sua clínica e a equipe da Jofi apresenta como funciona a parceria.
          </p>
          <div className="mt-8">
            <a
              href={whatsappHref('Olá! Tenho uma clínica ou hospital veterinário e quero conhecer a parceria com a Jofi.')}
              target="_blank"
              rel="noopener noreferrer"
              className={BOTAO}
            >
              Falar no WhatsApp <span aria-hidden>→</span>
            </a>
          </div>
        </div>
      </Secao>
    </>
  );
}
