'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { trackLpOfertaFaqOpen } from '@/lib/tracking/oferta-events';
import { cn } from '@/lib/utils/cn';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

// Respostas validadas contra site oficial jofi.pet (WebFetch 2026-05-16).
// Coberturas alinhadas com folder oficial Jofi (catalog.ts).
// Taxa de adesão: Sereninho/Sereno TÊM · Parceiro/Melhor Amigo NÃO TÊM (diferencial!).
const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'vale-pena',
    question: 'Vale a pena ter cobertura de saúde pet ou pago avulso quando precisa?',
    answer:
      'A resposta honesta: se você só vai precisar de consulta de rotina, talvez não compense. Mas a maioria dos tutores subestima quanto já gasta por ano com pet difuso — vacina, vermífugo, antipulgas, exame, consultas. Some o ano passado: provavelmente foi entre R$ 1.200 e R$ 1.700. A Jofi torna esse custo previsível e ainda cobre o imprevisto que vem do nada (cirurgia, internação) — onde a conta passa fácil de R$ 4.000.',
  },
  {
    id: 'cobertura',
    question: 'O que a Jofi cobre exatamente?',
    answer:
      'Depende da cobertura que você escolher. O Sereninho cobre consultas clínicas, vacinação essencial, exames de rotina e aplicação de medicamentos. O Sereno adiciona exames laboratoriais, exames de imagem e sedação. O Parceiro inclui internamento, cirurgias, tomografia, anestesias e consultas com especialistas. O Melhor Amigo é a cobertura mais que completa — consultas ilimitadas, ressonância magnética, transfusão sanguínea e mais. Nosso time te ajuda a escolher o que faz sentido pro seu pet.',
  },
  {
    id: 'carencia',
    question: 'Qual o tempo de carência?',
    answer:
      'Consultas clínicas e vacinas: liberadas no dia 1. Exames de imagem, sedação, internação e cirurgias têm carência específica por tipo (mais detalhes na cartilha). Na assinatura anual, as carências são reduzidas. Nosso time confirma todos os prazos pra você no WhatsApp antes da contratação.',
  },
  {
    id: 'coparticipacao',
    question: 'Existe coparticipação?',
    answer:
      'Não. Você paga só a mensalidade. Sem cobrança por procedimento, sem cobrança surpresa depois.',
  },
  {
    id: 'cancelamento',
    question: 'Posso cancelar quando quiser?',
    answer:
      'Sim. Nenhuma cobertura Jofi tem fidelidade. Você cancela a qualquer momento pelo WhatsApp do nosso time ou pelo email de contato. Sem multa, sem burocracia.',
  },
  {
    id: 'vet-confianca',
    question: 'Posso usar meu veterinário de confiança?',
    answer:
      'A Jofi funciona via rede credenciada — hospitais e clínicas parceiras em PE e PB. Se o seu vet de confiança é da rede, beleza. Se não, podemos te apresentar uma das parceiras mais perto de você. A gente conhece bem todas elas.',
  },
  {
    id: 'pet-idoso',
    question: 'Meu pet é idoso — aceito mesmo assim?',
    answer:
      'Sim! A Jofi aceita pets de todas as idades. Pets com 8 anos ou mais entram numa faixa de preço própria (ex: o Sereno passa de R$ 79,90 para R$ 109,90/mês). Sem recusa por idade. Pets idosos geralmente se beneficiam mais do Parceiro ou Melhor Amigo (cobertura ampla pras demandas que vêm com a idade).',
  },
  {
    id: 'gato',
    question: 'A Jofi atende gatos também?',
    answer:
      'Sim! Todas as coberturas incluem cães e gatos com a mesma estrutura. Algumas espécies exóticas (aves, répteis, roedores) ainda não — estamos expandindo. Pergunta pro nosso time se seu caso entra.',
  },
  {
    id: 'pagamento',
    question: 'Como funciona o pagamento e a taxa de adesão?',
    answer:
      'A adesão custa só o valor da 1ª mensalidade — sem taxa extra. Pagamento por boleto/pix ou cartão. No cartão, 5% de desconto na mensalidade. Vencimento dia 10 ou 20.',
  },
  {
    id: 'como-contratar',
    question: 'Como faço pra assinar?',
    answer:
      '3 jeitos: 1) faz o quiz em 90 segundos e a gente te chama no WhatsApp; 2) fala direto com nosso time no WhatsApp agora; 3) preenche seus dados aqui no site e a gente entra em contato. Em qualquer um deles, você não vai ouvir "preencha cadastro" antes de saber o preço.',
  },
];

export function FAQ() {
  const [openId, setOpenId] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    const isOpening = openId !== id;
    setOpenId(isOpening ? id : null);
    if (isOpening) trackLpOfertaFaqOpen(id);
  };

  return (
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-3xl px-4 md:px-8">
        <div className="mb-10 text-center md:mb-14">
          <p className="jofi-kicker mb-2 text-primary">Tira a dúvida</p>
          <h2
            className="text-3xl uppercase leading-tight text-neutral-900 md:text-4xl"
            style={{ fontFamily: 'var(--font-anton), Anton, Impact, sans-serif' }}
          >
            Perguntas frequentes
          </h2>
        </div>

        <div className="flex flex-col gap-2">
          {FAQ_ITEMS.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-xl border border-neutral-200 bg-white"
            >
              <button
                type="button"
                onClick={() => handleToggle(item.id)}
                aria-expanded={openId === item.id}
                aria-controls={`faq-${item.id}`}
                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <span className="text-base font-semibold text-neutral-900">
                  {item.question}
                </span>
                <ChevronDown
                  className={cn(
                    'h-5 w-5 shrink-0 text-neutral-500 transition-transform',
                    openId === item.id && 'rotate-180 text-primary',
                  )}
                  aria-hidden="true"
                />
              </button>
              <AnimatePresence initial={false}>
                {openId === item.id && (
                  <motion.div
                    id={`faq-${item.id}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="border-t border-neutral-200 px-5 py-4 text-sm leading-relaxed text-neutral-700">
                      {item.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </article>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-neutral-700">
          Não achou sua pergunta?{' '}
          <strong className="text-primary">Nosso time responde no WhatsApp</strong>.
        </p>
      </div>
    </section>
  );
}
