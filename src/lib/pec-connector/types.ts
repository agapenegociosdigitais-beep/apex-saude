/**
 * PEC Connector — Types & Constants
 * 
 * Mapeamento do schema do PEC (Prontuário Eletrônico do Cidadão) PostgreSQL
 * para os 15 indicadores da NT 6/2025 - DEAPS/SAPS/MS
 * 
 * Baseado no schema oficial do e-SUS AB / DATASUS
 */

// ──── PEC Versões Suportadas ────
export type PecVersao = '5.2' | '5.3' | '5.4' | 'auto'

// ──── Tipo de Conexão ────
export type TipoConexao = 'pec_local' | 'pec_cloud' | 'sisaps' | 'arquivo'

// ──── Configuração de Integração ────
export interface IntegracaoPecConfig {
  id: string
  municipio_id: string
  tipo: TipoConexao
  
  // Conexão PEC Local (PostgreSQL)
  host?: string
  porta?: number        // default 5432
  database?: string     // default 'esus'
  usuario?: string      // usuário read-only
  senha?: string        // AES-256-GCM em repouso (ver lib/pec-connector/crypto.ts); nunca em texto puro no banco
  ssl?: boolean         // default false (rede local)
  
  // Sync
  ativo: boolean
  sincronizar_automatico: boolean
  frequencia_minutos: number  // default 1440 (24h)
  ultima_sincronizacao?: string
  status_sincronizacao?: 'ok' | 'falha' | 'pendente' | 'rodando'
  erro_ultima?: string
  
  created_at: string
  updated_at: string
}

// ──── Mapeamento PEC → Indicador ────
export interface PecIndicadorMapping {
  indicador_codigo: string     // 'C1', 'C2', ..., 'M2'
  tabela_pec: string            // tabela PostgreSQL
  campos_necessarios: string[]  // colunas que a query precisa
  query: string                 // SQL que retorna o valor
  descricao: string
}

// ──── Estrutura das Tabelas do PEC (schema DATASUS) ────
export interface PecFichaAtendimentoIndividual {
  uuid_ficha: string
  cns_cidadao: string
  dt_nascimento: Date
  nu_idade_anos: number
  dt_atendimento: Date
  co_cbo_profissional: string
  cns_profissional: string
  nu_micro_area: string
  st_pressao_arterial: boolean  // ← C5
  st_glicemia_capilar: boolean  // ← C4
  // ... muitos outros campos
}

export interface PecFichaProcedimentos {
  uuid_ficha: string
  cns_cidadao: string
  co_procedimento: string     // código SIGTAP
  co_cid10: string
  dt_realizacao: Date
  cns_profissional: string
  // procedimentos de rastreamento ← C7
}

export interface PecFichaAtendimentoOdontologico {
  uuid_ficha: string
  cns_cidadao: string
  dt_atendimento: Date
  cns_profissional: string
  // indicadores B1-B6
}

// ──── Resultado da Sincronização ────
export interface SyncResult {
  municipio_id: string
  iniciado_em: string
  finalizado_em: string
  duracao_segundos: number
  status: 'ok' | 'falha' | 'parcial'
  
  indicadores_atualizados: {
    codigo: string
    equipe_id: string
    valor_anterior: number | null
    valor_novo: number
    periodo: string
    status: 'ok' | 'erro'
    erro?: string
  }[]
  
  erros: string[]
  total_atualizados: number
  total_erros: number
}

// ──── Códigos de Procedimentos Relevantes ────
export const CODIGOS_PROCEDIMENTOS = {
  // C4 - Diabetes
  HBA1C: ['0202010420', '0202010412'],  // Hemoglobina glicada
  
  // C7 - Prevenção do Câncer
  COLPOCITOLOGIA: ['0203010019', '0203010027'],  // Citopatológico
  MAMOGRAFIA: ['0204030030', '0204030057'],       // Mamografia bilateral
  
  // B3 - Exodontia (INVERTIDO: quanto menos, melhor)
  EXODONTIA: ['0307010048', '0307010056', '0307010064'],
  
  // C1 - Indicador sintético de acesso
  // (calculado a partir de múltiplos atendimentos)
  ATENDIMENTOS_GERAIS: ['0301010064', '0301010072', '0301010129', '0301010137'],
} as const

// ──── Período de Cálculo ────
export type PeriodoCalculo = 'diario' | 'mensal' | 'quadrimestral'
