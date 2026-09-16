import { describe, it, expect } from 'vitest';
import {
  PLANS,
  SPEND_TO_PLAN,
  TIER_TO_PLAN,
  getPlanById,
  getPlanPrice,
  getPriceBand,
  getRecommendedPlan,
  type PlanId,
} from './catalog';
import { getQuestionById } from '@/lib/quiz/loader';

describe('preço por faixa etária (16/09/2026)', () => {
  // Tabela da API do checkout da Jofi: faixa 0–7 anos e faixa 8+.
  const TABELA: Record<PlanId, { base: string; senior: string }> = {
    sereninho: { base: 'R$ 49,90/mês', senior: 'R$ 49,90/mês' },
    sereno: { base: 'R$ 79,90/mês', senior: 'R$ 109,90/mês' },
    parceiro: { base: 'R$ 169,90/mês', senior: 'R$ 209,90/mês' },
    'melhor-amigo': { base: 'R$ 259,90/mês', senior: 'R$ 309,90/mês' },
  };

  it('filhote e adulto pagam a faixa base; idoso (8+) paga a faixa sênior', () => {
    for (const plan of PLANS) {
      expect(getPlanPrice(plan, 'filhote').label).toBe(TABELA[plan.id].base);
      expect(getPlanPrice(plan, 'adulto').label).toBe(TABELA[plan.id].base);
      expect(getPlanPrice(plan, 'idoso').label).toBe(TABELA[plan.id].senior);
    }
  });

  it('o value acompanha a faixa (vai pro InitiateCheckout)', () => {
    const sereno = getPlanById('sereno')!;
    expect(getPlanPrice(sereno, 'adulto').value).toBe(79.9);
    expect(getPlanPrice(sereno, 'idoso').value).toBe(109.9);
  });

  it('sem idade conhecida mostra o priceLabel e o valor base', () => {
    const parceiro = getPlanById('parceiro')!;
    for (const idade of [undefined, null, '', 'outra-coisa', 7]) {
      expect(getPlanPrice(parceiro, idade)).toEqual({
        value: 169.9,
        label: 'A partir de R$ 169,90/mês',
      });
    }
  });

  it('priceLabel diz "A partir de" exatamente quando a faixa 8+ custa mais', () => {
    for (const plan of PLANS) {
      const variaPorIdade = plan.priceMonthlySenior !== plan.priceMonthly;
      expect(plan.priceLabel.startsWith('A partir de')).toBe(variaPorIdade);
      expect(plan.priceLabel).toContain(
        TABELA[plan.id].base.replace('/mês', ''),
      );
    }
  });

  it('toda opção da pergunta de idade do quiz cai numa faixa de preço', () => {
    const pergunta = getQuestionById('idade');
    expect(pergunta?.type).toBe('single-choice');
    if (pergunta?.type !== 'single-choice') return;
    for (const opcao of pergunta.options) {
      expect(getPriceBand(opcao.id)).not.toBeNull();
    }
    // A virada de preço é aos 8: o rótulo de idoso não pode voltar a ser "7+".
    const idoso = pergunta.options.find((o) => o.id === 'idoso');
    expect(idoso?.label).toMatch(/8 anos/);
    expect(getPriceBand('idoso')).toBe('senior');
  });
});

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
