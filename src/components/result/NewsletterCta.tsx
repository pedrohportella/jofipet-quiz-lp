'use client';

import { useState } from 'react';
import { useQuizState } from '@/hooks/useQuizState';
import { loadStoredUtms } from '@/lib/tracking/utms';

interface NewsletterCtaProps {
  label?: string;
}

export function NewsletterCta({ label = 'Receber dicas por email' }: NewsletterCtaProps) {
  const { state } = useQuizState();
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>(
    'idle',
  );
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || status === 'submitting') return;
    setStatus('submitting');
    try {
      const response = await fetch('/api/leads/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name: state.leadName ?? null,
          tier: state.tier,
          utms: loadStoredUtms(),
        }),
      });
      if (!response.ok) throw new Error('failed');
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <p className="rounded-lg bg-primary-100 px-4 py-3 text-center text-sm font-medium text-primary-700">
        Pronto! Em breve você recebe nossas dicas 🐾
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-2">
      <label htmlFor="newsletter-email" className="text-sm font-semibold text-neutral-900">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          id="newsletter-email"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1 rounded-md border border-neutral-300 bg-white px-4 text-base text-neutral-900 placeholder:text-neutral-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          style={{ height: 48 }}
        />
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="jofi-btn jofi-btn--primary px-5"
        >
          {status === 'submitting' ? '...' : 'Enviar'}
        </button>
      </div>
      {status === 'error' && (
        <p className="text-sm text-accent-600">Algo deu errado. Tenta de novo?</p>
      )}
    </form>
  );
}
