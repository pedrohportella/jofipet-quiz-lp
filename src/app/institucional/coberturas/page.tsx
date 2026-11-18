import type { Metadata } from 'next';
import Link from 'next/link';
import { BOTAO, BOTAO_CONTORNO } from '@/components/institucional/Chrome';
import { PlanoCard, Realce, Secao, Titulo } from '@/components/institucional/Blocos';
import { PLANOS, QUIZ_HREF, whatsappHref } from '@/components/institucional/dados';

export const metadata: Metadata = {
  title: 'Coberturas e assinaturas',
  description: 'As quatro assinaturas da Jofi, o que cada uma cobre e quanto custa por idade do pet.',
};

/**
 * Carências: resumo da seção "Carências por assinatura" de 03-oferta-e-claims.md (cartilhas de
 * 02/10/2026). Só entra o que é verdade para as quatro assinaturas; prazo item a item fica na cartilha.
 */
const CARENCIAS = [
  {
    t: 'Liberado desde o primeiro dia',
    d: 'A consulta clínica, nas quatro assinaturas. A urgência e emergência, do Sereno em diante. No Parceiro e no Melhor Amigo, as vacinas também.',
  },
  {
    t: 'Prazos de 30 a 120 dias',
    d: 'Aplicação de medicamentos, sedação, curativos, exames de sangue e de imagem, biópsia e anestesia seguem prazos por item.',
  },
  {
    t: 'Prazos de 180 a 360 dias',
    d: 'Cirurgias, tomografia, ressonância e tratamentos dentários têm os prazos mais longos.',
  },
];

export default function Coberturas() {
  return (
    <>
      <Secao fundo="azul">
        <h1 className="font-display text-[52px] uppercase leading-[1.04] text-white md:text-[88px]">
          Cada pet, uma <Realce>cobertura</Realce>
        </h1>
        <p className="mt-6 max-w-2xl text-[20px] font-medium leading-snug text-white">
          Quatro assinaturas, do essencial à cobertura mais ampla. O valor depende da idade do pet:
          até 7 anos é um, a partir dos 8 anos completos é outro. Só o Sereninho não muda.
        </p>
        <div className="mt-8">
          <Link href={QUIZ_HREF} className={BOTAO}>
            Descobrir minha cobertura <span aria-hidden>→</span>
          </Link>
        </div>
      </Secao>

      <Secao fundo="suave">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {PLANOS.map((p) => (
            <PlanoCard key={p.chave} plano={p} completo destaque={p.chave === 'parceiro'} />
          ))}
        </div>
        <p className="mt-8 max-w-3xl text-[14px] font-medium leading-relaxed text-[#2f5a73]">
          Valores mensais por pet, conferidos em 18/11/2026. A taxa de adesão, quando houver, aparece no
          resumo antes do pagamento. Há também as versões anuais do Parceiro e do Melhor Amigo.
        </p>
      </Secao>

      <Secao fundo="branco">
        <Titulo tom="escuro" className="max-w-3xl">
          E a carência?
        </Titulo>
        <p className="mt-4 max-w-2xl text-[18px] font-medium leading-relaxed text-[#2f5a73]">
          Carência é o prazo até uma cobertura ficar liberada. Ela varia por assinatura e por item, e
          depois de cumprida você usa sem pedir autorização à Jofi.
        </p>
        <ul className="mt-10 grid gap-5 md:grid-cols-3">
          {CARENCIAS.map((c) => (
            <li key={c.t} className="rounded-[32px] bg-[#eaf6fe] p-7">
              <h3 className="font-display text-[30px] uppercase leading-[1.05] text-[#009af2]">{c.t}</h3>
              <p className="mt-3 text-[16px] font-medium leading-relaxed text-[#2f5a73]">{c.d}</p>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-[15px] font-medium text-[#2f5a73]">
          Carências e limites anuais, item a item, na cartilha completa. É só pedir!
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
    </>
  );
}
