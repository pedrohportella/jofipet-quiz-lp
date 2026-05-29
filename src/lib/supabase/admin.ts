/**
 * Supabase admin client (service_role).
 *
 * Server-only, bypassa RLS. Usar APENAS em rotas server-side onde precisa
 * de escrita garantida sem contexto de usuário autenticado:
 *   - /api/leads/route.ts → crm/ingest
 *   - /api/whatsapp/webhook → recebe mensagens
 *   - Vercel Cron jobs
 *
 * NUNCA importar em código que roda no client (componentes 'use client').
 * O service_role key tem acesso total ao banco.
 *
 * Se as envs não estiverem setadas, retorna null. Callers DEVEM tratar
 * isso como "CRM não configurado" (fail-safe, não quebra captura de lead).
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cached: SupabaseClient | null | undefined;

export function getSupabaseAdmin(): SupabaseClient | null {
  if (cached !== undefined) return cached;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    cached = null;
    return null;
  }

  cached = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        'X-Client-Info': 'jofi-crm-admin/0.1',
      },
    },
  });

  return cached;
}

export function isCrmEnabled(): boolean {
  return getSupabaseAdmin() !== null;
}

/**
 * Reset interno pra testes — limpa o singleton em memória.
 * Não exportar fora de test files.
 */
export function _resetSupabaseAdminForTests(): void {
  cached = undefined;
}
