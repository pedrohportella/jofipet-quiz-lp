'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { loadStoredUtms } from '@/lib/tracking/utms';

export function OutOfAreaClient() {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const utms = loadStoredUtms();
      const response = await fetch('/api/leads/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source: 'quiz_out_of_area',
          utms: Object.keys(utms).length > 0 ? utms : undefined,
        }),
      });
      if (!response.ok) {
        throw new Error('signup_failed');
      }
      setSubmitted(true);
    } catch {
      setError('Não rolou agora. Tenta de novo em alguns segundos?');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <section className="m-auto max-w-md py-20 text-center">
        <span className="text-5xl" aria-hidden="true">
          🐾
        </span>
        <h1
          className="mt-4 text-3xl uppercase text-neutral-900 md:text-4xl"
          style={{ fontFamily: 'var(--font-anton), Anton, Impact, sans-serif' }}
        >
          Anotado!
        </h1>
        <p className="mt-4 text-base text-neutral-700">
          A gente avisa quando a Jofi chegar na sua cidade. Sem spam, prometo 💛
        </p>
        <Link
          href="/"
          className="mt-8 inline-block text-sm font-medium text-primary underline underline-offset-4"
        >
          Voltar ao início
        </Link>
      </section>
    );
  }

  return (
    <section className="m-auto max-w-md py-12 text-center md:py-20">
      <span className="text-5xl" aria-hidden="true">
        📍
      </span>
      <h1
        className="mt-4 text-3xl uppercase leading-tight text-neutral-900 md:text-4xl"
        style={{ fontFamily: 'var(--font-anton), Anton, Impact, sans-serif' }}
      >
        Atendemos PE e PB
      </h1>
      <p className="mt-4 text-base text-neutral-700">
        Estamos crescendo aos poucos. Quer ser avisado quando a Jofi chegar na sua cidade?
      </p>
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Seu e-mail"
          aria-label="Seu e-mail"
          className="min-h-input w-full rounded-pill border border-neutral-300 bg-white px-5 text-base text-neutral-900 placeholder:text-neutral-500 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        />
        <button
          type="submit"
          disabled={loading || !email}
          className="jofi-btn jofi-btn--primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Salvando…' : 'Me avisa quando chegar'}
        </button>
      </form>
      {error && (
        <p className="mt-3 text-sm text-error" role="alert">
          {error}
        </p>
      )}
      <p className="mt-4 text-xs text-neutral-500">Sem spam, prometo 🐾</p>
      <Link
        href="/"
        className="mt-8 inline-block text-sm text-neutral-500 underline underline-offset-4"
      >
        Voltar ao início
      </Link>
    </section>
  );
}
