import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AppShell } from '@/components/app-shell'
import { createClient } from '@supabase/supabase-js'
import { FIXO_MENSAL, QUALIDADE_MENSAL } from '@/lib/mock/repasse'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

export const dynamic = 'force-dynamic'

export default async function EquipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: equipe } = await supabase.from('equipes').select('*, municipios(nome)').eq('id', id).single()
  if (!equipe) notFound()

  const { data: indicadores } = await supabase.from('indicadores').select('*')
  const { data: valores } = await supabase.from('valores_indicadores')
    .select('indicador_id,valor,periodo')
    .eq('equipe_id', id)
    .order('periodo', { ascending: false })
    .limit(200)

  // Último valor por indicador
  const ultimoValor: Record<string, number> = {}
  for (const v of valores || []) {
    if (ultimoValor[v.indicador_id] !== undefined) continue
    ultimoValor[v.indicador_id] = Number(v.valor)
  }

  // Nota
  let somaPesos = 0, somaPonderada = 0
  for (const ind of indicadores || []) {
    const val = ultimoValor[ind.id]
    if (val === undefined) continue
    const ratio = ind.invertido ? Math.min(1, ind.meta / Math.max(val, 1)) : Math.min(1, val / ind.meta)
    somaPesos += ind.peso
    somaPonderada += ind.peso * ratio
  }
  const nota = somaPesos > 0 ? Math.round((somaPonderada / somaPesos) * 100) / 10 : 0

  const cls = nota >= 8.5 ? { label: 'Ótimo', estilo: 'bg-emerald-100 text-emerald-700' }
    : nota >= 7 ? { label: 'Bom', estilo: 'bg-blue-100 text-blue-700' }
    : nota >= 5 ? { label: 'Suficiente', estilo: 'bg-amber-100 text-amber-700' }
    : { label: 'Regular', estilo: 'bg-red-100 text-red-700' }

  const fixo = FIXO_MENSAL[equipe.tipo as keyof typeof FIXO_MENSAL] ?? 6000
  const qualidade = QUALIDADE_MENSAL[cls.label] ?? 0
  const totalRepasse = fixo + qualidade
  const perda = fixo + QUALIDADE_MENSAL['Ótimo'] - totalRepasse

  return (
    <AppShell active="painel">
      <header className="mb-6">
        <Link href="/gerencial" className="text-sm text-primary hover:underline mb-2 inline-block">← Voltar ao gerencial</Link>
        <h1 className="text-2xl font-bold text-on-surface">{equipe.nome}</h1>
        <p className="text-on-surface-variant">
          {equipe.municipios?.nome} · {equipe.tipo.toUpperCase()} · nota {nota.toFixed(1).replace('.', ',')}
        </p>
      </header>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl bg-surface border p-4 text-center shadow-ambient">
          <p className="text-xs text-on-surface-variant uppercase">Nota ISF</p>
          <p className="text-2xl font-bold text-on-surface">{nota.toFixed(1).replace('.', ',')}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${cls.estilo}`}>{cls.label}</span>
        </div>
        <div className="rounded-xl bg-surface border p-4 text-center shadow-ambient">
          <p className="text-xs text-on-surface-variant uppercase">Repasse mensal</p>
          <p className="text-2xl font-bold text-on-surface">R$ {totalRepasse.toLocaleString('pt-BR')}</p>
          <p className="text-xs text-on-surface-variant">Fixo R$ {fixo.toLocaleString()} + Qualidade R$ {qualidade.toLocaleString()}</p>
        </div>
        <div className="rounded-xl bg-error-container/30 border border-error/20 p-4 text-center shadow-ambient">
          <p className="text-xs text-error uppercase">Perda mensal</p>
          <p className="text-2xl font-bold text-error">R$ {perda.toLocaleString('pt-BR')}</p>
          <p className="text-xs text-error/80">até o Ótimo (R$ {(fixo + QUALIDADE_MENSAL['Ótimo']).toLocaleString()})</p>
        </div>
      </div>

      <div className="rounded-xl bg-surface border shadow-ambient overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container-low border-b">
              {['Indicador', 'Valor', 'Meta', '% Meta', 'Status'].map(h => (
                <th key={h} className="py-3 px-4 text-xs uppercase tracking-wider text-on-surface-variant">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {(indicadores || []).map(ind => {
              const val = ultimoValor[ind.id]
              const pctMeta = val !== undefined ? Math.round((val / ind.meta) * 100) : null
              const status = pctMeta === null ? 'sem dados'
                : pctMeta >= 100 ? 'otimo' : pctMeta >= 70 ? 'regular' : 'critico'
              return (
                <tr key={ind.id} className="hover:bg-surface-container-low/80">
                  <td className="py-3 px-4">
                    <span className="font-mono text-xs bg-secondary text-on-secondary px-1.5 py-0.5 rounded mr-2">{ind.codigo}</span>
                    <span className="text-sm text-on-surface">{ind.nome}</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-sm">{val !== undefined ? (ind.escala10 ? val.toFixed(1) : `${Math.round(val)}%`) : '—'}</td>
                  <td className="py-3 px-4 text-sm text-on-surface-variant">{ind.escala10 ? ind.meta.toFixed(1) : `${ind.meta}%`}</td>
                  <td className="py-3 px-4 font-mono text-sm">{pctMeta !== null ? `${pctMeta}%` : '—'}</td>
                  <td className="py-3 px-4">
                    {status === 'otimo' && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Ótimo</span>}
                    {status === 'regular' && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Regular</span>}
                    {status === 'critico' && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Crítico</span>}
                    {status === 'sem dados' && <span className="text-xs text-on-surface-variant">—</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </AppShell>
  )
}
