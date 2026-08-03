/**
 * Dados reais do Supabase para dashboard de perfil (Fase 2).
 * Busca a equipe vinculada ao usuario e seus indicadores reais.
 */
import { createClient } from '@supabase/supabase-js'
import { criarClienteSupabase } from '@/lib/supabase/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

export interface EquipeDoUsuario {
  equipeId: string
  equipeNome: string
  equipeTipo: string
  municipioNome: string
  nota: number
  indicadores: { codigo: string; nome: string; valor: number; meta: number }[]
}

export async function equipeDoUsuario(): Promise<EquipeDoUsuario | null> {
  const authClient = await criarClienteSupabase()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return null

  const { data: usuario } = await authClient
    .from('usuarios')
    .select('equipe_id')
    .eq('id', user.id)
    .single()
  if (!usuario?.equipe_id) return null

  const { data: equipe } = await supabase
    .from('equipes')
    .select('id,nome,tipo,municipio_id')
    .eq('id', usuario.equipe_id)
    .single()
  if (!equipe) return null

  const { data: municipio } = await supabase
    .from('municipios')
    .select('nome')
    .eq('id', equipe.municipio_id)
    .single()

  const { data: valores } = await supabase
    .from('valores_indicadores')
    .select('indicador_id,valor')
    .eq('equipe_id', equipe.id)
    .order('periodo', { ascending: false })
    .limit(50)

  const { data: indicadores } = await supabase
    .from('indicadores')
    .select('id,codigo,nome,meta,peso,invertido')

  let somaPesos = 0
  let somaPonderada = 0
  const inds: EquipeDoUsuario['indicadores'] = []

  for (const val of valores || []) {
    const ind = indicadores?.find(i => i.id === val.indicador_id)
    if (!ind) continue
    const ratio = ind.invertido
      ? Math.min(1, ind.meta / Math.max(Number(val.valor), 1))
      : Math.min(1, Number(val.valor) / ind.meta)
    somaPesos += ind.peso
    somaPonderada += ind.peso * ratio
    // dedup by codigo
    if (!inds.find(x => x.codigo === ind.codigo)) {
      inds.push({ codigo: ind.codigo, nome: ind.nome, valor: Number(val.valor), meta: ind.meta })
    }
  }

  return {
    equipeId: equipe.id,
    equipeNome: equipe.nome,
    equipeTipo: equipe.tipo,
    municipioNome: municipio?.nome || '—',
    nota: somaPesos > 0 ? Math.round((somaPonderada / somaPesos) * 100) / 10 : 0,
    indicadores: inds.slice(0, 15),
  }
}
