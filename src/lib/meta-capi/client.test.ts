import { describe, it, expect } from 'vitest';
import { buildUserData, _internalsForTests } from './client';

describe('CAPI buildUserData (PII hashing)', () => {
  it('hashes email with sha256 lowercase trimmed', () => {
    const ud = buildUserData({ email: '  PEDRO@example.com  ' });
    expect(ud.em).toEqual([_internalsForTests.sha256('pedro@example.com')]);
  });

  it('hashes whatsapp as E.164 without +', () => {
    const ud = buildUserData({ whatsapp: '(81) 99999-8888' });
    expect(ud.ph).toEqual([_internalsForTests.sha256('5581999998888')]);
  });

  it('hashes first + last name separately', () => {
    const ud = buildUserData({ name: 'Pedro Portella Filho' });
    expect(ud.fn).toEqual([_internalsForTests.sha256('pedro')]);
    expect(ud.ln).toEqual([_internalsForTests.sha256('filho')]);
  });

  it('omits ln when only first name', () => {
    const ud = buildUserData({ name: 'Pedro' });
    expect(ud.fn).toEqual([_internalsForTests.sha256('pedro')]);
    expect(ud.ln).toBeUndefined();
  });

  it('passes IP and user agent unhashed (per Meta spec)', () => {
    const ud = buildUserData({ ip: '1.2.3.4', userAgent: 'Mozilla/5.0' });
    expect(ud.client_ip_address).toBe('1.2.3.4');
    expect(ud.client_user_agent).toBe('Mozilla/5.0');
  });

  it("ignores 'unknown' ip", () => {
    const ud = buildUserData({ ip: 'unknown' });
    expect(ud.client_ip_address).toBeUndefined();
  });

  it('omits empty fields cleanly', () => {
    const ud = buildUserData({});
    expect(ud.em).toBeUndefined();
    expect(ud.ph).toBeUndefined();
    expect(ud.fn).toBeUndefined();
  });

  it('hash is deterministic (same input → same hash)', () => {
    const a = buildUserData({ email: 'test@example.com' });
    const b = buildUserData({ email: 'test@example.com' });
    expect(a.em).toEqual(b.em);
  });
});
