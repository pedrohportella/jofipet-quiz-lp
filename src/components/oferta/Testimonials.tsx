'use client';

import { Star, Quote } from 'lucide-react';
import { testimonials } from './testimonials-data';

export function Testimonials() {
  if (testimonials.length === 0) return null;

  return (
    <section className="bg-secondary py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="mb-10 text-center md:mb-14">
          <p className="jofi-kicker mb-2 text-accent">Tutores Jofi</p>
          <h2
            className="text-3xl uppercase leading-tight text-neutral-900 md:text-4xl"
            style={{ fontFamily: 'var(--font-anton), Anton, Impact, sans-serif' }}
          >
            Famílias que já cuidam
            <br />
            <span className="text-accent">com a Jofi.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          {testimonials.map((t, i) => {
            const rating = t.rating ?? 5;
            const initial = t.initial ?? t.name.trim().charAt(0).toUpperCase();
            return (
              <article
                key={i}
                className="relative flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm"
              >
                <Quote
                  className="absolute right-4 top-4 h-8 w-8 text-primary/15"
                  aria-hidden="true"
                />
                <div className="flex gap-0.5" aria-label={`${rating} de 5 estrelas`}>
                  {Array.from({ length: rating }).map((_, idx) => (
                    <Star
                      key={idx}
                      className="h-4 w-4 fill-accent text-accent"
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <p className="text-[15px] leading-relaxed text-neutral-700 md:text-sm">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <footer className="flex items-center gap-3 border-t border-neutral-200 pt-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-base font-bold text-white">
                    {initial}
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm font-bold text-neutral-900">{t.name}</p>
                    <p className="text-xs text-neutral-500">
                      {t.city} · {t.plan}
                    </p>
                  </div>
                </footer>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
