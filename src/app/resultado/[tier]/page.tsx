import { notFound } from 'next/navigation';

const VALID_TIERS = ['quente', 'morno', 'frio'] as const;
type Tier = (typeof VALID_TIERS)[number];

const PLAN_BY_TIER: Record<Tier, { name: string; price: string; description: string; cta: string }> = {
  quente: {
    name: 'Parceiro',
    price: 'a partir de R$ 169,90',
    description:
      'Cobertura completa: especialistas, internação, cirurgias e exames especializados — tudo o que seu pet precisa pra viver tranquilo.',
    cta: 'Falar com a Jofi no WhatsApp',
  },
  morno: {
    name: 'Sereno',
    price: 'a partir de R$ 79,90',
    description:
      'Vacinação completa, consultas 24h, exames laboratoriais e de imagem. Cuidado consistente sem peso no bolso.',
    cta: 'Conhecer o Sereno',
  },
  frio: {
    name: 'Sereninho',
    price: 'a partir de R$ 49,90',
    description:
      'Pra começar a cuidar: consultas clínicas, vacinas essenciais e exames iniciais. Pet protegido no plano mais acessível.',
    cta: 'Receber dicas de cuidado',
  },
};

export function generateStaticParams() {
  return VALID_TIERS.map((tier) => ({ tier }));
}

interface PageProps {
  params: { tier: string };
}

export default function ResultadoPage({ params }: PageProps) {
  const tier = params.tier as Tier;
  if (!VALID_TIERS.includes(tier)) notFound();
  const plan = PLAN_BY_TIER[tier];

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-mobile flex-col items-center gap-6 px-4 py-8 text-center md:max-w-desktop md:py-12">
      <span className="text-5xl" aria-hidden="true">
        🐾
      </span>
      <p className="jofi-kicker text-primary">Seu plano ideal</p>
      <h1
        className="text-5xl uppercase leading-[0.95] text-neutral-900 md:text-6xl"
        style={{ fontFamily: 'var(--font-anton), Anton, Impact, sans-serif' }}
      >
        <span className="text-accent">{plan.name}</span>
      </h1>
      <p
        className="text-3xl uppercase text-neutral-900"
        style={{ fontFamily: 'var(--font-anton), Anton, Impact, sans-serif' }}
      >
        {plan.price}
      </p>
      <p className="max-w-sm text-base text-neutral-700">{plan.description}</p>

      <div className="mt-2 flex w-full max-w-sm flex-col gap-3">
        <button
          type="button"
          className="jofi-btn jofi-btn--primary w-full"
          disabled
          aria-disabled="true"
        >
          {plan.cta} (em breve)
        </button>
        <p className="text-xs text-neutral-500">
          Story 3.x — roteamento WhatsApp/Sereninho/Newsletter
        </p>
      </div>
    </main>
  );
}
