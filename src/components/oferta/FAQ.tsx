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

// TODO Pedro/Jofi: revisar com a equipe Jofi se essas respostas batem com a
// realidade operacional (carências, cobertura, cancelamento, rede etc).
const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'cobertura',
    question: 'O que a Jofi cobre exatamente?',
    answer:
      'Depende do plano. Sereninho cobre consultas, vacinas e exames essenciais. Sereno adiciona exames de imagem e atendimento 24h. Parceiro inclui internação, cirurgias e especialistas. Melhor Amigo é a cobertura máxima — desde tratamento oncológico até fisioterapia. Nosso time te ajuda a escolher o que faz sentido pro seu pet.',
  },
  {
    id: 'carencia',
    question: 'Qual o tempo de carência?',
    answer:
      'A carência varia por plano: Sereninho e Sereno têm 30 dias, Parceiro 60 dias, Melhor Amigo 90 dias. Pra emergências há condições especiais — pergunte ao nosso time no WhatsApp.',
  },
  {
    id: 'cancelamento',
    question: 'Posso cancelar quando quiser?',
    answer:
      'Sim. Nenhum plano Jofi tem fidelidade. Você cancela a qualquer momento pelo WhatsApp do nosso time ou pelo email de contato. Sem multa, sem burocracia.',
  },
  {
    id: 'rede',
    question: 'Onde encontro vets parceiros Jofi?',
    answer:
      'Temos rede credenciada nas principais cidades do Brasil. Quando você assina, nosso time te envia o mapa de vets parceiros perto do seu CEP. Se sua região ainda não tem rede, oferecemos reembolso em vets de sua escolha (consulte condições no plano Melhor Amigo).',
  },
  {
    id: 'pet-idoso',
    question: 'Meu pet é idoso — aceito mesmo assim?',
    answer:
      'Sim! A Jofi aceita pets de qualquer idade. Pets idosos geralmente entram no Plano Parceiro ou Melhor Amigo (cobertura mais ampla pra demandas que vêm com a idade). A consulta inicial é gratuita pra avaliar o estado de saúde.',
  },
  {
    id: 'gato',
    question: 'A Jofi atende gatos também?',
    answer:
      'Sim. Todos os planos cobrem cães e gatos. Algumas espécies exóticas (aves, répteis, roedores) ainda não — estamos expandindo. Pergunta pro nosso time se seu caso entra na cobertura.',
  },
  {
    id: 'pagamento',
    question: 'Como funciona o pagamento?',
    answer:
      'Mensal via cartão de crédito, débito recorrente ou Pix. Sem taxa de adesão, sem entrada. Você só paga a mensalidade do plano escolhido.',
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
