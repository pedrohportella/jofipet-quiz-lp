/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  trackLead,
  trackQuizAnswer,
  trackQuizComplete,
  trackQuizStep,
  trackWhatsappClick,
} from './events';

declare global {
  interface Window {
    fbq?: any;
    gtag?: any;
  }
}

describe('tracking events', () => {
  beforeEach(() => {
    window.fbq = vi.fn();
    window.gtag = vi.fn();
  });

  it('trackQuizStep hits both fbq ViewContent and gtag quiz_step_view', () => {
    trackQuizStep(2, 'idade');
    expect(window.fbq).toHaveBeenCalledWith('track', 'ViewContent', {
      content_name: 'quiz_question_2',
      content_category: 'quiz_step',
    });
    expect(window.gtag).toHaveBeenCalledWith('event', 'quiz_step_view', {
      question_id: 'idade',
      step_number: 2,
    });
  });

  it('trackQuizAnswer serializes arrays to csv', () => {
    trackQuizAnswer({
      questionId: 'preocupacao',
      answerValue: ['saude', 'custo'],
      stepNumber: 5,
    });
    expect(window.gtag).toHaveBeenCalledWith('event', 'quiz_answer', {
      question_id: 'preocupacao',
      answer_value: 'saude,custo',
      step_number: 5,
      variant: 'default',
    });
  });

  it('trackLead fires Lead + CompleteRegistration + generate_lead', () => {
    trackLead({ tier: 'quente', hasEmail: true });
    expect(window.fbq).toHaveBeenCalledWith('track', 'Lead', {
      value: 0,
      currency: 'BRL',
      content_name: 'quente',
    });
    expect(window.fbq).toHaveBeenCalledWith('track', 'CompleteRegistration', {
      registration_method: 'quiz',
    });
    expect(window.gtag).toHaveBeenCalledWith('event', 'generate_lead', {
      tier: 'quente',
      has_email: true,
    });
  });

  it('trackWhatsappClick includes utm_source', () => {
    trackWhatsappClick({ tier: 'quente', utms: { utm_source: 'meta' } });
    expect(window.gtag).toHaveBeenCalledWith('event', 'whatsapp_click', {
      tier: 'quente',
      utm_source: 'meta',
    });
  });

  it('silently no-ops when fbq and gtag are missing', () => {
    delete window.fbq;
    delete window.gtag;
    expect(() =>
      trackQuizComplete({ tier: 'morno', score: 55, durationSec: 120 }),
    ).not.toThrow();
  });
});
