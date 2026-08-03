/**
 * Dados reais do Supabase para a página Gerencial (Fase 2).
 * Substitui src/lib/mock/repasse.ts — a lógica de cálculo de nota
 * é a mesma (média ponderada de ratio valor/meta), mas os valores
 * vêm de valores_indicadores no banco, não de mock determinístico.
 */
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

export interface RepasseEquipe {
  equipeId: string
  equipeNome: string
  tipo: string
  nota: number
  classificacao: string
  estilo: string
  baseMensal: number
  repasseMensal: number
  perdaMensal: number
}

const REPASSE_BASE: Record<string, number> = { esf: 38000, esb: 14000, emulti: 22000 }
const FATOR: Record<string, number> = { 'Ótimo': 1, 'Bom': 0.85, 'Suficiente': 0.7, 'Regular': 0.4 }

function classificacao(nota: number): { label: string; estilo: string } {
  if (nota >= 8.5) return { label: 'Ótimo', estilo: 'bg-emerald-100 text-emerald-700' }
  if (nota >= 7) return { label: 'Bom', estilo: 'bg-blue-100 text-blue-700' }
  if (nota >= 5) return { label: 'Suficiente', estilo: 'bg-amber-100 text-amber-700' }
  return { label: 'Regular', estilo: 'bg-red-100 text-red-700' }
}

export async function dadosGerencial(): Promise<{
  equipes: RepasseEquipe[]
  totalMensal: number
  perdaAnual: number
  notaMedia: number
}> {
  // 1. Buscar equipes ativas
  const { data: equipes } = await supabase.from('equipes').select('id,nome,tipo').eq('ativa', true)
  if (!equipes?.length) return { equipes: [], totalMensal: 0, perdaAnual: 0, notaMedia: 0 }

  // 2. Buscar indicadores
  const { data: indicadores } = await supabase.from('indicadores').select('id,codigo,peso,meta,invertido,escala10,grupo')

  // 3. Para cada equipe, buscar o último valor de cada indicador
  const resultados: RepasseEquipe[] = []

  for (const eq of equipes) {
    // Filtrar indicadores relevantes pelo grupo (aproximação — no mock era por tipo de equipe)
    const { data: valores } = await supabase
      .from('valores_indicadores')
      .select('indicador_id,valor')
      .eq('equipe_id', eq.id)
      .order('periodo', { ascending: false })
      .limit(100)

    if (!valores?.length) continue

    // Calcular nota: média ponderada do ratio valor/meta
    let somaPesos = 0
    let somaPonderada = 0

    for (const val of valores) {
      const ind = indicadores?.find(i => i.id === val.indicador_id)
      if (!ind) continue
      const ratio = ind.invertido
        ? Math.min(1, ind.meta / Math.max(Number(val.valor), 1))
        : Math.min(1, Number(val.valor) / ind.meta)
      somaPesos += ind.peso
      somaPonderada += ind.peso * ratio
    }

    const nota = somaPesos > 0 ? Math.round((somaPonderada / somaPesos) * 100) / 10 : 0
    const cls = classificacao(nota)
    const base = REPASSE_BASE[eq.tipo] ?? 22000
    const fator = FATOR[cls.label] ?? 0
    const repasse = Math.round(base * fator)
    const perda = base - repasse

    resultados.push({
      equipeId: eq.id,
      equipeNome: eq.nome,
      tipo: eq.tipo,
      nota,
      classificacao: cls.label,
      estilo: cls.estilo,
      baseMensal: base,
      repasseMensal: repasse,
      perdaMensal: perda,
    })
  }

  const totalMensal = resultados.reduce((s, r) => s + r.repasseMensal, 0)
  const perdaMensal = resultados.reduce((s, r) => s + r.perdaMensal, 0)
  const notaMedia = resultados.length > 0
    ? Math.round((resultados.reduce((s, r) => s + r.nota, 0) / resultados.length) * 10) / 10
    : 0

  return {
    equipes: resultados,
    totalMensal,
    perdaAnual: perdaMensal * 12,
    notaMedia,
  }
}
