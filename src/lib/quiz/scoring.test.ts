import { describe, it, expect } from 'vitest';
import { calculateTier } from './scoring';
import { scoringConfig, cepCoverageConfig } from './loader';
import type { Answers, CepCoverageConfig } from './types';

const strictCepCoverage: CepCoverageConfig = {
  version: 'test-strict',
  mode: 'strict',
  coveredRanges: [
    { from: '50000-000', to: '52999-999' },
    { from: '58000-000', to: '58099-999' },
  ],
  coveredCities: [],
};

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

describe('calculateTier — strict CEP coverage mode', () => {
  it('awards coveredScore when CEP is inside covered range (PE Recife)', () => {
    const answers: Answers = {
      'pet-ativo': 'sim',
      idade: 'adulto',
      'gasto-mensal': 120,
      cep: '50050-100',
    };
    const result = calculateTier(answers, scoringConfig, strictCepCoverage);
    expect(result.breakdown.cobertura).toBe(15); // coveredScore
  });

  it('awards coveredScore for second covered range (PB João Pessoa)', () => {
    const answers: Answers = {
      'pet-ativo': 'sim',
      idade: 'adulto',
      cep: '58030-000',
    };
    const result = calculateTier(answers, scoringConfig, strictCepCoverage);
    expect(result.breakdown.cobertura).toBe(15);
  });

  it('awards notCoveredScore when CEP is outside any range', () => {
    const answers: Answers = {
      'pet-ativo': 'sim',
      idade: 'adulto',
      cep: '01310-100', // SP, fora das faixas PE/PB
    };
    const result = calculateTier(answers, scoringConfig, strictCepCoverage);
    expect(result.breakdown.cobertura).toBe(3); // notCoveredScore
  });

  it('falls back to skippedScore when CEP has invalid format (less than 8 digits)', () => {
    const answers: Answers = {
      'pet-ativo': 'sim',
      idade: 'adulto',
      cep: '123', // muito curto
    };
    const result = calculateTier(answers, scoringConfig, strictCepCoverage);
    expect(result.breakdown.cobertura).toBe(5); // skippedScore (fallback)
  });

  it('accepts CEP without mask (raw digits)', () => {
    const answers: Answers = {
      'pet-ativo': 'sim',
      idade: 'adulto',
      cep: '50050100', // sem hífen
    };
    const result = calculateTier(answers, scoringConfig, strictCepCoverage);
    expect(result.breakdown.cobertura).toBe(15);
  });
});

describe('calculateTier — invariants', () => {
  it('score is never negative when not eliminated', () => {
    const samples: Answers[] = [
      { 'pet-ativo': 'sim' },
      { 'pet-ativo': 'sim', idade: 'filhote', 'gasto-mensal': 0 },
      { 'pet-ativo': 'sim', 'plano-atual': 'sim-jofi', cep: '' }, // penalty -50
    ];
    for (const a of samples) {
      const result = calculateTier(a, scoringConfig, cepCoverageConfig);
      if (!result.eliminated) {
        expect(result.score).toBeGreaterThanOrEqual(-100);
      }
    }
  });

  it('breakdown sum equals total score (no eliminated)', () => {
    const answers: Answers = {
      'pet-ativo': 'sim',
      idade: 'adulto',
      'ultima-vet': '1-6-meses',
      'gasto-mensal': 150,
      preocupacao: 'custo',
      'plano-atual': 'nao',
      cep: '01310-100',
    };
    const result = calculateTier(answers, scoringConfig, cepCoverageConfig);
    const sum =
      result.breakdown.pet_ativo +
      result.breakdown.gasto +
      result.breakdown.dor +
      result.breakdown.cobertura;
    expect(result.score).toBe(sum);
  });
});
