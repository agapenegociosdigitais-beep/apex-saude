/**
 * Dados reais do Supabase para a página Gerencial (Fase 2).
 * Usa valores de repasse baseados na Portaria GM/MS 3.493/2024:
 * - Componente Fixo: R$/equipe/mês por tipo
 * - Componente Qualidade: R$/equipe/mês por classificação (Ótimo/Bom/Suficiente/Regular)
 * - Capitação Ponderada: R$ per capita/mês
 */
import { createClient } from '@supabase/supabase-js'
import { FIXO_MENSAL, QUALIDADE_MENSAL } from '@/lib/mock/repasse'

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
  fixoMensal: number
  qualidadeMensal: number
  totalMensal: number
  perdaMensal: number
}

function classificacao(nota: number): { label: string; estilo: string } {
  if (nota >= 8.5) return { label: 'Ótimo', estilo: 'bg-emerald-100 text-emerald-700' }
  if (nota >= 7) return { label: 'Bom', estilo: 'bg-blue-100 text-blue-700' }
  if (nota >= 5) return { label: 'Suficiente', estilo: 'bg-amber-100 text-amber-700' }
  return { label: 'Regular', estilo: 'bg-red-100 text-red-700' }
}

export async function dadosGerencial(): Promise<{
  equipes: RepasseEquipe[]
  totalMensal: number  // Fixo + Qualidade de todas as equipes
  perdaAnual: number
  notaMedia: number
}> {
  const { data: equipes } = await supabase.from('equipes').select('id,nome,tipo').eq('ativa', true)
  if (!equipes?.length) return { equipes: [], totalMensal: 0, perdaAnual: 0, notaMedia: 0 }

  const { data: indicadores } = await supabase.from('indicadores').select('id,codigo,peso,meta,invertido')

  const resultados: RepasseEquipe[] = []

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
    const cls = classificacao(nota)
    const fixo = FIXO_MENSAL[eq.tipo as keyof typeof FIXO_MENSAL] ?? 6000
    const qualidade = QUALIDADE_MENSAL[cls.label] ?? 0
    const teto = fixo + QUALIDADE_MENSAL['Ótimo']

    resultados.push({
      equipeId: eq.id, equipeNome: eq.nome, tipo: eq.tipo, nota,
      classificacao: cls.label, estilo: cls.estilo,
      fixoMensal: fixo, qualidadeMensal: qualidade,
      totalMensal: fixo + qualidade,
      perdaMensal: teto - (fixo + qualidade),
    })
  }

  const totalMensal = resultados.reduce((s, r) => s + r.totalMensal, 0)
  const perdaMensal = resultados.reduce((s, r) => s + r.perdaMensal, 0)
  const notaMedia = resultados.length > 0
    ? Math.round((resultados.reduce((s, r) => s + r.nota, 0) / resultados.length) * 10) / 10
    : 0

  return { equipes: resultados, totalMensal, perdaAnual: perdaMensal * 12, notaMedia }
}
