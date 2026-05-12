import { describe, it, expect, beforeEach } from 'vitest';
import {
  appendUtmsToUrl,
  extractUtmsFromSearch,
  loadStoredUtms,
  storeUtms,
} from './utms';

describe('utms', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  describe('extractUtmsFromSearch', () => {
    it('extracts all canonical UTM keys', () => {
      const result = extractUtmsFromSearch(
        '?utm_source=meta&utm_medium=cpc&utm_campaign=jofi_apr&utm_content=quiz_a&utm_term=saude',
      );
      expect(result).toEqual({
        utm_source: 'meta',
        utm_medium: 'cpc',
        utm_campaign: 'jofi_apr',
        utm_content: 'quiz_a',
        utm_term: 'saude',
      });
    });

    it('ignores non-UTM params', () => {
      const result = extractUtmsFromSearch('?foo=bar&utm_source=meta');
      expect(result).toEqual({ utm_source: 'meta' });
    });

    it('returns empty object when no UTMs present', () => {
      expect(extractUtmsFromSearch('')).toEqual({});
    });
  });

  describe('storeUtms + loadStoredUtms roundtrip', () => {
    it('persists and reads back', () => {
      storeUtms({ utm_source: 'meta', utm_campaign: 'abril' });
      expect(loadStoredUtms()).toEqual({
        utm_source: 'meta',
        utm_campaign: 'abril',
      });
    });

    it('loads empty when nothing stored', () => {
      expect(loadStoredUtms()).toEqual({});
    });

    it('no-ops when utms is empty', () => {
      storeUtms({});
      expect(window.sessionStorage.getItem('jofi-utms-v1')).toBeNull();
    });
  });

  describe('appendUtmsToUrl', () => {
    it('appends utms as query params', () => {
      const result = appendUtmsToUrl('https://example.com/path', {
        utm_source: 'meta',
        utm_medium: 'cpc',
      });
      expect(result).toContain('utm_source=meta');
      expect(result).toContain('utm_medium=cpc');
    });

    it('does not overwrite existing params', () => {
      const result = appendUtmsToUrl('https://example.com?utm_source=manual', {
        utm_source: 'meta',
      });
      expect(result).toContain('utm_source=manual');
      expect(result).not.toContain('utm_source=meta');
    });

    it('returns original url on invalid base', () => {
      expect(appendUtmsToUrl('not a url', { utm_source: 'x' })).toBe(
        'not a url',
      );
    });
  });
});
