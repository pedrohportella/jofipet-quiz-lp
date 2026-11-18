import type { Metadata } from 'next';

import { BolaIcone, EstrelasBrancas, Forma, Foto, Lead, Realce, Secao, Titulo } from '@/components/institucional/Blocos';
import { BOTAO, BOTAO_BRANCO } from '@/components/institucional/Chrome';
import { whatsappHref } from '@/components/institucional/dados';

export const metadata: Metadata = {
  title: 'Seja parceiro',
  description: 'Seu hospital ou clínica veterinária pode ser parceiro da Jofi.',
};

/**
 * Entregas: o que o próprio site da Jofi já diz sobre a parceria (jofi.pet, 18/11/2026), mais curto.
 * Nenhum número de retorno ou de prazo: a Jofi não deu base para isso.
 */
const ENTREGAS = [
  { t: 'Venda', d: 'A Jofi cuida de todo o processo de venda da cobertura.', icone: 'etiqueta' },
  { t: 'Pós-venda e suporte', d: 'Pós-venda e suporte diário para a clínica.', icone: 'casa' },
  { t: 'Sistema', d: 'Implantação do sistema na clínica.', icone: 'chave' },
  { t: 'Gestão financeira', d: 'Gestão financeira e cobrança de inadimplentes.', icone: 'check' },
  { t: 'Marketing em parceria', d: 'Trabalho de marketing feito junto com a clínica ou o hospital.', icone: 'seta' },
] as const;

const MENSAGEM = 'Olá! Tenho uma clínica ou hospital veterinário e quero conhecer a parceria com a Jofi.';

export default function Parceiro() {
  return (
    <>
      <section className="relative overflow-hidden bg-[#ff9625]">
        <EstrelasBrancas opacidade={0.25} />
        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-5 py-14 md:grid-cols-[1.1fr_0.9fr] md:gap-14 md:py-24">
          <div>
            <Titulo tag="h1" className="md:!text-[96px]">
              Seu hospital pode ser <Realce>parceiro</Realce>
            </Titulo>
            <p className="mt-6 max-w-xl rounded-2xl bg-white px-5 py-4 text-[18px] font-bold leading-snug text-[#004f78]">
              A Jofi é a plataforma de saúde pet que cuida da venda, do pós-venda e da gestão da assinatura, em
              parceria com a clínica.
            </p>
            <div className="mt-8">
              <a href={whatsappHref(MENSAGEM)} target="_blank" rel="noopener noreferrer" className={BOTAO_BRANCO}>
                Quero ser parceiro
              </a>
            </div>
          </div>
          <div className="relative mx-auto h-[380px] w-full max-w-md md:h-[500px]">
            <Forma nome="circulo-amarelo" className="-bottom-6 left-1/2 aspect-square w-44 -translate-x-1/2 md:-bottom-10 md:w-64" />
            <div className="absolute left-0 top-0 h-[80%] w-[52%] -rotate-2">
              <Foto
                src="vets-care-fachada-24h.jpg"
                alt="Fachada do Vets Care, hospital veterinário parceiro em Fortaleza"
                className="h-full w-full"
                posicao="50% 38%"
                prioridade
                sizes="(min-width: 1024px) 240px, 50vw"
              />
            </div>
            <div className="absolute bottom-0 right-0 h-[80%] w-[52%] rotate-2">
              <Foto
                src="quatro-patas-fachada.jpg"
                alt="Fachada do Hospital Veterinário Quatro Patas, parceiro em São Luís"
                className="h-full w-full"
                posicao="50% 55%"
                sizes="(min-width: 1024px) 240px, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      <Secao fundo="branco">
        <Titulo tom="escuro" className="max-w-3xl">
          O que a Jofi faz pela clínica
        </Titulo>
        <ul className="mt-12 grid gap-x-12 gap-y-0 md:grid-cols-2">
          {ENTREGAS.map((e) => (
            <li key={e.t} className="flex gap-5 border-b border-[#d7ecfa] py-7">
              <BolaIcone nome={e.icone} tamanho="h-14 w-14" />
              <div>
                <h3 className="font-display text-[32px] uppercase leading-[1.05] text-[#009af2]">{e.t}</h3>
                <p className="mt-2 text-[16px] font-medium leading-relaxed text-[#2f5a73]">{e.d}</p>
              </div>
            </li>
          ))}
        </ul>
      </Secao>

      <Secao fundo="azul">
        <EstrelasBrancas />
        <div className="mx-auto max-w-3xl text-center">
          <Titulo>
            Vamos <Realce>conversar?</Realce>
          </Titulo>
          <Lead tom="claro" className="mx-auto mt-6 max-w-xl">
            Conte sobre a sua clínica e a equipe da Jofi apresenta como funciona a parceria.
          </Lead>
          <div className="mt-9">
            <a href={whatsappHref(MENSAGEM)} target="_blank" rel="noopener noreferrer" className={BOTAO}>
              Falar no WhatsApp <span aria-hidden>→</span>
            </a>
          </div>
        </div>
      </Secao>
    </>
  );
}
