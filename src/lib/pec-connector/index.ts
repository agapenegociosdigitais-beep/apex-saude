/**
 * PEC Connector - Module Index
 * Exporta todas as funcoes publicas do modulo
 */

export { testarConexao, validarSchema, executarQuery } from './connection'
export { getQuery, getIndicadoresSuportados, PEC_INDICADOR_QUERIES } from './queries'
export { sincronizarIndicadores, sincronizarMunicipio } from './sync'
export type { IntegracaoPecConfig, SyncResult, PecIndicadorMapping, TipoConexao } from './types'
