import type { EquipeId } from './equipes';
import type { EquipeInstancia } from './municipio';
import { indicadoresDoTipo } from './municipio';
import { calcularNotaEquipe, classificacaoDaNota } from './nota';

/**
 * SIMULAÇÃO DE REPASSE — valores ILUSTRATIVOS e configuráveis.
 * Não representa portaria oficial; serve para demonstrar o impacto
 * financeiro da classificação das equipes na negociação com municípios.
 * Fase 2: parâmetros por município salvos no Supabase.
 */
export const REPASSE_BASE_MENSAL: Record<EquipeId, number> = {
  esf: 38000,
  esb: 14000,
  emulti: 22000,
};

/** Fator de repasse por classificação da nota (ILUSTRATIVO). Chave = label de classificacaoDaNota. */
export const FATOR_CLASSIFICACAO: Record<string, number> = {
  'Ótimo': 1,
  Bom: 0.85,
  Suficiente: 0.7,
  Regular: 0.4,
};

export interface RepasseEquipe {
  equipe: EquipeInstancia;
  nota: number;
  classificacao: string;
  baseMensal: number;
  repasseMensal: number;
  perdaMensal: number;
}

/** Calcula repasse simulado de uma equipe a partir da nota mock. */
export function repasseDaEquipe(equipe: EquipeInstancia): RepasseEquipe {
  const nota = calcularNotaEquipe(equipe.chave, indicadoresDoTipo(equipe.tipo));
  const { label } = classificacaoDaNota(nota);
  const base = REPASSE_BASE_MENSAL[equipe.tipo];
  const fator = FATOR_CLASSIFICACAO[label] ?? 0;
  const repasse = Math.round(base * fator);
  return {
    equipe,
    nota,
    classificacao: label,
    baseMensal: base,
    repasseMensal: repasse,
    perdaMensal: base - repasse,
  };
}

/** Totais do município. */
export function repasseDoMunicipio(equipes: EquipeInstancia[]): {
  porEquipe: RepasseEquipe[];
  totalMensal: number;
  perdaMensal: number;
  perdaAnual: number;
} {
  const porEquipe = equipes.map(repasseDaEquipe);
  const totalMensal = porEquipe.reduce((s, r) => s + r.repasseMensal, 0);
  const perdaMensal = porEquipe.reduce((s, r) => s + r.perdaMensal, 0);
  return { porEquipe, totalMensal, perdaMensal, perdaAnual: perdaMensal * 12 };
}

/** Formata valor monetário em R$ pt-BR sem depender de Intl no servidor. */
export function formatarReais(valor: number): string {
  return `R$ ${valor.toLocaleString('pt-BR')}`;
}
