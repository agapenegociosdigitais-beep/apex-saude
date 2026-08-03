import { describe, expect, it } from 'vitest';
import {
  FIXO_MENSAL,
  QUALIDADE_MENSAL,
  formatarReais,
  repasseDaEquipe,
  repasseDoMunicipio,
} from '../repasse';
import { MUNICIPIO_MOCK } from '../municipio';

describe('repasseDaEquipe', () => {
  it('total = fixo + qualidade e perda = teto - total', () => {
    for (const equipe of MUNICIPIO_MOCK.equipes) {
      const r = repasseDaEquipe(equipe);
      expect(r.totalMensal).toBe(r.fixoMensal + r.qualidadeMensal);
      const teto = FIXO_MENSAL[equipe.tipo] + QUALIDADE_MENSAL['Ótimo'];
      expect(r.perdaMensal).toBe(teto - r.totalMensal);
      expect(r.fixoMensal).toBe(FIXO_MENSAL[equipe.tipo]);
    }
  });

  it('classificação Ótimo = qualidade máxima (R$ 9.000)', () => {
    expect(QUALIDADE_MENSAL['Ótimo']).toBe(9000);
    expect(QUALIDADE_MENSAL.Regular).toBeLessThan(QUALIDADE_MENSAL.Bom);
  });
});

describe('repasseDoMunicipio', () => {
  it('totais batem com a soma das equipes', () => {
    const r = repasseDoMunicipio(MUNICIPIO_MOCK.equipes);
    const somaTotal = r.porEquipe.reduce((s, e) => s + e.totalMensal, 0);
    const somaPerda = r.porEquipe.reduce((s, e) => s + e.perdaMensal, 0);
    expect(r.totalMensal).toBe(somaTotal);
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
    expect(formatarReais(8300)).toBe('R$ 8.300');
    expect(formatarReais(0)).toBe('R$ 0');
  });
});
