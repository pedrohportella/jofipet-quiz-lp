/**
 * Supabase browser client (anon key + RLS).
 *
 * Usar em Client Components ('use client') que precisam fazer reads/writes
 * autenticados, ou — principalmente — subscriptions Realtime (inbox, kanban).
 *
 * RLS é a defesa: anon key pode ser exposta no bundle, as policies em
 * 0001_crm_init.sql é que decidem o que cada user vê/escreve.
 */

import { createBrowserClient } from '@supabase/ssr';

let cached: ReturnType<typeof createBrowserClient> | undefined;

export function getSupabaseBrowser() {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    throw new Error(
      'Supabase browser client: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY not set',
    );
  }

  cached = createBrowserClient(url, anon);
  return cached;
}
