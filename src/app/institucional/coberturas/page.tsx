import type { Metadata } from 'next';
import Link from 'next/link';
import { Assinaturas } from '@/components/institucional/Assinaturas';
import { Forma, Foto, Lead, Realce, Secao, Titulo } from '@/components/institucional/Blocos';
import { BOTAO, BOTAO_CONTORNO } from '@/components/institucional/Chrome';
import { MATRIZ, PLANOS, QUIZ_HREF, whatsappHref } from '@/components/institucional/dados';

export const metadata: Metadata = {
  title: 'Coberturas e assinaturas',
  description: 'Compare as quatro assinaturas da Jofi: o que cada uma cobre, a carência e o valor por idade do pet.',
};

const COR_COLUNA = ['bg-[#009af2]', 'bg-[#ff9625]', 'bg-[#009af2]', 'bg-[#ff9625]'];

/** Célula da matriz: "Liberado" ganha destaque, "—" some, prazo fica em texto normal. */
function Celula({ v }: { v: string }) {
  if (v === '—') return <span className="text-[#9bb7c9]">Não cobre</span>;
  if (v === 'Liberado')
    return (
      <span className="inline-flex rounded-xl bg-[#ffff44] px-2.5 py-1 text-[13px] font-extrabold uppercase tracking-[0.04em] text-[#004f78]">
        Liberado
      </span>
    );
  return <span className="font-bold text-[#004f78]">{v}</span>;
}

export default function Coberturas() {
  return (
    <>
      <section className="relative overflow-hidden bg-[#009af2]">
        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-5 py-14 md:grid-cols-[1.15fr_0.85fr] md:gap-14 md:py-24">
          <div>
            <Titulo tag="h1" className="md:!text-[96px]">
              Cada pet, uma <Realce>cobertura</Realce>
            </Titulo>
            <Lead tom="claro" className="mt-6 max-w-xl">
              Quatro assinaturas, do essencial à cobertura mais ampla. Compare o que cada uma cobre, a carência de
              cada item e o valor para a idade do seu pet.
            </Lead>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={QUIZ_HREF} className={BOTAO}>
                Descobrir minha cobertura <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-sm">
            <Forma nome="circulo-amarelo" className="-bottom-8 -left-8 aspect-square w-40 md:-bottom-12 md:-left-12 md:w-60" />
            <Foto
              src="cao-cadeira-olhando.jpg"
              alt="Cachorro sentado numa cadeira branca, olhando para cima"
              className="aspect-[4/5] w-full"
              posicao="50% 40%"
              sizes="(min-width: 1024px) 400px, 90vw"
            />
            <Forma nome="estrela-laranja" className="-right-6 -top-8 h-24 w-24 md:-right-8 md:h-32 md:w-32" />
          </div>
        </div>
      </section>

      <Secao fundo="suave">
        <Titulo tom="escuro" className="max-w-3xl">
          Quanto custa
        </Titulo>
        <Lead className="mt-4 max-w-2xl">Escolha a idade do seu pet para ver o valor de cada assinatura.</Lead>
        <div className="mt-10">
          <Assinaturas completo />
        </div>
        <p className="mt-8 max-w-3xl text-[14px] font-medium leading-relaxed text-[#2f5a73]">
          Valores mensais por pet, conferidos em 18/11/2026. A taxa de adesão, quando houver, aparece no resumo antes
          do pagamento. O Parceiro e o Melhor Amigo também têm versões anuais.
        </p>
      </Secao>

      <Secao fundo="branco">
        <Titulo tom="escuro" className="max-w-4xl">
          O que cada uma cobre, e quando libera
        </Titulo>
        <Lead className="mt-4 max-w-3xl">
          Carência é o prazo até uma cobertura ficar liberada. Depois dela, você usa sem pedir autorização à Jofi.
        </Lead>

        {/* Matriz: rola na horizontal no celular, com a primeira coluna fixa */}
        <div className="mt-10 overflow-x-auto rounded-[32px] border border-[#d7ecfa]">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <caption className="sr-only">Cobertura e carência por assinatura</caption>
            <thead>
              <tr>
                <th scope="col" className="sticky left-0 z-10 bg-white p-4 text-[13px] font-extrabold uppercase tracking-[0.08em] text-[#2f5a73]">
                  Cobertura
                </th>
                {PLANOS.map((p, i) => (
                  <th key={p.chave} scope="col" className={`${COR_COLUNA[i]} p-4 font-display text-[24px] uppercase leading-none text-white`}>
                    {p.nome}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MATRIZ.map((linha, r) => (
                <tr key={linha.item} className={r % 2 === 0 ? 'bg-white' : 'bg-[#f6fbff]'}>
                  <th
                    scope="row"
                    className={`sticky left-0 z-10 p-4 text-[15px] font-extrabold text-[#004f78] ${r % 2 === 0 ? 'bg-white' : 'bg-[#f6fbff]'}`}
                  >
                    {linha.item}
                  </th>
                  {linha.celulas.map((c, i) => (
                    <td key={i} className="p-4 text-[14px] font-medium">
                      <Celula v={c} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-6 max-w-3xl text-[14px] font-medium leading-relaxed text-[#2f5a73]">
          Prazos da cartilha de outubro de 2026. Os prazos do plano anual podem ser diferentes. Limites por ano e
          detalhes de cada procedimento estão na cartilha completa. É só pedir!
        </p>
        <div className="mt-6">
          <a
            href={whatsappHref('Olá! Gostaria de receber a cartilha com as carências das assinaturas da Jofi.')}
            target="_blank"
            rel="noopener noreferrer"
            className={BOTAO_CONTORNO}
          >
            Pedir a cartilha no WhatsApp
          </a>
        </div>
      </Secao>

      <Secao fundo="azul">
        <div className="mx-auto max-w-3xl text-center">
          <Titulo>
            Qual combina com o <Realce>seu pet?</Realce>
          </Titulo>
          <Lead tom="claro" className="mx-auto mt-6 max-w-xl">
            Responda a algumas perguntas e veja a recomendação na hora.
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
