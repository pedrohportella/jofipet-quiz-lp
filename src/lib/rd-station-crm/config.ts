/**
 * Configuração da integração com RD Station CRM (criar negociação/deal).
 *
 * Diferente do RD Station Marketing — esse é o produto de CRM/funil de vendas.
 * Usa endpoint próprio (crm.rdstation.com) e token próprio (RD_CRM_TOKEN).
 *
 * Regra de criação configurada via Tier:
 *   - quente → cria deal sempre
 *   - morno  → cria deal sempre
 *   - frio   → NÃO cria deal (fica só no RD Marketing, nutrição por email)
 *
 * Falha aqui nunca bloqueia captura — fail-safe consistente com o resto.
 */

import type { Tier } from '@/lib/quiz/types';

export interface RdCrmConfig {
  token: string;
  dealStageId: string;
  defaultUserId?: string;
  apiBaseUrl: string;
}

const DEFAULT_API_BASE = 'https://crm.rdstation.com/api/v1';

export const TIERS_THAT_CREATE_DEAL: readonly Tier[] = ['quente', 'morno'];

export function shouldCreateDeal(tier: Tier): boolean {
  return TIERS_THAT_CREATE_DEAL.includes(tier);
}

export function readRdCrmConfig(): RdCrmConfig | null {
  const token = process.env.RD_CRM_TOKEN;
  const dealStageId = process.env.RD_CRM_DEAL_STAGE_ID;

  if (!token || !dealStageId) return null;

  return {
    token,
    dealStageId,
    defaultUserId: process.env.RD_CRM_DEFAULT_USER_ID || undefined,
    apiBaseUrl: process.env.RD_CRM_API_BASE || DEFAULT_API_BASE,
  };
}
