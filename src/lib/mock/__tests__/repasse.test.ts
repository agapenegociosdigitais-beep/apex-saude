import { describe, expect, it } from 'vitest';
import {
  FATOR_CLASSIFICACAO,
  REPASSE_BASE_MENSAL,
  formatarReais,
  repasseDaEquipe,
  repasseDoMunicipio,
} from '../repasse';
import { MUNICIPIO_MOCK } from '../municipio';

describe('repasseDaEquipe', () => {
  it('repasse nunca excede a base e perda = base - repasse', () => {
    for (const equipe of MUNICIPIO_MOCK.equipes) {
      const r = repasseDaEquipe(equipe);
      expect(r.repasseMensal).toBeLessThanOrEqual(r.baseMensal);
      expect(r.perdaMensal).toBe(r.baseMensal - r.repasseMensal);
      expect(r.baseMensal).toBe(REPASSE_BASE_MENSAL[equipe.tipo]);
    }
  });

  it('classificação Ótimo teria fator 1 (tabela de fatores íntegra)', () => {
    expect(FATOR_CLASSIFICACAO['Ótimo']).toBe(1);
    expect(FATOR_CLASSIFICACAO.Regular).toBeLessThan(FATOR_CLASSIFICACAO.Bom);
  });
});

describe('repasseDoMunicipio', () => {
  it('totais batem com a soma das equipes', () => {
    const r = repasseDoMunicipio(MUNICIPIO_MOCK.equipes);
    const somaRepasse = r.porEquipe.reduce((s, e) => s + e.repasseMensal, 0);
    const somaPerda = r.porEquipe.reduce((s, e) => s + e.perdaMensal, 0);
    expect(r.totalMensal).toBe(somaRepasse);
    expect(r.perdaMensal).toBe(somaPerda);
    expect(r.perdaAnual).toBe(somaPerda * 12);
  });

  it('lista vazia zera os totais', () => {
    const r = repasseDoMunicipio([]);
    expect(r.totalMensal).toBe(0);
    expect(r.perdaAnual).toBe(0);
  });
});

describe('formatarReais', () => {
  it('formata com separador de milhar pt-BR', () => {
    expect(formatarReais(38000)).toBe('R$ 38.000');
    expect(formatarReais(0)).toBe('R$ 0');
  });
});
