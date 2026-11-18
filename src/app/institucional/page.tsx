
import Link from 'next/link';
import { Assinaturas } from '@/components/institucional/Assinaturas';
import {
  BolaIcone,
  Etiqueta,
  EstrelasBrancas,
  Foto,
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
        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-5 py-14 md:grid-cols-[1fr_1fr] md:gap-14 md:py-24">
          <div>
            <Etiqueta>Assinatura de saúde pet</Etiqueta>
            <h1 className="mt-6 font-display text-[60px] uppercase leading-[1] tracking-[0.004em] text-white md:text-[84px] lg:text-[92px]">
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

          <div className="relative">
            <Forma nome="circulo-amarelo" className="-bottom-10 -left-8 aspect-square w-44 md:-bottom-14 md:-left-14 md:w-72" />
            <Foto
              src="equipe-duas-tutoras-cao.jpg"
              alt="Duas tutoras de camisa azul da Jofi abraçando um cachorro, rindo"
              className="aspect-[5/4] w-full shadow-none md:aspect-[6/5]"
              posicao="50% 40%"
              prioridade
              sizes="(min-width: 1024px) 560px, 100vw"
            />
            <Forma nome="estrela-laranja" className="-right-5 -top-7 h-24 w-24 md:-right-8 md:-top-10 md:h-36 md:w-36" />
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
            <Forma nome="quadrado-amarelo" className="-left-6 -top-6 h-24 w-24 rotate-12 md:-left-10 md:-top-8 md:h-36 md:w-36" />
            <Foto
              src="cao-cadeira-feliz.jpg"
              alt="Cachorro sentado numa cadeira branca, de boca aberta, parecendo sorrir"
              className="aspect-[4/5] w-full"
              posicao="50% 45%"
              sizes="(min-width: 1024px) 420px, 90vw"
            />
            <Forma nome="estrela-laranja" className="-bottom-8 -right-6 h-28 w-28 md:-bottom-10 md:-right-10 md:h-40 md:w-40" />
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
        <div className="grid items-center gap-10 md:grid-cols-[1.1fr_0.9fr] md:gap-16">
        <div>
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
        <div className="relative">
          <Forma nome="circulo-amarelo" className="-bottom-8 -right-6 aspect-square w-40 md:-bottom-12 md:-right-10 md:w-60" />
          <Foto
            src="equipe-dois-tutores-cao.jpg"
            alt="Dois tutores de camisas azul e laranja da Jofi sentados com um cachorro"
            className="aspect-[4/3] w-full"
            sizes="(min-width: 1024px) 480px, 100vw"
          />
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
