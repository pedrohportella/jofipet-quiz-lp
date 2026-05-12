import { describe, it, expect } from 'vitest';
import { calculateTier } from './scoring';
import { scoringConfig, cepCoverageConfig } from './loader';
import type { Answers } from './types';

describe('calculateTier', () => {
  it('classifies strong answers as quente', () => {
    const answers: Answers = {
      'pet-ativo': 'sim',
      idade: 'idoso',
      'ultima-vet': 'menos-1-mes',
      'gasto-mensal': 250,
      preocupacao: 'saude',
      'plano-atual': 'nao',
      cep: '01310-100',
    };
    const result = calculateTier(answers, scoringConfig, cepCoverageConfig);
    expect(result.tier).toBe('quente');
    expect(result.score).toBeGreaterThanOrEqual(scoringConfig.thresholds.quente);
    expect(result.eliminated).toBe(false);
  });

  it('classifies moderate answers as morno', () => {
    const answers: Answers = {
      'pet-ativo': 'sim',
      idade: 'adulto',
      'ultima-vet': '1-6-meses',
      'gasto-mensal': 80,
      preocupacao: 'custo',
      'plano-atual': 'sim-outro',
      cep: '01310-100',
    };
    const result = calculateTier(answers, scoringConfig, cepCoverageConfig);
    expect(result.tier).toBe('morno');
    expect(result.score).toBeGreaterThanOrEqual(scoringConfig.thresholds.morno);
    expect(result.score).toBeLessThan(scoringConfig.thresholds.quente);
  });

  it('classifies weak answers as frio', () => {
    const answers: Answers = {
      'pet-ativo': 'sim',
      idade: 'filhote',
      'ultima-vet': 'mais-6-meses',
      'gasto-mensal': 20,
      preocupacao: 'tudo-bem',
      'plano-atual': 'sim-outro',
      cep: '',
    };
    const result = calculateTier(answers, scoringConfig, cepCoverageConfig);
    expect(result.tier).toBe('frio');
    expect(result.score).toBeLessThan(scoringConfig.thresholds.morno);
  });

  it('eliminates and forces frio when pet-ativo=nao', () => {
    const answers: Answers = {
      'pet-ativo': 'nao',
      idade: 'idoso',
      'gasto-mensal': 500,
      preocupacao: 'saude',
    };
    const result = calculateTier(answers, scoringConfig, cepCoverageConfig);
    expect(result.tier).toBe('frio');
    expect(result.eliminated).toBe(true);
  });

  it('penalizes existing Jofi customer to frio', () => {
    const answers: Answers = {
      'pet-ativo': 'sim',
      idade: 'adulto',
      'ultima-vet': 'menos-1-mes',
      'gasto-mensal': 200,
      preocupacao: 'saude',
      'plano-atual': 'sim-jofi',
      cep: '01310-100',
    };
    const result = calculateTier(answers, scoringConfig, cepCoverageConfig);
    expect(result.tier).toBe('frio');
    expect(result.eliminated).toBe(false);
  });

  it('is deterministic — same input yields identical output', () => {
    const answers: Answers = {
      'pet-ativo': 'sim',
      idade: 'adulto',
      'gasto-mensal': 120,
      preocupacao: 'custo',
      cep: '01310-100',
    };
    const a = calculateTier(answers, scoringConfig, cepCoverageConfig);
    const b = calculateTier(answers, scoringConfig, cepCoverageConfig);
    expect(a).toEqual(b);
  });

  it('applies neutral skipped score when cep is missing', () => {
    const answers: Answers = {
      'pet-ativo': 'sim',
      idade: 'adulto',
      'gasto-mensal': 120,
    };
    const result = calculateTier(answers, scoringConfig, cepCoverageConfig);
    // cep skipped → 5 pts cobertura
    expect(result.breakdown.cobertura).toBe(5);
  });

  it('handles missing answers gracefully (no throw)', () => {
    const answers: Answers = {};
    const result = calculateTier(answers, scoringConfig, cepCoverageConfig);
    expect(result.tier).toBe('frio');
    expect(result.score).toBe(5); // apenas o skippedScore do cep
  });
});
