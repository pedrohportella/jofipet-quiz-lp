import { describe, it, expect } from 'vitest';
import {
  buildResultVars,
  renderTemplate,
  getHeadline,
  getSubheadline,
  getBullets,
} from './result-template';

const baseAnswers = {
  'pet-ativo': 'sim',
  especie: 'cao',
  idade: 'idoso',
  'gasto-mensal': 250,
  preocupacao: 'saude',
  'plano-atual': 'nao',
};

describe('buildResultVars', () => {
  it('extracts first name', () => {
    const vars = buildResultVars({
      tier: 'quente',
      leadName: 'Pedro Portella Filho',
      answers: baseAnswers,
    });
    expect(vars.primeiroNome).toBe('Pedro');
  });

  it('falls back to "tutor" when no leadName', () => {
    const vars = buildResultVars({
      tier: 'quente',
      leadName: null,
      answers: baseAnswers,
    });
    expect(vars.primeiroNome).toBe('tutor');
  });

  it('maps especie + idade + preocupacao to BR labels', () => {
    const vars = buildResultVars({
      tier: 'quente',
      leadName: 'Maria',
      answers: baseAnswers,
    });
    expect(vars.especie).toBe('cãozinho');
    expect(vars.idade).toBe('idoso');
    expect(vars.preocupacao).toBe('saúde e imprevistos');
  });

  it('handles unknown especie gracefully', () => {
    const vars = buildResultVars({
      tier: 'quente',
      leadName: 'Maria',
      answers: { ...baseAnswers, especie: 'reptil' },
    });
    expect(vars.especie).toBe('pet');
  });

  it('parses gastoMensal as number', () => {
    const vars = buildResultVars({
      tier: 'quente',
      leadName: 'Maria',
      answers: baseAnswers,
    });
    expect(vars.gastoMensal).toBe(250);
  });
});

describe('renderTemplate', () => {
  const vars = {
    primeiroNome: 'Pedro',
    especie: 'cãozinho',
    idade: 'adulto',
    preocupacao: 'saúde',
    gastoMensal: 200,
    planoAtual: 'Não tenho',
  };

  it('replaces all placeholders', () => {
    const out = renderTemplate(
      '{primeiroNome}, seu {especie} {idade} {preocupacao} {gastoMensal} {planoAtual}',
      vars,
    );
    expect(out).toBe('Pedro, seu cãozinho adulto saúde R$ 200 Não tenho');
  });

  it('handles missing values with fallbacks', () => {
    const empty = { ...vars, idade: '', preocupacao: '', gastoMensal: null };
    const out = renderTemplate('{idade}/{preocupacao}/{gastoMensal}', empty);
    expect(out).toBe('do seu pet/o cuidado com o pet/esse valor');
  });
});

describe('getHeadline + getSubheadline + getBullets', () => {
  const vars = buildResultVars({
    tier: 'quente',
    leadName: 'Pedro',
    answers: baseAnswers,
  });

  it('quente headline mentions Parceiro/plano completo', () => {
    expect(getHeadline('quente')).toMatch(/plano completo/i);
  });

  it('quente subheadline interpolates primeiroNome + especie', () => {
    const sub = getSubheadline('quente', vars);
    expect(sub).toContain('Pedro');
    expect(sub).toContain('cãozinho');
  });

  it('returns 3 bullets per tier', () => {
    expect(getBullets('quente', vars)).toHaveLength(3);
    expect(getBullets('morno', vars)).toHaveLength(3);
    expect(getBullets('frio', vars)).toHaveLength(3);
  });

  it('bullets are rendered (no raw placeholders)', () => {
    const bullets = getBullets('morno', vars);
    for (const b of bullets) {
      expect(b).not.toMatch(/\{\w+\}/);
    }
  });
});
