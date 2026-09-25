import { describe, expect, it } from 'vitest';
import {
  ADMIN_SESSION_TTL_SECONDS,
  checkCredentials,
  createSessionToken,
  safeNextPath,
  verifySessionToken,
  type AdminAuthConfig,
} from './session';

const config: AdminAuthConfig = { user: 'jofi', password: 'segredo-teste', secret: 'segredo-teste' };
const NOW = 1_790_000_000_000;

describe('admin session', () => {
  it('aceita o token que acabou de gerar', async () => {
    const token = await createSessionToken(config, NOW);
    expect(await verifySessionToken(config, token, NOW)).toBe(true);
  });

  it('recusa token expirado', async () => {
    const token = await createSessionToken(config, NOW);
    const depois = NOW + (ADMIN_SESSION_TTL_SECONDS + 1) * 1000;
    expect(await verifySessionToken(config, token, depois)).toBe(false);
  });

  it('recusa token com validade adulterada', async () => {
    const token = await createSessionToken(config, NOW);
    const [exp, sig] = token.split('.');
    const forjado = `${Number(exp) + 999_999}.${sig}`;
    expect(await verifySessionToken(config, forjado, NOW)).toBe(false);
  });

  it('troca de senha derruba a sessão', async () => {
    const token = await createSessionToken(config, NOW);
    const novo = { ...config, password: 'nova', secret: 'nova' };
    expect(await verifySessionToken(novo, token, NOW)).toBe(false);
  });

  it('recusa vazio e lixo', async () => {
    for (const t of [undefined, null, '', 'abc', '.abc', '123.']) {
      expect(await verifySessionToken(config, t, NOW)).toBe(false);
    }
  });

  it('confere usuário e senha', () => {
    expect(checkCredentials(config, 'jofi', 'segredo-teste')).toBe(true);
    expect(checkCredentials(config, 'jofi', 'errada')).toBe(false);
    expect(checkCredentials(config, 'outro', 'segredo-teste')).toBe(false);
  });
});

describe('safeNextPath', () => {
  it('mantém caminho interno do painel', () => {
    expect(safeNextPath('/admin/leads?page=2')).toBe('/admin/leads?page=2');
  });
  it('barra open redirect e loop de login', () => {
    for (const n of ['https://evil.com', '//evil.com', '/admin//evil.com', '/', '/admin/login', undefined, 42]) {
      expect(safeNextPath(n)).toBe('/admin');
    }
  });
});
