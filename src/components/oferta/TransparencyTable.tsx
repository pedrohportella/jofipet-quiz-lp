'use client';

import { motion } from 'framer-motion';
import { Check, AlertCircle } from 'lucide-react';

interface TableRow {
  item: string;
  description: string;
  jofi: {
    status: 'no' | 'yes' | 'depends';
    text: string;
  };
  market: {
    text: string;
    /** Baseline verificável (nome do concorrente / reclamação pública). Interno, não renderiza. */
    source?: string;
  };
}

const ROWS: TableRow[] = [
  {
    item: 'Coparticipação',
    description: 'Cobrança extra por procedimento',
    jofi: { status: 'no', text: 'Você paga só a mensalidade — sem cobrança por consulta ou exame.' },
    market: {
      text: 'Comum cobrar R$30-60 por atendimento além da mensalidade.',
      source: 'Petlove Saúde, Plamev tiers básicos',
    },
  },
  {
    item: 'Carência',
    description: 'Prazo até liberar uso após contratar',
    jofi: {
      status: 'depends',
      text: 'Consultas e vacinas a partir do dia 1. Exames e procedimentos têm prazo por tipo — confira na cartilha.',
    },
    market: {
      text: 'Alguns anunciam "carência zero" mas o contrato tem 30 a 45 dias — reclamações recorrentes no Reclame Aqui.',
      source: 'PetLife (85% resolvidas), Plamev',
    },
  },
  {
    item: 'Taxa de adesão',
    description: 'Cobrança no ato da contratação',
    jofi: {
      status: 'no',
      text: 'Adesão custa só o valor da 1ª mensalidade — sem cobrança extra.',
    },
    market: {
      text: 'Cobrança de R$50-200 na adesão é comum, além da 1ª mensalidade.',
      source: 'padrão do setor',
    },
  },
  {
    item: 'Fidelidade',
    description: 'Tempo mínimo de permanência',
    jofi: { status: 'no', text: 'Cancela quando quiser, pelo WhatsApp ou email. Sem prazo mínimo.' },
    market: {
      text: 'Fidelidade de 12 meses com multa proporcional é padrão no mercado.',
      source: 'PetLife (reclamações RA), Plamev',
    },
  },
  {
    item: 'Multa de cancelamento',
    description: 'Cobrança pra encerrar antes do prazo',
    jofi: { status: 'no', text: 'Sem multa. Avisou, encerrou.' },
    market: {
      text: 'Multa proporcional aos meses restantes é comum quando há fidelidade.',
      source: 'padrão em quem exige fidelidade',
    },
  },
  {
    item: 'Limite de uso',
    description: 'Quantidade máxima de consultas/exames',
    jofi: {
      status: 'depends',
      text: 'Sereninho e Sereno com cobertura essencial. Parceiro e Melhor Amigo com consultas ilimitadas.',
    },
    market: {
      text: 'Consultas ilimitadas normalmente só na cobertura de topo (a mais cara).',
      source: 'Petlove Superior, PetLife topo',
    },
  },
];

/**
 * Ícone da coluna "Na Jofi".
 *   - 'no' e 'yes' → ambos são estados positivos ("não tem X ruim" ou "tem Y bom"),
 *     renderizam Check verde. Usar X vermelho aqui seria enganoso visualmente
 *     (o leitor lê "vermelho = problema" mesmo com aria-label "não tem").
 *   - 'depends' → sinaliza nuance, AlertCircle âmbar.
 */
function JofiIcon({ status }: { status: TableRow['jofi']['status'] }) {
  if (status === 'depends') {
    return (
      <AlertCircle
        className="h-5 w-5 shrink-0 text-warning"
        aria-label="Tem particularidade"
      />
    );
  }
  return (
    <Check className="h-5 w-5 shrink-0 text-success-500" aria-label="Vantagem" />
  );
}

export function TransparencyTable() {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="mb-10 text-center md:mb-12">
          <p className="jofi-kicker mb-2 text-accent">Transparência radical</p>
          <h2
            className="text-3xl uppercase leading-tight text-neutral-900 md:text-5xl"
            style={{ fontFamily: 'var(--font-anton), Anton, Impact, sans-serif' }}
          >
            Jofi vs. o padrão
            <br />
            <span className="text-accent">do mercado.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-neutral-700 md:text-lg">
            A gente sabe que cobertura de saúde pet ganhou mal nome por causa de{' '}
            &quot;carência escondida&quot; e &quot;coparticipação que aparece depois&quot;.
            Aqui é diferente — e a gente quer que você veja isso lado a lado antes de fechar.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm"
        >
          {/* Desktop: tabela 3 colunas — Item / Na Jofi / Mercado padrão */}
          <table className="hidden w-full md:table">
            <thead className="bg-cream">
              <tr>
                <th className="w-1/4 px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                  Item
                </th>
                <th className="w-[38%] px-6 py-4 text-left text-sm font-semibold text-success-700">
                  Na Jofi
                </th>
                <th className="w-[38%] px-6 py-4 text-left text-sm font-semibold text-neutral-600">
                  Padrão do mercado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {ROWS.map((row) => (
                <tr key={row.item}>
                  <td className="px-6 py-5 align-top">
                    <p className="font-semibold text-neutral-900">{row.item}</p>
                    <p className="mt-1 text-xs text-neutral-500">{row.description}</p>
                  </td>
                  <td className="bg-success-500/5 px-6 py-5 align-top">
                    <div className="flex items-start gap-2">
                      <JofiIcon status={row.jofi.status} />
                      <p className="text-sm leading-relaxed text-neutral-800">
                        {row.jofi.text}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-5 align-top">
                    <div className="flex items-start gap-2">
                      <AlertCircle
                        className="h-5 w-5 shrink-0 text-neutral-400"
                        aria-hidden="true"
                      />
                      <p className="text-sm leading-relaxed text-neutral-600">
                        {row.market.text}
                      </p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile: cards empilhados — Jofi acima, Mercado abaixo */}
          <div className="divide-y divide-neutral-200 md:hidden">
            {ROWS.map((row) => (
              <div key={row.item} className="p-4">
                <p className="font-semibold text-neutral-900">{row.item}</p>
                <p className="mb-3 text-xs text-neutral-500">{row.description}</p>

                <div className="mb-2 rounded-lg bg-success-500/10 p-3">
                  <div className="flex items-start gap-2">
                    <JofiIcon status={row.jofi.status} />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-success-700">
                        Na Jofi
                      </p>
                      <p className="mt-1 text-sm text-neutral-800">{row.jofi.text}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-neutral-100 p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle
                      className="h-5 w-5 shrink-0 text-neutral-400"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                        Padrão do mercado
                      </p>
                      <p className="mt-1 text-sm text-neutral-600">{row.market.text}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="mt-6 rounded-2xl bg-success-500/10 p-5 text-center md:p-6">
          <p className="text-sm text-success-700 md:text-base">
            ✅ <strong>Mais 1 coisa:</strong> na assinatura anual (Parceiro e Melhor Amigo)
            você ganha 20% de desconto e as carências são <strong>reduzidas</strong>.
          </p>
        </div>

        <p className="mt-4 text-center text-xs text-neutral-500">
          Comparativo baseado em informações públicas de concorrentes e reclamações
          registradas no Reclame Aqui. Sujeito a variação por cobertura e operadora.
        </p>
      </div>
    </section>
  );
}
