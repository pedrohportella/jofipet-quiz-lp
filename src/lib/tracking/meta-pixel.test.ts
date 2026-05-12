import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  fbqTrack,
  fbqTrackCustom,
  hasPixel,
  PIXEL_INIT_SCRIPT,
} from './meta-pixel';

describe('meta-pixel wrapper', () => {
  beforeEach(() => {
    delete (window as unknown as { fbq?: unknown }).fbq;
  });

  describe('hasPixel', () => {
    it('returns false when fbq is not defined', () => {
      expect(hasPixel()).toBe(false);
    });

    it('returns true when fbq is a function', () => {
      (window as unknown as { fbq: () => void }).fbq = () => {};
      expect(hasPixel()).toBe(true);
    });
  });

  describe('fbqTrack', () => {
    it('is a no-op when fbq is not loaded', () => {
      expect(() => fbqTrack('PageView')).not.toThrow();
    });

    it('calls fbq with (track, event) when no params', () => {
      const fbq = vi.fn();
      (window as unknown as { fbq: typeof fbq }).fbq = fbq;
      fbqTrack('PageView');
      expect(fbq).toHaveBeenCalledWith('track', 'PageView');
    });

    it('calls fbq with (track, event, params) when params provided', () => {
      const fbq = vi.fn();
      (window as unknown as { fbq: typeof fbq }).fbq = fbq;
      fbqTrack('ViewContent', { content_name: 'quiz_question_3' });
      expect(fbq).toHaveBeenCalledWith('track', 'ViewContent', {
        content_name: 'quiz_question_3',
      });
    });

    it('swallows errors thrown by fbq', () => {
      (window as unknown as { fbq: () => void }).fbq = () => {
        throw new Error('pixel broken');
      };
      expect(() => fbqTrack('PageView')).not.toThrow();
    });
  });

  describe('fbqTrackCustom', () => {
    it('calls fbq with trackCustom when params provided', () => {
      const fbq = vi.fn();
      (window as unknown as { fbq: typeof fbq }).fbq = fbq;
      fbqTrackCustom('JofiCustomEvent', { tier: 'quente' });
      expect(fbq).toHaveBeenCalledWith('trackCustom', 'JofiCustomEvent', {
        tier: 'quente',
      });
    });

    it('calls fbq with trackCustom and no params', () => {
      const fbq = vi.fn();
      (window as unknown as { fbq: typeof fbq }).fbq = fbq;
      fbqTrackCustom('JofiPing');
      expect(fbq).toHaveBeenCalledWith('trackCustom', 'JofiPing');
    });

    it('is a no-op when fbq is not loaded', () => {
      expect(() => fbqTrackCustom('Anything')).not.toThrow();
    });
  });

  describe('PIXEL_INIT_SCRIPT', () => {
    it('includes the pixel id passed in', () => {
      const script = PIXEL_INIT_SCRIPT('1234567890');
      expect(script).toContain("fbq('init', '1234567890')");
    });

    it('triggers a PageView on init', () => {
      const script = PIXEL_INIT_SCRIPT('1234567890');
      expect(script).toContain("fbq('track', 'PageView')");
    });
  });
});
