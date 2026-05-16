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
    id: 'cobertura',
    question: 'O que a Jofi cobre exatamente?',
    answer:
      'Depende do plano que você escolher. O Sereninho cobre consultas clínicas, vacinação essencial, exames de rotina e aplicação de medicamentos. O Sereno adiciona exames laboratoriais, exames de imagem e sedação. O Parceiro inclui internamento, cirurgias, tomografia, anestesias e consultas com especialistas. O Melhor Amigo é a cobertura mais que completa — consultas ilimitadas, ressonância magnética, transfusão sanguínea e mais. Nosso time te ajuda a escolher o que faz sentido pro seu pet.',
  },
  {
    id: 'carencia',
    question: 'Qual o tempo de carência?',
    answer:
      'A carência varia conforme o plano e o tipo de cobertura. Nosso time confirma todos os prazos pra você no WhatsApp antes da contratação — sem letra miúda, sem surpresa.',
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
      'A Jofi conecta seu pet à clínica veterinária favorita da rede credenciada. Temos parceiros em diversas cidades do Brasil. Quando você assina, nosso time te ajuda a escolher o vet mais conveniente perto de você. Se seu vet de confiança ainda não é parceiro Jofi, conta pra gente — estamos sempre expandindo a rede.',
  },
  {
    id: 'pet-idoso',
    question: 'Meu pet é idoso — aceito mesmo assim?',
    answer:
      'Sim! A Jofi aceita pets de todas as idades. Pets idosos geralmente se beneficiam mais do Plano Parceiro ou Melhor Amigo (cobertura ampla pras demandas que vêm com a idade). Nosso time te ajuda a escolher o plano certo pro estágio de vida do seu pequeno.',
  },
  {
    id: 'gato',
    question: 'A Jofi atende gatos também?',
    answer:
      'Sim! Todos os planos cobrem cães e gatos com a mesma estrutura. Algumas espécies exóticas (aves, répteis, roedores) ainda não — estamos expandindo. Pergunta pro nosso time se seu caso entra na cobertura.',
  },
  {
    id: 'pagamento',
    question: 'Como funciona o pagamento e a taxa de adesão?',
    answer:
      'O pagamento é mensal via cartão de crédito, débito recorrente ou Pix. Sobre a taxa de adesão: os planos Parceiro e Melhor Amigo são sem taxa de adesão. Sereninho e Sereno têm uma taxa única de adesão paga no início — nosso time te explica os valores certinhos no WhatsApp.',
  },
  {
    id: 'como-contratar',
    question: 'Como faço pra contratar?',
    answer:
      'Em 4 passos simples: 1) Você conta sobre o seu pet (espécie, idade, hábitos); 2) Escolhe a cobertura ideal junto com nosso time; 3) Decide qual parceiro vai atender seu pet; 4) Pronto! Já pode usar imediatamente. Sem burocracias dos modelos convencionais.',
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
