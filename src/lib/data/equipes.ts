/**
 * Dados reais do Supabase para painéis de equipe (Fase 2).
 * Busca valores agregados por tipo de equipe (esf/esb/emulti)
 * para substituir o valorMock() determinístico.
 */
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

export interface EquipeReal {
  id: string
  nome: string
  tipo: string
  municipioNome: string
  nota: number
}

export async function equipesReaisPorTipo(tipo: string): Promise<EquipeReal[]> {
  const { data: equipes } = await supabase
    .from('equipes')
    .select('id,nome,tipo,municipio_id')
    .eq('tipo', tipo)
    .eq('ativa', true)
  if (!equipes?.length) return []

  // Buscar nomes de municipios
  const { data: municipios } = await supabase.from('municipios').select('id,nome')

  const munMap: Record<string, string> = {}
  municipios?.forEach(m => { munMap[m.id] = m.nome })

  // Buscar indicadores para cálculo de nota
  const { data: indicadores } = await supabase
    .from('indicadores')
    .select('id,codigo,peso,meta,invertido')

  const resultados: EquipeReal[] = []

  for (const eq of equipes) {
    const { data: valores } = await supabase
      .from('valores_indicadores')
      .select('indicador_id,valor')
      .eq('equipe_id', eq.id)
      .order('periodo', { ascending: false })
      .limit(100)

    let somaPesos = 0
    let somaPonderada = 0

    for (const val of valores || []) {
      const ind = indicadores?.find(i => i.id === val.indicador_id)
      if (!ind) continue
      const ratio = ind.invertido
        ? Math.min(1, ind.meta / Math.max(Number(val.valor), 1))
        : Math.min(1, Number(val.valor) / ind.meta)
      somaPesos += ind.peso
      somaPonderada += ind.peso * ratio
    }

    const nota = somaPesos > 0 ? Math.round((somaPonderada / somaPesos) * 100) / 10 : 0

    resultados.push({
      id: eq.id,
      nome: eq.nome,
      tipo: eq.tipo,
      municipioNome: munMap[eq.municipio_id] || '—',
      nota,
    })
  }

  return resultados.sort((a, b) => b.nota - a.nota)
}
