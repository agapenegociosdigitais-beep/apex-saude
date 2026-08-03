/**
 * Dados reais do Supabase para dashboard de perfil (Fase 2.1).
 * Substitui valorMock() por valores reais da equipe do usuario.
 */
import { createClient } from '@supabase/supabase-js'
import { criarClienteSupabase } from '@/lib/supabase/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

export interface ValorIndicador {
  codigo: string
  valor: number
  meta: number
  invertido: boolean
}

/** Retorna valores reais dos indicadores da equipe do usuario, ou null se nao tiver equipe */
export async function valoresReaisDoUsuario(): Promise<{
  equipeNome: string
  equipeTipo: string
  municipioNome: string
  nota: number
  valores: ValorIndicador[]
  historico: Record<string, number[]>  // codigo → [valores dos ultimos meses]
  meses: string[]
} | null> {
  const authClient = await criarClienteSupabase()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return null

  const { data: usuario } = await authClient
    .from('usuarios').select('equipe_id').eq('id', user.id).single()
  if (!usuario?.equipe_id) return null

  const { data: equipe } = await supabase
    .from('equipes').select('id,nome,tipo,municipio_id')
    .eq('id', usuario.equipe_id).single()
  if (!equipe) return null

  const { data: municipio } = await supabase
    .from('municipios').select('nome').eq('id', equipe.municipio_id).single()

  const { data: indicadores } = await supabase
    .from('indicadores').select('id,codigo,meta,peso,invertido')

  // Valores mais recentes
  const { data: valoresRecentes } = await supabase
    .from('valores_indicadores')
    .select('indicador_id,valor,periodo')
    .eq('equipe_id', equipe.id)
    .order('periodo', { ascending: false })
    .limit(100)

  // Agregar por indicador (último valor)
  const valorMap: Record<string, number> = {}
  for (const v of valoresRecentes || []) {
    const ind = indicadores?.find(i => i.id === v.indicador_id)
    if (!ind || valorMap[ind.codigo] !== undefined) continue
    valorMap[ind.codigo] = Number(v.valor)
  }

  // Histórico: últimos 6 meses por indicador
  const { data: historicoData } = await supabase
    .from('valores_indicadores')
    .select('indicador_id,valor,periodo')
    .eq('equipe_id', equipe.id)
    .order('periodo', { ascending: true })
    .limit(500)

  const mesesSet = new Set<string>()
  const histMap: Record<string, number[]> = {}
  for (const h of historicoData || []) {
    const ind = indicadores?.find(i => i.id === h.indicador_id)
    if (!ind) continue
    mesesSet.add(h.periodo)
    if (!histMap[ind.codigo]) histMap[ind.codigo] = []
    histMap[ind.codigo].push(Number(h.valor))
  }

  // Calcular nota
  let somaPesos = 0, somaPonderada = 0
  const valores: ValorIndicador[] = []
  for (const ind of indicadores || []) {
    const val = valorMap[ind.codigo]
    if (val === undefined) continue
    const ratio = ind.invertido
      ? Math.min(1, ind.meta / Math.max(val, 1))
      : Math.min(1, val / ind.meta)
    somaPesos += ind.peso
    somaPonderada += ind.peso * ratio
    valores.push({ codigo: ind.codigo, valor: val, meta: ind.meta, invertido: ind.invertido })
  }

  return {
    equipeNome: equipe.nome,
    equipeTipo: equipe.tipo,
    municipioNome: municipio?.nome || '—',
    nota: somaPesos > 0 ? Math.round((somaPonderada / somaPesos) * 100) / 10 : 0,
    valores,
    historico: histMap,
    meses: [...mesesSet].sort(),
  }
}
