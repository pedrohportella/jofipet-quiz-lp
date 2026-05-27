'use client';

import { motion } from 'framer-motion';
import { Check, X, AlertCircle } from 'lucide-react';

interface TableRow {
  item: string;
  description: string;
  status: 'no' | 'yes' | 'depends';
  detail: string;
}

const ROWS: TableRow[] = [
  {
    item: 'Coparticipação',
    description: 'Cobrança extra por procedimento',
    status: 'no',
    detail: 'Você paga só a mensalidade',
  },
  {
    item: 'Carência',
    description: 'Prazo até liberar uso',
    status: 'depends',
    detail:
      'Consultas e vacinas a partir do dia 1. Exames e procedimentos têm prazo específico — confira na cartilha.',
  },
  {
    item: 'Taxa de adesão',
    description: 'Cobrança no ato da contratação',
    status: 'no',
    detail: 'Adesão custa só o valor da 1ª mensalidade',
  },
  {
    item: 'Fidelidade',
    description: 'Permanência mínima',
    status: 'no',
    detail: 'Cancela quando quiser, pelo WhatsApp ou email',
  },
  {
    item: 'Multa de cancelamento',
    description: 'Cobrança pra encerrar',
    status: 'no',
    detail: 'Sem multa. Avisou, encerrou.',
  },
  {
    item: 'Limite de uso',
    description: 'Quantidade máxima de consultas/exames',
    status: 'depends',
    detail:
      'Sereninho e Sereno têm cobertura essencial. Melhor Amigo tem consultas ilimitadas.',
  },
];

function StatusIcon({ status }: { status: TableRow['status'] }) {
  if (status === 'no')
    return <X className="h-5 w-5 text-error" aria-label="Não tem" />;
  if (status === 'yes')
    return <Check className="h-5 w-5 text-success-500" aria-label="Tem" />;
  return (
    <AlertCircle className="h-5 w-5 text-warning" aria-label="Depende" />
  );
}

export function TransparencyTable() {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-5xl px-4 md:px-8">
        <div className="mb-10 text-center md:mb-12">
          <p className="jofi-kicker mb-2 text-accent">Transparência radical</p>
          <h2
            className="text-3xl uppercase leading-tight text-neutral-900 md:text-5xl"
            style={{ fontFamily: 'var(--font-anton), Anton, Impact, sans-serif' }}
          >
            Sem letra miúda,
            <br />
            <span className="text-accent">sem surpresa depois.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-neutral-700 md:text-lg">
            A gente sabe que cobertura de saúde pet, no geral, ganhou mal nome por causa de
            &quot;carência escondida&quot; ou &quot;coparticipação que aparece depois&quot;.
            Na Jofi é diferente — e a gente quer que você saiba antes de fechar.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm"
        >
          {/* Desktop: tabela 4 colunas */}
          <table className="hidden w-full md:table">
            <thead className="bg-cream">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                  Item
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                  Como funciona
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-neutral-700">
                  Tem na Jofi?
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                  Detalhe
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {ROWS.map((row) => (
                <tr key={row.item}>
                  <td className="px-6 py-4 font-semibold text-neutral-900">
                    {row.item}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-700">
                    {row.description}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center">
                      <StatusIcon status={row.status} />
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-700">
                    {row.detail}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile: cards */}
          <div className="divide-y divide-neutral-200 md:hidden">
            {ROWS.map((row) => (
              <div key={row.item} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-neutral-900">{row.item}</p>
                    <p className="text-sm text-neutral-700">{row.description}</p>
                  </div>
                  <StatusIcon status={row.status} />
                </div>
                <p className="mt-2 text-sm text-neutral-700">{row.detail}</p>
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
      </div>
    </section>
  );
}
