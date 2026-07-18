import type { IndicadorConfig } from './perfis';
import { valorMock } from './indicadores';

/**
 * Nota da equipe (0–10): média ponderada do cumprimento de meta por indicador.
 * ratio = valor/meta (invertido: meta/valor), limitado a 1. Uma casa decimal.
 */
export function calcularNotaEquipe(
  chave: string,
  indicadores: readonly IndicadorConfig[]
): number {
  let somaPesos = 0;
  let somaPonderada = 0;
  for (const ind of indicadores) {
    const valor = valorMock(chave, ind);
    const ratio = Math.min(1, ind.invertido ? ind.meta / Math.max(valor, 1) : valor / ind.meta);
    somaPesos += ind.peso;
    somaPonderada += ind.peso * ratio;
  }
  if (somaPesos === 0) return 0;
  return Math.round((somaPonderada / somaPesos) * 100) / 10;
}

/** Classificação oficial da nota conforme faixas do incentivo federal. */
export function classificacaoDaNota(nota: number): {
  label: string;
  estilo: string;
} {
  if (nota >= 8.5) return { label: 'Ótimo', estilo: 'bg-emerald-100 text-emerald-700' };
  if (nota >= 7) return { label: 'Bom', estilo: 'bg-blue-100 text-blue-700' };
  if (nota >= 5.5) return { label: 'Suficiente', estilo: 'bg-amber-100 text-amber-700' };
  return { label: 'Regular', estilo: 'bg-red-100 text-red-700' };
}
