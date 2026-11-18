import Image from 'next/image';
import Link from 'next/link';
import { BOTAO, BOTAO_CONTORNO } from '@/components/institucional/Chrome';
import { ClinicaCard, Estrelas, PlanoCard, Realce, Secao, Titulo } from '@/components/institucional/Blocos';
import { CLINICAS, PASSOS, PLANOS, QUIZ_HREF } from '@/components/institucional/dados';

const MOTIVOS = [
  {
    t: 'Uma clínica de referência',
    d: 'Seu pet é atendido por quem já conhece o histórico dele, na clínica parceira que você escolhe.',
  },
  {
    t: 'Valor claro antes de pagar',
    d: 'O preço muda aos 8 anos do pet, e você vê o valor da sua assinatura antes de fechar.',
  },
  {
    t: 'Consulta liberada desde o primeiro dia',
    d: 'Nas quatro assinaturas, a consulta clínica não tem carência. Exames e procedimentos têm prazos por cobertura.',
  },
  {
    t: 'Sem burocracia para usar',
    d: 'Depois de cumprida a carência, é só usar: você não precisa pedir autorização à Jofi.',
  },
  {
    t: 'Mais de um pet?',
    d: 'Quem cadastra mais pets tem vantagens. Fale com a gente e confira.',
  },
];

export default function Inicio() {
  return (
    <>
      {/* 1. Abertura */}
      <Secao fundo="azul" className="!overflow-hidden">
        <Estrelas />
        <div className="grid items-center gap-10 md:grid-cols-[1.15fr_0.85fr]">
          <div>
            <h1 className="font-display text-[56px] uppercase leading-[1.04] tracking-[0.004em] text-white md:text-[96px]">
              Cuidado começa com <Realce>clareza.</Realce>
            </h1>
            <p className="mt-6 max-w-xl text-[20px] font-medium leading-snug text-white md:text-[22px]">
              A Jofi conecta você com quem vai cuidar do seu pet. Uma assinatura mensal, na clínica
              parceira que você escolhe.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={QUIZ_HREF} className={BOTAO}>
                Descobrir minha cobertura <span aria-hidden>→</span>
              </Link>
              <Link href="/institucional/coberturas" className={BOTAO_CONTORNO}>
                Ver as assinaturas
              </Link>
            </div>
            <p className="mt-3 text-[14px] font-medium text-white">
              Leva cerca de um minuto e você vê a recomendação na hora.
            </p>
          </div>
          <div className="relative mx-auto h-[360px] w-full max-w-[320px] md:h-[520px]">
            <Image
              src="/institucional/cao-103.png"
              alt="Cachorro sentado olhando para cima"
              fill
              priority
              sizes="(min-width: 768px) 360px, 320px"
              className="object-contain object-bottom"
            />
          </div>
        </div>
      </Secao>

      {/* 2. Como funciona */}
      <Secao fundo="branco">
        <Titulo tom="escuro" className="max-w-2xl">
          Como a Jofi funciona
        </Titulo>
        <ol className="mt-10 grid gap-5 md:grid-cols-3">
          {PASSOS.map((p) => (
            <li key={p.n} className="rounded-[32px] bg-[#eaf6fe] p-7">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ff9625] text-[22px] font-extrabold text-white">
                {p.n}
              </span>
              <h3 className="mt-5 font-display text-[34px] uppercase leading-[1.05] text-[#009af2]">
                {p.titulo}
              </h3>
              <p className="mt-3 text-[16px] font-medium leading-relaxed text-[#2f5a73]">{p.texto}</p>
            </li>
          ))}
        </ol>
      </Secao>

      {/* 3. Assinaturas */}
      <Secao fundo="suave" id="assinaturas">
        <Titulo tom="escuro" className="max-w-3xl">
          Quatro assinaturas, uma para cada momento
        </Titulo>
        <p className="mt-4 max-w-2xl text-[18px] font-medium leading-relaxed text-[#2f5a73]">
          A partir de R$ 49,90 por mês. Os valores mudam quando o pet completa 8 anos, e o Sereninho
          é o único que não muda.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {PLANOS.map((p) => (
            <PlanoCard key={p.chave} plano={p} destaque={p.chave === 'parceiro'} />
          ))}
        </div>
        <div className="mt-10">
          <Link href="/institucional/coberturas" className={BOTAO_CONTORNO}>
            Ver tudo o que cada assinatura cobre
          </Link>
        </div>
      </Secao>

      {/* 4. Motivos */}
      <Secao fundo="azul">
        <Estrelas />
        <Titulo className="max-w-3xl">
          Cuidado sem <Realce>complicação</Realce>
        </Titulo>
        <ul className="mt-10 grid gap-4 md:grid-cols-2">
          {MOTIVOS.map((m) => (
            <li key={m.t} className="rounded-[32px] bg-white p-6">
              <h3 className="text-[19px] font-extrabold leading-snug text-[#004f78]">{m.t}</h3>
              <p className="mt-2 text-[16px] font-medium leading-relaxed text-[#2f5a73]">{m.d}</p>
            </li>
          ))}
        </ul>
      </Secao>

      {/* 5. Rede */}
      <Secao fundo="branco">
        <Titulo tom="escuro" className="max-w-3xl">
          A rede credenciada
        </Titulo>
        <p className="mt-4 max-w-2xl text-[18px] font-medium leading-relaxed text-[#2f5a73]">
          Hospitais e clínicas parceiras onde você contrata e usa a assinatura. Hoje, em Fortaleza,
          São Luís e Jaboatão dos Guararapes.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {CLINICAS.map((c) => (
            <ClinicaCard key={c.unidadeId} c={c} />
          ))}
        </div>
        <div className="mt-10">
          <Link href="/institucional/rede-credenciada" className={BOTAO_CONTORNO}>
            Ver a rede credenciada
          </Link>
        </div>
      </Secao>

      {/* 6. Para hospitais */}
      <Secao fundo="laranja">
        <Estrelas />
        <div className="grid items-center gap-8 md:grid-cols-[1.3fr_0.7fr]">
          <div>
            <Titulo>Seu hospital pode ser parceiro</Titulo>
            <p className="mt-5 max-w-xl rounded-2xl bg-white px-5 py-4 text-[17px] font-bold leading-snug text-[#004f78]">
              A Jofi cuida da venda, do pós-venda, do suporte e da cobrança, e faz o marketing em
              parceria com a clínica.
            </p>
          </div>
          <div className="md:text-right">
            <Link
              href="/institucional/seja-parceiro"
              className="inline-flex items-center justify-center rounded-2xl bg-white px-7 py-[15px] text-[15px] font-extrabold uppercase tracking-[0.02em] text-[#004f78] no-underline transition hover:brightness-95"
            >
              Quero ser parceiro
            </Link>
          </div>
        </div>
      </Secao>

      {/* 7. Fecho */}
      <Secao fundo="azul">
        <div className="mx-auto max-w-3xl text-center">
          <Titulo>
            Já conhece a assinatura <Realce>Jofi?</Realce>
          </Titulo>
          <p className="mx-auto mt-5 max-w-xl text-[19px] font-medium leading-snug text-white">
            Responda a algumas perguntas sobre o seu pet e veja qual cobertura combina com ele.
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
