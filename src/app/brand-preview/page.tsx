/* eslint-disable @next/next/no-img-element */
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Brand preview · Jofi',
  robots: { index: false, follow: false },
};

const VARIANTS = [
  { id: 5, file: '/brand/jofi/variant-5.svg' },
  { id: 6, file: '/brand/jofi/variant-6.svg' },
  { id: 7, file: '/brand/jofi/variant-7.svg' },
  { id: 8, file: '/brand/jofi/variant-8.svg' },
];

export default function BrandPreviewPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="mb-2 text-3xl font-bold text-neutral-900">
        Brand preview — Jofi logo variants
      </h1>
      <p className="mb-8 text-sm text-neutral-700">
        Identifique cada variante (horizontal, vertical, símbolo, com tagline)
        e me diga no chat qual número usar em qual lugar do site.
      </p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {VARIANTS.map((v) => (
          <section
            key={v.id}
            className="rounded-2xl border border-neutral-200 bg-white p-6"
          >
            <header className="mb-4 flex items-center justify-between border-b border-neutral-200 pb-3">
              <h2 className="text-lg font-bold text-neutral-900">
                Variant {v.id}
              </h2>
              <code className="text-xs text-neutral-500">{v.file}</code>
            </header>

            {/* Em fundo claro */}
            <div className="mb-3 flex items-center justify-center rounded-lg bg-cream p-8">
              <img
                src={v.file}
                alt={`Variant ${v.id} em fundo claro`}
                className="h-48 w-auto"
              />
            </div>

            {/* Em fundo escuro */}
            <div className="mb-3 flex items-center justify-center rounded-lg bg-neutral-900 p-8">
              <img
                src={v.file}
                alt={`Variant ${v.id} em fundo escuro`}
                className="h-48 w-auto"
              />
            </div>

            {/* Em tamanho pequeno (header / footer) */}
            <div className="flex items-center justify-center rounded-lg bg-white p-4">
              <img
                src={v.file}
                alt={`Variant ${v.id} pequeno`}
                className="h-10 w-auto"
              />
              <span className="ml-3 text-xs text-neutral-500">
                tamanho header
              </span>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
