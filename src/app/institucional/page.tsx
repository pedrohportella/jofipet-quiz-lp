import Image from 'next/image';
import Link from 'next/link';
import { Assinaturas } from '@/components/institucional/Assinaturas';
import {
  BolaIcone,
  Etiqueta,
  EstrelasBrancas,
  Faq,
  Forma,
  HospitalCard,
  Lead,
  Realce,
  Secao,
  Titulo,
} from '@/components/institucional/Blocos';
import { BOTAO, BOTAO_BRANCO, BOTAO_CONTORNO } from '@/components/institucional/Chrome';
import {
  COBRE,
  FAQ,
  HOSPITAIS,
  MOTIVOS,
  PASSOS,
  QUIZ_HREF,
  whatsappHref,
} from '@/components/institucional/dados';

const DESTAQUES = [
  { icone: 'check', texto: 'Consulta liberada desde o primeiro dia' },
  { icone: 'etiqueta', texto: 'A partir de R$ 49,90 por mês' },
  { icone: 'casa', texto: 'Clínica parceira que você escolhe' },
] as const;

export default function Inicio() {
  return (
    <>
      {/* 1. Abertura: título grande, cão saindo pela borda inferior, forma amarela atrás */}
      <section className="relative overflow-hidden bg-[#009af2]">
        <EstrelasBrancas />
        <div className="relative z-10 mx-auto grid max-w-6xl items-end gap-0 px-5 md:grid-cols-[1.12fr_0.88fr]">
          <div className="pb-12 pt-14 md:pb-24 md:pt-24">
            <Etiqueta>Assinatura de saúde pet</Etiqueta>
            <h1 className="mt-6 font-display text-[60px] uppercase leading-[1] tracking-[0.004em] text-white md:text-[112px]">
              Cuidado começa com <Realce>clareza.</Realce>
            </h1>
            <Lead tom="claro" className="mt-6 max-w-xl">
              A Jofi conecta você com quem vai cuidar do seu pet. Uma assinatura mensal, na clínica parceira que
              você escolhe.
            </Lead>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={QUIZ_HREF} className={BOTAO}>
                Descobrir minha cobertura <span aria-hidden>→</span>
              </Link>
              <a href="#assinaturas" className={BOTAO_BRANCO}>
                Ver as assinaturas
              </a>
            </div>
            <ul className="mt-9 grid grid-cols-1 gap-3 md:max-w-2xl md:grid-cols-3">
              {DESTAQUES.map((d) => (
                <li key={d.texto} className="flex items-center gap-3">
                  <BolaIcone nome={d.icone} tamanho="h-10 w-10" />
                  <span className="text-[14px] font-bold leading-snug text-white">{d.texto}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative h-[340px] md:h-[640px]">
            <Forma nome="circulo-amarelo" className="bottom-[-18%] left-1/2 aspect-square w-[340px] -translate-x-1/2 md:w-[500px]" />
            <Forma nome="estrela-laranja" className="right-2 top-6 h-24 w-24 md:right-0 md:top-24 md:h-32 md:w-32" />
            <Image
              src="/institucional/cao-103.png"
              alt="Cachorro sentado olhando para cima"
              width={666}
              height={1000}
              priority
              sizes="(min-width: 768px) 420px, 280px"
              className="absolute bottom-0 left-1/2 h-[330px] w-auto -translate-x-1/2 md:h-[600px]"
            />
          </div>
        </div>
      </section>

      {/* 2. Como funciona: título à esquerda, três passos à direita */}
      <Secao fundo="branco">
        <div className="grid gap-12 md:grid-cols-[0.9fr_1.1fr] md:gap-20">
          <div>
            <Titulo tom="escuro">Como a Jofi funciona</Titulo>
            <Lead className="mt-5 max-w-md">Do primeiro clique à clínica, em três passos.</Lead>
            <div className="mt-8">
              <Link href={QUIZ_HREF} className={BOTAO}>
                Começar agora <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
          <ol className="divide-y divide-[#d7ecfa] border-y border-[#d7ecfa]">
            {PASSOS.map((p) => (
              <li key={p.n} className="flex gap-5 py-7">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#ff9625] font-display text-[30px] text-white">
                  {p.n}
                </span>
                <div>
                  <h3 className="font-display text-[34px] uppercase leading-[1.05] text-[#009af2]">{p.titulo}</h3>
                  <p className="mt-2 text-[17px] font-medium leading-relaxed text-[#2f5a73]">{p.texto}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Secao>

      {/* 3. Assinaturas */}
      <Secao fundo="suave" id="assinaturas">
        <Titulo tom="escuro" className="max-w-4xl">
          Uma assinatura para cada <Realce>momento</Realce>
        </Titulo>
        <Lead className="mt-5 max-w-2xl">
          A partir de R$ 49,90 por mês. Escolha a idade do seu pet para ver o valor de cada assinatura.
        </Lead>
        <div className="mt-10">
          <Assinaturas />
        </div>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link href="/institucional/coberturas" className={BOTAO_CONTORNO}>
            Comparar tudo o que cada uma cobre
          </Link>
        </div>
      </Secao>

      {/* 4. O que cobre */}
      <Secao fundo="laranja">
        <div className="grid items-start gap-10 md:grid-cols-[0.9fr_1.1fr] md:gap-16">
          <div>
            <Titulo>Do check-up à emergência</Titulo>
            <p className="mt-6 max-w-md rounded-2xl bg-white px-5 py-4 text-[17px] font-bold leading-snug text-[#004f78]">
              O que está coberto muda de uma assinatura para outra. Compare lado a lado na página de coberturas.
            </p>
            <div className="mt-8">
              <Link href="/institucional/coberturas" className={BOTAO_BRANCO}>
                Ver a comparação <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
          <ul className="flex flex-wrap gap-2.5">
            {COBRE.map((c) => (
              <li
                key={c}
                className="rounded-2xl bg-white px-4 py-2.5 text-[15px] font-extrabold text-[#004f78]"
              >
                {c}
              </li>
            ))}
          </ul>
        </div>
      </Secao>

      {/* 5. Por que a Jofi: foto à esquerda, razões num cartão branco */}
      <Secao fundo="azul">
        <div className="grid items-center gap-10 md:grid-cols-[0.85fr_1.15fr] md:gap-16">
          <div className="relative mx-auto w-full max-w-md">
            <div className="relative h-[420px] md:h-[560px]">
              <Forma nome="circulo-amarelo" className="bottom-[-6%] left-1/2 aspect-square w-[330px] -translate-x-1/2 md:w-[440px]" />
              <Forma nome="quadrado-laranja" className="left-2 top-4 h-24 w-24 rotate-12 md:left-0 md:h-32 md:w-32" />
              <Image
                src="/institucional/cao-97.png"
                alt="Cachorro sentado com a língua para fora"
                width={666}
                height={1000}
                sizes="(min-width: 768px) 380px, 260px"
                className="absolute bottom-0 left-1/2 h-[400px] w-auto -translate-x-1/2 md:h-[540px]"
              />
            </div>
          </div>
          <div>
            <Titulo>
              Por que ter uma <Realce>Jofi</Realce>
            </Titulo>
            <ul className="mt-8 divide-y divide-[#d7ecfa] rounded-[32px] bg-white px-6">
              {MOTIVOS.map((m) => (
                <li key={m.t} className="flex gap-4 py-6">
                  <BolaIcone nome={m.icone} />
                  <div>
                    <h3 className="text-[18px] font-extrabold leading-snug text-[#004f78]">{m.t}</h3>
                    <p className="mt-1 text-[15px] font-medium leading-relaxed text-[#2f5a73]">{m.d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Secao>

      {/* 6. Rede credenciada */}
      <Secao fundo="branco">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <Titulo tom="escuro">A rede credenciada</Titulo>
            <Lead className="mt-5">
              Hospitais e clínicas parceiras onde você contrata e usa a assinatura. Hoje, em Fortaleza, São Luís e
              Jaboatão dos Guararapes.
            </Lead>
          </div>
          <Link href="/institucional/rede-credenciada" className={BOTAO_CONTORNO}>
            Ver todas as unidades
          </Link>
        </div>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {HOSPITAIS.map((h) => (
            <HospitalCard key={h.nome} h={h} />
          ))}
        </div>
      </Secao>

      {/* 7. Perguntas frequentes */}
      <Secao fundo="suave">
        <div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:gap-16">
          <div>
            <Titulo tom="escuro">Perguntas frequentes</Titulo>
            <Lead className="mt-5 max-w-sm">Não achou o que procurava? Fale com a gente.</Lead>
            <div className="mt-8">
              <a
                href={whatsappHref('Olá! Tenho uma dúvida sobre as assinaturas da Jofi.')}
                target="_blank"
                rel="noopener noreferrer"
                className={BOTAO_CONTORNO}
              >
                Falar no WhatsApp
              </a>
            </div>
          </div>
          <Faq itens={FAQ} />
        </div>
      </Secao>

      {/* 8. Para hospitais */}
      <Secao fundo="laranja">
        <Forma nome="circulo-amarelo" className="-bottom-24 right-4 hidden h-72 w-72 md:block" />
        <Image
          src="/institucional/cao-94.png"
          alt=""
          aria-hidden
          width={666}
          height={1000}
          sizes="260px"
          className="pointer-events-none absolute bottom-0 right-10 hidden h-[360px] w-auto md:block"
        />
        <div className="max-w-2xl">
          <Titulo>Seu hospital pode ser parceiro</Titulo>
          <p className="mt-6 rounded-2xl bg-white px-5 py-4 text-[17px] font-bold leading-snug text-[#004f78]">
            A Jofi cuida da venda, do pós-venda, do suporte e da cobrança, e faz o marketing em parceria com a
            clínica.
          </p>
          <div className="mt-8">
            <Link href="/institucional/seja-parceiro" className={BOTAO_BRANCO}>
              Quero ser parceiro
            </Link>
          </div>
        </div>
      </Secao>

      {/* 9. Fecho */}
      <Secao fundo="azul">
        <EstrelasBrancas />
        <div className="mx-auto max-w-3xl text-center">
          <Titulo>
            Já conhece a assinatura <Realce>Jofi?</Realce>
          </Titulo>
          <Lead tom="claro" className="mx-auto mt-6 max-w-xl">
            Responda a algumas perguntas sobre o seu pet e veja qual cobertura combina com ele.
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
