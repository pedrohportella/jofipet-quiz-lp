/**
 * Orquestrador: decide se cria deal no RD CRM e chama o client.
 *
 * Função única de entrada chamada pelo /api/leads/route.ts em paralelo
 * com CAPI, Supabase e RD Marketing.
 *
 * Fail-safe: NUNCA throw. Sempre retorna DispatchResult com a razão.
 */

import type { StoredLead } from '@/lib/leads/store';
import { readRdCrmConfig, shouldCreateDeal } from './config';
import { buildDealPayload } from './mapper';
import { createDeal } from './client';

export interface RdCrmDispatchResult {
  ok: boolean;
  skipped?: 'feature_disabled' | 'config_missing' | 'tier_not_eligible';
  dealId?: string;
  errorStatus?: number;
  errorMessage?: string;
  retryable?: boolean;
}

/**
 * Feature flag — quando off (default), nenhum deal é criado no RD CRM.
 * Pra reativar: setar RD_CRM_ENABLED=true na env (Vercel ou .env.local)
 * e redeploy. Mantém o código vivo, fácil de ligar/desligar a feature
 * sem mexer em code.
 */
function isRdCrmEnabled(): boolean {
  return process.env.RD_CRM_ENABLED === 'true';
}

function safeLog(
  level: 'info' | 'warn' | 'error',
  record: Record<string, unknown>,
) {
  const line = JSON.stringify({
    component: 'rd_crm_dispatch',
    level,
    ts: new Date().toISOString(),
    ...record,
  });
  /* eslint-disable no-console */
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
  /* eslint-enable no-console */
}

export async function dispatchRdCrmDeal(
  lead: StoredLead,
): Promise<RdCrmDispatchResult> {
  // 0. Feature flag — desligado por default. Pausado a pedido da Jofi em
  //    2026-05-29. Pra reativar: setar RD_CRM_ENABLED=true.
  if (!isRdCrmEnabled()) {
    safeLog('info', {
      event: 'feature_disabled',
      leadId: lead.leadId,
      hint: 'Set RD_CRM_ENABLED=true to reactivate',
    });
    return { ok: true, skipped: 'feature_disabled' };
  }

  // 1. Tier-gate: Frio nunca cria deal
  if (!shouldCreateDeal(lead.tier)) {
    safeLog('info', {
      event: 'tier_not_eligible',
      leadId: lead.leadId,
      tier: lead.tier,
    });
    return { ok: true, skipped: 'tier_not_eligible' };
  }

  // 2. Config check
  const cfg = readRdCrmConfig();
  if (!cfg) {
    safeLog('warn', {
      event: 'config_missing',
      leadId: lead.leadId,
      hint: 'RD_CRM_TOKEN ou RD_CRM_DEAL_STAGE_ID não configurados',
    });
    return { ok: false, skipped: 'config_missing' };
  }

  // 3. Build + send
  try {
    const payload = buildDealPayload(lead, cfg);
    const result = await createDeal(cfg, payload);

    if (result.ok) {
      safeLog('info', {
        event: 'deal_created',
        leadId: lead.leadId,
        tier: lead.tier,
        dealId: result.dealId,
      });
      return { ok: true, dealId: result.dealId };
    }

    safeLog(result.retryable ? 'warn' : 'error', {
      event: 'deal_create_failed',
      leadId: lead.leadId,
      status: result.status,
      retryable: result.retryable,
      message: result.errorMessage,
    });
    return {
      ok: false,
      errorStatus: result.status,
      errorMessage: result.errorMessage,
      retryable: result.retryable,
    };
  } catch (err) {
    safeLog('error', {
      event: 'unexpected_exception',
      leadId: lead.leadId,
      error: err instanceof Error ? err.message : String(err),
    });
    return {
      ok: false,
      errorMessage: err instanceof Error ? err.message : 'unknown',
    };
  }
}
