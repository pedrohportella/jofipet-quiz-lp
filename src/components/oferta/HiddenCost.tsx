'use client';

import { motion } from 'framer-motion';
import { useOfertaCapture } from './OfertaCaptureContext';

// TODO Ricardo: validar valores médios na rede credenciada (Recife/JP).
const HIDDEN_COSTS = [
  { label: 'Vacina anual', value: 'R$ 280' },
  { label: '2 consultas de rotina', value: 'R$ 500' },
  { label: 'Vermífugo + antipulgas', value: 'R$ 350' },
  { label: 'Exame anual', value: 'R$ 300' },
];

const JOFI_INCLUDES = [
  'Consultas inclusas',
  'Vacinação inclusa',
  'Exames laboratoriais',
  'Exames de imagem',
  'Atendimento humano via WhatsApp',
];

export function HiddenCost() {
  const { open } = useOfertaCapture();

  const handleClick = () => {
    open({ source: 'hidden_cost' });
  };

  return (
    <section className="bg-cream py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="mb-10 text-center md:mb-12">
          <p className="jofi-kicker mb-2 text-accent">Faz as contas honestamente</p>
          <h2
            className="text-3xl uppercase leading-tight text-neutral-900 md:text-5xl"
            style={{ fontFamily: 'var(--font-anton), Anton, Impact, sans-serif' }}
          >
            Cuidar de pet <span className="text-accent">tem um custo mensal.</span>
            <br />
            Você só não tá vendo todo.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-neutral-700 md:text-lg">
            &quot;Pet não é caro&quot; — quase todo tutor diz isso. Mas se você somar o que gastou
            ano passado, picado em vacina, consulta, antipulgas e exame, provavelmente passou de
            <strong> R$ 1.200</strong>. Isso é <strong>R$ 100/mês difuso</strong>, sem cobrir
            cirurgia, internação ou ressonância — que num único episódio passa fácil de <strong>R$ 4.000</strong>.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl border-2 border-neutral-300 bg-white p-6 md:p-8"
          >
            <p className="jofi-kicker mb-3 text-neutral-500">Hoje, difuso e invisível</p>
            <h3 className="mb-5 text-xl font-bold text-neutral-900">O que você já gasta sem ver</h3>
            <ul className="space-y-3">
              {HIDDEN_COSTS.map((item) => (
                <li
                  key={item.label}
                  className="flex items-baseline justify-between border-b border-neutral-200 pb-2 text-neutral-700"
                >
                  <span>{item.label}</span>
                  <span className="font-mono font-semibold">{item.value}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 rounded-lg bg-neutral-100 p-4 text-center">
              <p className="text-sm text-neutral-600">Total estimado por ano</p>
              <p className="mt-1 text-2xl font-bold text-neutral-900">R$ 1.430</p>
              <p className="mt-1 text-sm text-neutral-600">≈ R$ 119/mês difuso, sem cobrir nada extra</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-2xl border-2 border-primary bg-primary/5 p-6 md:p-8"
          >
            <p className="jofi-kicker mb-3 text-primary">Com Jofi, previsível</p>
            <h3 className="mb-5 text-xl font-bold text-neutral-900">
              Sereno: <span className="text-primary">R$ 79,90/mês</span>
            </h3>
            <ul className="space-y-3">
              {JOFI_INCLUDES.map((item) => (
                <li key={item} className="flex items-center gap-2 text-neutral-700">
                  <span className="text-primary" aria-hidden>
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 rounded-lg bg-success-500/10 p-4">
              <p className="text-sm text-success-700">
                <strong>+ cobertura</strong> do imprevisto que custaria R$ 4.000+
                (com a cobertura Parceiro)
              </p>
            </div>
          </motion.div>
        </div>

        <div className="mt-10 rounded-2xl bg-white p-6 text-center shadow-sm md:p-8">
          <p className="text-base text-neutral-700 md:text-lg">
            A gente não tá dizendo que tudo isso pesa de uma vez.{' '}
            <strong>Tá pesando — só que picado e invisível.</strong>
            <br className="hidden md:block" />
            A assinatura Jofi torna esse cuidado visível, previsível e — na maioria dos casos —
            <strong> menor no agregado</strong>.
          </p>
          <button
            type="button"
            onClick={handleClick}
            className="jofi-btn jofi-btn--whatsapp mt-6"
          >
            Ver as coberturas Jofi
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-neutral-500">
          Valores médios na rede credenciada Recife/JP. Sua realidade pode variar.
        </p>
      </div>
    </section>
  );
}
