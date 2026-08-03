/**
 * SIMULAÇÃO DE REPASSE — valores baseados na Portaria GM/MS 3.493/2024
 * e FAQ do Novo Modelo de Cofinanciamento Federal da APS (SAPS/MS).
 *
 * Componentes reais do cofinanciamento:
 * 1. Fixo — R$ por equipe homologada (varia por tipo de município)
 * 2. Qualidade — R$ por classificação da nota ISF (Ótimo/Bom/Suficiente/Regular)
 * 3. Capitação ponderada — R$ por pessoa cadastrada × fator de equidade
 *
 * Valores aproximados para município urbano de médio porte.
 * Fonte: https://www.gov.br/saude/pt-br/composicao/saps/esf/faq-novo-modelo-de-cofinanciamento-federal-da-aps
 */
import type { EquipeId } from './equipes'
import type { EquipeInstancia } from './municipio'
import { indicadoresDoTipo } from './municipio'
import { calcularNotaEquipe, classificacaoDaNota } from './nota'

/** Componente Fixo mensal por tipo de equipe (município urbano médio, aprox.) */
export const FIXO_MENSAL: Record<EquipeId, number> = {
  esf: 8300,    // eSF/eAP — Portaria GM/MS 3.493/2024
  esb: 4014,    // eSB I comum — FAQ SAPS
  emulti: 6000, // eMulti — valor aproximado
}

/** Componente Qualidade por classificação da nota ISF (por equipe/mês) */
export const QUALIDADE_MENSAL: Record<string, number> = {
  'Ótimo': 9000,
  'Bom': 6000,
  'Suficiente': 3000,
  'Regular': 1500,
}

/** Fator de capitação ponderada (R$ per capita/mês, aproximado) */
export const CAPITACAO_PER_CAPITA = 5.20

/** Fator de classificação para perda (1 = sem perda, 0 = perda total) */
export const FATOR_CLASSIFICACAO: Record<string, number> = {
  'Ótimo': 1,
  'Bom': 0.85,
  'Suficiente': 0.7,
  'Regular': 0.4,
} as const

export interface RepasseEquipe {
  equipe: EquipeInstancia
  nota: number
  classificacao: string
  fixoMensal: number
  qualidadeMensal: number
  totalMensal: number
  perdaMensal: number
}

/** Calcula repasse simulado de uma equipe a partir da nota mock. */
export function repasseDaEquipe(equipe: EquipeInstancia): RepasseEquipe {
  const nota = calcularNotaEquipe(equipe.chave, indicadoresDoTipo(equipe.tipo))
  const { label } = classificacaoDaNota(nota)
  const fixo = FIXO_MENSAL[equipe.tipo]
  const qualidade = QUALIDADE_MENSAL[label] ?? 0
  const total = fixo + qualidade
  const teto = fixo + QUALIDADE_MENSAL['Ótimo']
  return {
    equipe,
    nota,
    classificacao: label,
    fixoMensal: fixo,
    qualidadeMensal: qualidade,
    totalMensal: total,
    perdaMensal: teto - total,
  }
}

/** Totais do município. */
export function repasseDoMunicipio(equipes: EquipeInstancia[]): {
  porEquipe: RepasseEquipe[]
  totalMensal: number
  perdaMensal: number
  perdaAnual: number
} {
  const porEquipe = equipes.map(repasseDaEquipe)
  const totalMensal = porEquipe.reduce((s, r) => s + r.totalMensal, 0)
  const perdaMensal = porEquipe.reduce((s, r) => s + r.perdaMensal, 0)
  return { porEquipe, totalMensal, perdaMensal, perdaAnual: perdaMensal * 12 }
}

/** Formata valor monetário em R$ pt-BR sem depender de Intl no servidor. */
export function formatarReais(valor: number): string {
  return `R$ ${valor.toLocaleString('pt-BR')}`
}
