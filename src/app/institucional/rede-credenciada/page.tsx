import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Faq, Forma, HospitalCard, Lead, Realce, Secao, Titulo } from '@/components/institucional/Blocos';
import { BOTAO, BOTAO_CONTORNO } from '@/components/institucional/Chrome';
import { HOSPITAIS, QUIZ_HREF, TELEFONE, whatsappHref } from '@/components/institucional/dados';

export const metadata: Metadata = {
  title: 'Rede credenciada',
  description: 'Hospitais e clínicas veterinárias parceiras da Jofi em Fortaleza, São Luís e Jaboatão dos Guararapes.',
};

/**
 * A lista vem da API do checkout (`api.jofi.pet/v1/site/prestadores`, 18/11/2026): só aparece quem o
 * checkout aceita hoje. O site atual lista 12 parceiros e, na auditoria de 04/09, só 2 operavam.
 */
const DUVIDAS = [
  {
    p: 'Posso escolher a clínica?',
    r: 'Sim. Você escolhe a clínica parceira na hora de contratar, e é lá que o seu pet passa a ter o atendimento de rotina.',
  },
  {
    p: 'A Jofi atende na minha cidade?',
    r: `Hoje, as unidades são as listadas nesta página. Para saber de novidades na sua cidade, fale com a gente pelo ${TELEFONE}.`,
  },
  {
    p: 'O atendimento é presencial?',
    r: 'Sim. A Jofi não é telemedicina: o atendimento é nas clínicas e hospitais parceiros.',
  },
];

export default function Rede() {
  return (
    <>
      <section className="relative overflow-hidden bg-[#009af2]">
        <div className="relative z-10 mx-auto grid max-w-6xl items-end px-5 md:grid-cols-[1.2fr_0.8fr]">
          <div className="py-16 md:py-24">
            <Titulo tag="h1" className="md:!text-[96px]">
              Seu pet em <Realce>boas mãos</Realce>
            </Titulo>
            <Lead tom="claro" className="mt-6 max-w-xl">
              Você contrata a assinatura na clínica parceira que prefere, e seu pet passa a ter um lugar de
              referência para o cuidado do dia a dia.
            </Lead>
          </div>
          <div className="relative hidden h-[420px] md:block">
            <Forma nome="circulo-amarelo" className="bottom-[-18%] left-1/2 aspect-square w-[400px] -translate-x-1/2" />
            <Image
              src="/institucional/cao-97.png"
              alt="Cachorro sentado olhando para o lado"
              width={666}
              height={1000}
              priority
              sizes="280px"
              className="absolute bottom-0 left-1/2 h-[400px] w-auto -translate-x-1/2"
            />
          </div>
        </div>
      </section>

      <Secao fundo="suave">
        <Titulo tom="escuro" className="max-w-3xl">
          Onde contratar
        </Titulo>
        <Lead className="mt-4 max-w-2xl">
          Escolha a unidade mais perto de você. O botão abre o checkout da unidade escolhida.
        </Lead>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {HOSPITAIS.map((h) => (
            <HospitalCard key={h.nome} h={h} />
          ))}
        </div>
      </Secao>

      <Secao fundo="branco">
        <div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:gap-16">
          <div>
            <Titulo tom="escuro">Dúvidas sobre a rede</Titulo>
            <div className="mt-8">
              <a
                href={whatsappHref('Olá! Tenho uma dúvida sobre as clínicas parceiras da Jofi.')}
                target="_blank"
                rel="noopener noreferrer"
                className={BOTAO_CONTORNO}
              >
                Falar no WhatsApp
              </a>
            </div>
          </div>
          <Faq itens={DUVIDAS} />
        </div>
      </Secao>

      <Secao fundo="azul">
        <div className="mx-auto max-w-3xl text-center">
          <Titulo>
            Em dúvida sobre qual <Realce>assinatura?</Realce>
          </Titulo>
          <Lead tom="claro" className="mx-auto mt-6 max-w-xl">
            Responda a algumas perguntas sobre o seu pet e veja a cobertura que combina com ele.
          </Lead>
          <div className="mt-9">
            <Link href={QUIZ_HREF} className={BOTAO}>
              Descobrir minha cobertura <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </Secao>
    </>
  );
}
