import { describe, expect, it } from 'vitest';
import {
  formatarMeta,
  formatarValor,
  progressoPercentual,
  statusDoIndicador,
  valorMock,
} from '../indicadores';
import type { IndicadorConfig } from '../perfis';

const IND_PADRAO: IndicadorConfig = { id: 'C1', nome: 'C1', peso: 1, meta: 75, invertido: false, escala10: false };
const IND_INVERTIDO: IndicadorConfig = { id: 'B3', nome: 'B3', peso: 2, meta: 25, invertido: true, escala10: false };
const IND_ESCALA10: IndicadorConfig = { id: 'C3', nome: 'Nota C3', peso: 1, meta: 7.5, invertido: false, escala10: true };

describe('valorMock', () => {
  it('é determinístico: mesma entrada, mesmo valor', () => {
    expect(valorMock('medico', IND_PADRAO)).toBe(valorMock('medico', IND_PADRAO));
  });

  it('varia por perfil e indicador', () => {
    const a = valorMock('medico', IND_PADRAO);
    const b = valorMock('dentista', IND_PADRAO);
    const c = valorMock('medico', { ...IND_PADRAO, id: 'C9' });
    expect(new Set([a, b, c]).size).toBeGreaterThan(1);
  });

  it('respeita ranges: padrão 45-95, invertido 5-30, escala10 5.0-9.5', () => {
    expect(valorMock('x', IND_PADRAO)).toBeGreaterThanOrEqual(45);
    expect(valorMock('x', IND_PADRAO)).toBeLessThanOrEqual(95);
    expect(valorMock('x', IND_INVERTIDO)).toBeGreaterThanOrEqual(5);
    expect(valorMock('x', IND_INVERTIDO)).toBeLessThanOrEqual(30);
    const v10 = valorMock('x', IND_ESCALA10);
    expect(v10).toBeGreaterThanOrEqual(5);
    expect(v10).toBeLessThanOrEqual(9.5);
  });
});

describe('statusDoIndicador', () => {
  it('>= meta é ótimo, >= 70% regular, abaixo crítico', () => {
    expect(statusDoIndicador(75, IND_PADRAO)).toBe('otimo');
    expect(statusDoIndicador(80, IND_PADRAO)).toBe('otimo');
    expect(statusDoIndicador(53, IND_PADRAO)).toBe('regular'); // 70,6%
    expect(statusDoIndicador(40, IND_PADRAO)).toBe('critico');
  });

  it('invertido: valor <= meta é ótimo', () => {
    expect(statusDoIndicador(25, IND_INVERTIDO)).toBe('otimo');
    expect(statusDoIndicador(10, IND_INVERTIDO)).toBe('otimo');
    expect(statusDoIndicador(50, IND_INVERTIDO)).toBe('critico'); // 25/50 = 50%
  });

  it('invertido com valor 0 não divide por zero', () => {
    expect(statusDoIndicador(0, IND_INVERTIDO)).toBe('otimo');
  });
});

describe('progressoPercentual', () => {
  it('limita a 100', () => {
    expect(progressoPercentual(150, IND_PADRAO)).toBe(100);
  });
  it('escala10 usa base 10', () => {
    expect(progressoPercentual(7.5, IND_ESCALA10)).toBe(75);
  });
});

describe('formatação', () => {
  it('percentual arredonda, escala10 usa vírgula', () => {
    expect(formatarValor(67.6, IND_PADRAO)).toBe('68%');
    expect(formatarValor(7.5, IND_ESCALA10)).toBe('7,5');
    expect(formatarMeta(IND_ESCALA10)).toBe('7,5');
  });
});
