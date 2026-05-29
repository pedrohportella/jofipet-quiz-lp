/**
 * Config compartilhada do WhatsApp Cloud API.
 *
 * Centraliza leitura de envs + valida config completa antes de tentar
 * usar. Permite skipar gracefully quando rodando sem credenciais (testes,
 * preview deploys, dev sem .env).
 */

export interface WhatsAppConfig {
  wabaId: string;
  phoneNumberId: string;
  accessToken: string;
  appSecret: string;
  verifyToken: string;
  apiVersion: string;
  graphApiBase: string;
}

const DEFAULT_API_VERSION = 'v21.0';
const DEFAULT_GRAPH_BASE = 'https://graph.facebook.com';

export function readWhatsAppConfig(): WhatsAppConfig | null {
  const wabaId = process.env.META_WABA_ID;
  const phoneNumberId = process.env.META_PHONE_NUMBER_ID;
  const accessToken = process.env.META_ACCESS_TOKEN_PERMANENT;
  const appSecret = process.env.META_APP_SECRET;
  const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN;

  if (!wabaId || !phoneNumberId || !accessToken || !appSecret || !verifyToken) {
    return null;
  }

  return {
    wabaId,
    phoneNumberId,
    accessToken,
    appSecret,
    verifyToken,
    apiVersion: process.env.META_GRAPH_API_VERSION ?? DEFAULT_API_VERSION,
    graphApiBase: process.env.META_GRAPH_API_BASE ?? DEFAULT_GRAPH_BASE,
  };
}

export function buildGraphUrl(cfg: WhatsAppConfig, path: string): string {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${cfg.graphApiBase}/${cfg.apiVersion}/${cleanPath}`;
}

export const HSM_TEMPLATES_BY_TIER: Record<
  'quente' | 'morno' | 'frio',
  { name: string; language: string }
> = {
  quente: { name: 'jofi_boasvindas_quente', language: 'pt_BR' },
  morno: { name: 'jofi_boasvindas_morno', language: 'pt_BR' },
  frio: { name: 'jofi_boasvindas_frio', language: 'pt_BR' },
};
