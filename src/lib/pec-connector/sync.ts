/**
 * PEC Connector - Sync Engine
 * Orquestra a sincronizacao PEC -> APEX
 */

import { IntegracaoPecConfig, SyncResult } from './types'
import { executarQuery, testarConexao } from './connection'
import { PEC_INDICADOR_QUERIES } from './queries'
import { criarClienteSupabase } from '@/lib/supabase/server'

export async function sincronizarIndicadores(
  config: IntegracaoPecConfig,
  equipeIne: string,
  dataInicio: string,
  dataFim: string
): Promise<SyncResult> {
  const start = Date.now()
  const result: SyncResult = {
    municipio_id: config.municipio_id,
    iniciado_em: new Date().toISOString(),
    finalizado_em: '',
    duracao_segundos: 0,
    status: 'ok',
    indicadores_atualizados: [],
    erros: [],
    total_atualizados: 0,
    total_erros: 0,
  }

  const supabase = await criarClienteSupabase()

  for (const [codigo, mapping] of Object.entries(PEC_INDICADOR_QUERIES)) {
    try {
      console.log(`[PEC] Sincronizando ${codigo} - ${mapping.descricao}`)
      const rows = await executarQuery(config, mapping.query, [equipeIne, dataInicio, dataFim])
      
      if (!rows || rows.length === 0) {
        result.indicadores_atualizados.push({
          codigo, equipe_id: equipeIne, valor_anterior: null, valor_novo: 0,
          periodo: dataInicio, status: 'ok',
        })
        result.total_atualizados++
        continue
      }

      const row = rows[0]
      const valor = calcularValorIndicador(codigo, row)

      const { data: indicador } = await supabase
        .from('indicadores')
        .select('id')
        .eq('codigo', codigo)
        .single()

      const { data: equipe } = await supabase
        .from('equipes')
        .select('id')
        .eq('codigo_ine', equipeIne)
        .single()

      if (!indicador || !equipe) {
        result.erros.push(`${codigo}: indicador ou equipe nao encontrado`)
        result.total_erros++
        continue
      }

      const { data: anterior } = await supabase
        .from('valores_indicadores')
        .select('valor')
        .eq('equipe_id', equipe.id)
        .eq('indicador_id', indicador.id)
        .eq('periodo', dataInicio)
        .single()

      await supabase.from('valores_indicadores').upsert({
        equipe_id: equipe.id,
        indicador_id: indicador.id,
        valor,
        periodo: dataInicio,
        updated_by: null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'equipe_id,indicador_id,periodo' })

      result.indicadores_atualizados.push({
        codigo, equipe_id: equipeIne,
        valor_anterior: anterior?.valor ?? null,
        valor_novo: valor,
        periodo: dataInicio,
        status: 'ok',
      })
      result.total_atualizados++

    } catch (err: any) {
      console.error(`[PEC] Erro ${codigo}:`, err.message)
      result.erros.push(`${codigo}: ${err.message}`)
      result.total_erros++
      result.indicadores_atualizados.push({
        codigo, equipe_id: equipeIne,
        valor_anterior: null, valor_novo: 0,
        periodo: dataInicio, status: 'erro', erro: err.message,
      })
    }
  }

  result.finalizado_em = new Date().toISOString()
  result.duracao_segundos = (Date.now() - start) / 1000
  
  if (result.total_erros > 0 && result.total_atualizados > 0) result.status = 'parcial'
  if (result.total_atualizados === 0) result.status = 'falha'

  return result
}

function calcularValorIndicador(codigo: string, row: Record<string, any>): number {
  const keys = Object.keys(row)
  const numerador = keys.find(k => k !== 'total_cadastrados' && k !== 'total' && !k.startsWith('total_'))
  const denominador = keys.find(k => k === 'total_cadastrados' || k === 'total') || 'total'
  
  if (!numerador) return row[keys[0]] || 0
  
  const num = parseFloat(row[numerador]) || 0
  const den = parseFloat(row[denominador]) || 1
  
  if (den === 0) return 0
  
  const pct = (num / den) * 100
  return Math.round(pct * 100) / 100
}

export async function sincronizarMunicipio(
  config: IntegracaoPecConfig,
  equipes: string[]
): Promise<SyncResult[]> {
  const hoje = new Date()
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
  const inicioStr = inicio.toISOString().split('T')[0]
  const hojeStr = hoje.toISOString().split('T')[0]
  
  const resultados: SyncResult[] = []

  for (const equipeIne of equipes) {
    console.log(`[PEC] Sincronizando equipe ${equipeIne}...`)
    const res = await sincronizarIndicadores(config, equipeIne, inicioStr, hojeStr)
    resultados.push(res)
  }

  return resultados
}
