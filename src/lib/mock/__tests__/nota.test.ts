import { describe, expect, it } from 'vitest';
import { calcularNotaEquipe, classificacaoDaNota } from '../nota';
import { EQUIPES } from '../equipes';

describe('calcularNotaEquipe', () => {
  it('retorna nota entre 0 e 10 com 1 casa decimal', () => {
    const nota = calcularNotaEquipe('equipe-esf', EQUIPES.esf.indicadores);
    expect(nota).toBeGreaterThanOrEqual(0);
    expect(nota).toBeLessThanOrEqual(10);
    expect(Math.round(nota * 10) / 10).toBe(nota);
  });

  it('lista vazia de indicadores retorna 0', () => {
    expect(calcularNotaEquipe('x', [])).toBe(0);
  });

  it('é determinística', () => {
    const a = calcularNotaEquipe('equipe-esb', EQUIPES.esb.indicadores);
    const b = calcularNotaEquipe('equipe-esb', EQUIPES.esb.indicadores);
    expect(a).toBe(b);
  });
});

describe('classificacaoDaNota', () => {
  it('aplica as faixas oficiais: 8.5 ótimo, 7 bom, 5.5 suficiente, abaixo regular', () => {
    expect(classificacaoDaNota(9.2).label).toBe('Ótimo');
    expect(classificacaoDaNota(8.5).label).toBe('Ótimo');
    expect(classificacaoDaNota(7.0).label).toBe('Bom');
    expect(classificacaoDaNota(5.5).label).toBe('Suficiente');
    expect(classificacaoDaNota(3.1).label).toBe('Regular');
    expect(classificacaoDaNota(0).label).toBe('Regular');
  });
});
