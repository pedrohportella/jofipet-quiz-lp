/**
 * Supabase server client (com cookies SSR).
 *
 * Usar em Server Components, Route Handlers e Server Actions onde queremos
 * respeitar a sessão do usuário autenticado (RLS aplicada).
 *
 * Pra escrita SEM contexto de usuário (webhook, ingest do quiz, jobs),
 * usar `getSupabaseAdmin()` de ./admin.
 */

import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export function getSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    throw new Error(
      'Supabase server client: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY not set',
    );
  }

  const cookieStore = cookies();

  return createServerClient(url, anon, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // Server Components não podem setar cookies — silenciar.
          // Middleware/Route Handlers conseguem; é onde precisa.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options });
        } catch {
          // idem
        }
      },
    },
  });
}
