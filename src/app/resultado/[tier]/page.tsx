import { notFound } from 'next/navigation';
import { ResultClient } from './result-client';

const VALID_TIERS = ['quente', 'morno', 'frio'] as const;

export function generateStaticParams() {
  return VALID_TIERS.map((tier) => ({ tier }));
}

interface PageProps {
  params: { tier: string };
}

export default function ResultadoPage({ params }: PageProps) {
  const tier = params.tier as (typeof VALID_TIERS)[number];
  if (!VALID_TIERS.includes(tier)) notFound();

  const whatsappNumber = process.env.NEXT_PUBLIC_JOFI_WHATSAPP ?? '';
  const sereninhoUrl = process.env.NEXT_PUBLIC_SERENINHO_CHECKOUT_URL ?? '';

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-mobile flex-col items-center gap-5 px-4 py-8 text-center md:max-w-desktop md:py-12">
      <ResultClient
        tier={tier}
        whatsappNumber={whatsappNumber}
        sereninhoUrl={sereninhoUrl}
      />
    </main>
  );
}
