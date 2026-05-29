import { describe, it, expect } from 'vitest';
import { createHmac } from 'node:crypto';
import { verifyMetaSignature } from './signature';

const SECRET = 'test_app_secret_x123';
const BODY = JSON.stringify({ entry: [{ id: '123' }] });

function sign(body: string, secret: string): string {
  return 'sha256=' + createHmac('sha256', secret).update(body, 'utf8').digest('hex');
}

describe('verifyMetaSignature', () => {
  it('aceita assinatura válida gerada com o mesmo secret', () => {
    const sig = sign(BODY, SECRET);
    const result = verifyMetaSignature(BODY, sig, SECRET);
    expect(result.ok).toBe(true);
  });

  it('rejeita quando header está ausente', () => {
    const result = verifyMetaSignature(BODY, null, SECRET);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('missing_header');
  });

  it('rejeita quando header está vazio', () => {
    const result = verifyMetaSignature(BODY, '', SECRET);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('missing_header');
  });

  it('rejeita quando header não tem prefixo sha256=', () => {
    const sig = sign(BODY, SECRET).replace('sha256=', '');
    const result = verifyMetaSignature(BODY, sig, SECRET);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('malformed_header');
  });

  it('rejeita quando o body foi adulterado', () => {
    const sig = sign(BODY, SECRET);
    const tampered = BODY.replace('123', '999');
    const result = verifyMetaSignature(tampered, sig, SECRET);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('mismatch');
  });

  it('rejeita quando o secret está errado', () => {
    const sig = sign(BODY, 'wrong_secret');
    const result = verifyMetaSignature(BODY, sig, SECRET);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('mismatch');
  });

  it('rejeita hex com tamanho diferente de SHA-256', () => {
    const result = verifyMetaSignature(BODY, 'sha256=cafebabe', SECRET);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('mismatch');
  });

  it('rejeita hex com caracteres inválidos', () => {
    const result = verifyMetaSignature(
      BODY,
      'sha256=' + 'z'.repeat(64),
      SECRET,
    );
    expect(result.ok).toBe(false);
    expect(['malformed_header', 'mismatch']).toContain(result.reason);
  });
});
