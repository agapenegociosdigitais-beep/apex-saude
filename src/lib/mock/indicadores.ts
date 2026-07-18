import type { IndicadorConfig } from './perfis';

export type StatusIndicador = 'otimo' | 'regular' | 'critico';

export const STATUS_LABEL: Record<StatusIndicador, string> = {
  otimo: 'Ótimo',
  regular: 'Regular',
  critico: 'Crítico',
};

/**
 * Gera valor mock determinístico por perfil+indicador (mesma entrada = mesmo valor).
 * Ranges: padrão 45–95% | invertido 5–30% | escala10 5.0–9.5.
 * Fase 2: substituir por leitura do Supabase (valores_indicadores).
 */
export function valorMock(perfilId: string, ind: IndicadorConfig): number {
  const chave = `${perfilId}:${ind.id}`;
  let hash = 0;
  for (const char of chave) {
    hash = (hash * 31 + char.charCodeAt(0)) % 9973;
  }
  if (ind.escala10) return Math.round((5 + (hash % 46) / 10) * 10) / 10;
  if (ind.invertido) return 5 + (hash % 26);
  return 45 + (hash % 51);
}

/** Classifica valor contra a meta: >=100% ótimo, >=70% regular, abaixo crítico. Invertidos respeitados. */
export function statusDoIndicador(valor: number, ind: IndicadorConfig): StatusIndicador {
  const ratio = ind.invertido ? ind.meta / Math.max(valor, 1) : valor / ind.meta;
  if (ratio >= 1) return 'otimo';
  if (ratio >= 0.7) return 'regular';
  return 'critico';
}

/** Percentual 0–100 para a barra de progresso. */
export function progressoPercentual(valor: number, ind: IndicadorConfig): number {
  const base = ind.escala10 ? 10 : 100;
  return Math.min(100, Math.round((valor / base) * 100));
}

/** Formata valor para exibição: "7,5" (escala10) ou "68%". */
export function formatarValor(valor: number, ind: IndicadorConfig): string {
  if (ind.escala10) return valor.toFixed(1).replace('.', ',');
  return `${Math.round(valor)}%`;
}

/** Formata meta para exibição. */
export function formatarMeta(ind: IndicadorConfig): string {
  if (ind.escala10) return ind.meta.toFixed(1).replace('.', ',');
  return `${ind.meta}%`;
}
