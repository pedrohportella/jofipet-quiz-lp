import type { Metadata } from 'next';
import Link from 'next/link';
import { BOTAO } from '@/components/institucional/Chrome';
import { ClinicaCard, Realce, Secao, Titulo } from '@/components/institucional/Blocos';
import { CLINICAS, QUIZ_HREF } from '@/components/institucional/dados';

export const metadata: Metadata = {
  title: 'Rede credenciada',
  description: 'Hospitais e clínicas veterinárias parceiras da Jofi em Fortaleza, São Luís e Jaboatão dos Guararapes.',
};

/**
 * A lista vem da API do checkout (`api.jofi.pet/v1/site/prestadores`, 18/11/2026): só aparece quem o
 * checkout aceita hoje. O site atual lista 12 parceiros e, na auditoria de 04/09, só 2 operavam.
 */
export default function Rede() {
  return (
    <>
      <Secao fundo="azul">
        <h1 className="font-display text-[52px] uppercase leading-[1.04] text-white md:text-[88px]">
          Seu pet em <Realce>boas mãos</Realce>
        </h1>
        <p className="mt-6 max-w-2xl text-[20px] font-medium leading-snug text-white">
          Você contrata a assinatura na clínica parceira que prefere, e seu pet passa a ter um lugar de
          referência para o cuidado do dia a dia.
        </p>
      </Secao>

      <Secao fundo="suave">
        <Titulo tom="escuro" className="max-w-3xl">
          Onde contratar
        </Titulo>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {CLINICAS.map((c) => (
            <ClinicaCard key={c.unidadeId} c={c} />
          ))}
        </div>
        <p className="mt-8 max-w-3xl text-[14px] font-medium leading-relaxed text-[#2f5a73]">
          O botão abre o checkout da unidade escolhida. Quer saber se a Jofi atende na sua cidade? Fale com a
          gente pelo 0800 777 9745.
        </p>
      </Secao>

      <Secao fundo="branco">
        <div className="mx-auto max-w-3xl text-center">
          <Titulo tom="escuro">Em dúvida sobre qual assinatura?</Titulo>
          <p className="mx-auto mt-5 max-w-xl text-[18px] font-medium leading-snug text-[#2f5a73]">
            Responda a algumas perguntas sobre o seu pet e veja a cobertura que combina com ele.
          </p>
          <div className="mt-8">
            <Link href={QUIZ_HREF} className={BOTAO}>
              Descobrir minha cobertura <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </Secao>
    </>
  );
}
