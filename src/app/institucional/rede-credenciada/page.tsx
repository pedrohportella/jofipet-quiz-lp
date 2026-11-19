import type { Metadata } from 'next';

import Link from 'next/link';
import { Faq, Forma, Foto, Lead, Realce, Secao, Titulo } from '@/components/institucional/Blocos';
import { BOTAO, BOTAO_CONTORNO } from '@/components/institucional/Chrome';
import { Rede } from '@/components/institucional/Rede';
import { QUIZ_HREF, TELEFONE, whatsappHref } from '@/components/institucional/dados';

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

export default function PaginaRede() {
  return (
    <>
      <section className="relative overflow-hidden bg-[#009af2]">
        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-5 py-14 md:grid-cols-[1.1fr_0.9fr] md:gap-14 md:py-24">
          <div>
            <Titulo tag="h1" className="md:!text-[96px]">
              Seu pet em <Realce>boas mãos</Realce>
            </Titulo>
            <Lead tom="claro" className="mt-6 max-w-xl">
              Você contrata a assinatura na clínica parceira que prefere, e seu pet passa a ter um lugar de
              referência para o cuidado do dia a dia.
            </Lead>
          </div>
          <div className="relative mx-auto h-[380px] w-full max-w-md md:h-[500px]">
            <Forma nome="circulo-amarelo" className="-right-4 -top-8 aspect-square w-40 md:-right-10 md:w-64" />
            <div className="absolute left-0 top-0 h-[78%] w-[56%] -rotate-3">
              <Foto
                src="gato-branco-colo.jpg"
                alt="Gato branco no colo de uma veterinária, em clínica parceira"
                className="h-full w-full"
                posicao="50% 40%"
                prioridade
                sizes="(min-width: 1024px) 260px, 50vw"
              />
            </div>
            <div className="absolute bottom-0 right-0 h-[66%] w-[48%] rotate-3">
              <Foto
                src="maltes-poltrona.jpg"
                alt="Cachorro maltês sentado numa poltrona, em clínica parceira"
                className="h-full w-full"
                posicao="50% 45%"
                sizes="(min-width: 1024px) 230px, 45vw"
              />
            </div>
            <Forma nome="estrela-laranja" className="-bottom-4 left-4 h-20 w-20 md:-bottom-6 md:left-6 md:h-28 md:w-28" />
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
        <div className="mt-12">
          <Rede />
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
