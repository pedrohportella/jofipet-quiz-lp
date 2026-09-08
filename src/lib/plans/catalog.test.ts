import { describe, it, expect } from 'vitest';
import {
  PLANS,
  SPEND_TO_PLAN,
  TIER_TO_PLAN,
  getPlanById,
  getRecommendedPlan,
} from './catalog';

describe('getRecommendedPlan — faixas de gasto (08/09/2026)', () => {
  it('até R$100 recomenda o Sereno', () => {
    for (const gasto of [0, 20, 60, 80, 100]) {
      expect(getRecommendedPlan(gasto, 'morno').id).toBe('sereno');
    }
  });

  it('acima de R$100 e até R$200 recomenda o Parceiro', () => {
    for (const gasto of [120, 160, 200]) {
      expect(getRecommendedPlan(gasto, 'morno').id).toBe('parceiro');
    }
  });

  it('acima de R$200 recomenda o Melhor Amigo', () => {
    for (const gasto of [220, 380, 500]) {
      expect(getRecommendedPlan(gasto, 'morno').id).toBe('melhor-amigo');
    }
  });

  it('o gasto vence o tier — quente que gasta pouco recebe Sereno', () => {
    expect(getRecommendedPlan(40, 'quente').id).toBe('sereno');
    expect(getRecommendedPlan(300, 'frio').id).toBe('melhor-amigo');
  });

  it('sem gasto declarado cai no mapa por tier', () => {
    expect(getRecommendedPlan(null, 'quente').id).toBe(TIER_TO_PLAN.quente);
    expect(getRecommendedPlan(undefined, 'morno').id).toBe(TIER_TO_PLAN.morno);
    expect(getRecommendedPlan(Number.NaN, 'frio').id).toBe(TIER_TO_PLAN.frio);
  });

  it('toda faixa aponta pra um plano que existe no catálogo', () => {
    for (const faixa of SPEND_TO_PLAN) {
      expect(getPlanById(faixa.planId)).toBeDefined();
    }
    for (const planId of Object.values(TIER_TO_PLAN)) {
      expect(getPlanById(planId)).toBeDefined();
    }
  });

  it('as faixas cobrem todo o range do slider do quiz (0 a 500, de 20 em 20)', () => {
    for (let gasto = 0; gasto <= 500; gasto += 20) {
      const plan = getRecommendedPlan(gasto, 'morno');
      expect(PLANS.map((p) => p.id)).toContain(plan.id);
    }
  });
});
