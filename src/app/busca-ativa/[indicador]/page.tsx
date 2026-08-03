import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AppShell } from '@/components/app-shell'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

export const dynamic = 'force-dynamic'

const INDICADORES: Record<string, { col: string; nome: string; icone: string; meta: string }> = {
  hba1c: { col: 'hba1c_pendente', nome: 'HbA1c — Diabetes', icone: '🧪', meta: 'HbA1c atualizada' },
  pa: { col: 'pa_pendente', nome: 'PA — Hipertensão', icone: '💓', meta: 'PA aferida nos últimos 6 meses' },
  colpo: { col: 'colpocitologia_pendente', nome: 'Colpocitologia', icone: '🔬', meta: 'Exame citopatológico em dia' },
  mamo: { col: 'mamografia_pendente', nome: 'Mamografia', icone: '🎗️', meta: 'Mamografia de rastreamento em dia' },
  odonto: { col: 'odontologico_pendente', nome: 'Odontológico', icone: '🦷', meta: 'Atendimento odontológico no período' },
  prenatal: { col: 'pre_natal_pendente', nome: 'Pré-natal', icone: '🤰', meta: 'Consulta de pré-natal em dia' },
}

export default async function BuscaAtivaIndicadorPage({ params }: { params: Promise<{ indicador: string }> }) {
  const { indicador } = await params
  const config = INDICADORES[indicador]
  if (!config) notFound()

  const { data: pacientes, count } = await supabase
    .from('pacientes')
    .select('id,cns,nome,data_nascimento,sexo,telefone,ultima_consulta,equipe_id,equipes(nome,tipo)', { count: 'exact' })
    .eq(config.col, true)
    .order('nome')
    .limit(200)

  return (
    <AppShell active="painel">
      <header className="mb-6">
        <Link href="/busca-ativa" className="text-sm text-primary hover:underline mb-2 inline-block">← Voltar</Link>
        <h1 className="text-2xl font-bold text-on-surface flex items-center gap-2">
          <span>{config.icone}</span> {config.nome}
        </h1>
        <p className="text-on-surface-variant mt-1">
          {count} pacientes com <strong>{config.meta}</strong> pendente.
        </p>
      </header>

      <div className="flex gap-4 mb-4">
        <a
          href={`/api/busca-ativa/csv?indicador=${indicador}`}
          className="text-sm bg-primary text-on-primary px-4 py-2 rounded-lg hover:bg-primary-container transition-colors inline-flex items-center gap-2"
        >
          📥 Exportar CSV
        </a>
        <span className="text-xs text-on-surface-variant self-center">
          Para imprimir e distribuir para os agentes de saúde
        </span>
      </div>

      <div className="rounded-xl bg-surface border shadow-ambient overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-surface-container-low border-b">
                {['Nome', 'CNS', 'Nasc.', 'Sexo', 'Telefone', 'Última consulta', 'Equipe'].map(h => (
                  <th key={h} className="py-3 px-3 text-xs uppercase tracking-wider text-on-surface-variant font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {pacientes?.map(p => {
                const idade = p.data_nascimento
                  ? new Date().getFullYear() - new Date(p.data_nascimento).getFullYear()
                  : null
                return (
                  <tr key={p.id} className="hover:bg-surface-container-low/80">
                    <td className="py-2.5 px-3 font-medium text-on-surface">{p.nome}</td>
                    <td className="py-2.5 px-3 font-mono text-xs text-on-surface-variant">{p.cns}</td>
                    <td className="py-2.5 px-3 text-on-surface-variant text-xs">
                      {p.data_nascimento ? new Date(p.data_nascimento).toLocaleDateString('pt-BR') : '—'}
                      {idade !== null && <span className="ml-1">({idade}a)</span>}
                    </td>
                    <td className="py-2.5 px-3 text-xs">{p.sexo}</td>
                    <td className="py-2.5 px-3 font-mono text-xs">{p.telefone || '—'}</td>
                    <td className="py-2.5 px-3 text-xs text-on-surface-variant">
                      {p.ultima_consulta ? new Date(p.ultima_consulta).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-xs">
                      <Link href={`/equipes/${p.equipe_id}`} className="text-primary hover:underline">
                        {p.equipes && typeof p.equipes === 'object' && !Array.isArray(p.equipes) ? (p.equipes as {nome:string}).nome : '—'}
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  )
}
