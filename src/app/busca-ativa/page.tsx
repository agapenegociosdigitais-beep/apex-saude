import Link from 'next/link'
import { AppShell } from '@/components/app-shell'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

export const dynamic = 'force-dynamic'

const INDICADORES_BUSCA = [
  { id: 'hba1c', col: 'hba1c_pendente', nome: 'HbA1c (Diabetes)', cor: 'bg-red-100 text-red-700', icone: '🧪' },
  { id: 'pa', col: 'pa_pendente', nome: 'PA (Hipertensão)', cor: 'bg-red-100 text-red-700', icone: '💓' },
  { id: 'colpo', col: 'colpocitologia_pendente', nome: 'Colpocitologia', cor: 'bg-amber-100 text-amber-700', icone: '🔬' },
  { id: 'mamo', col: 'mamografia_pendente', nome: 'Mamografia', cor: 'bg-amber-100 text-amber-700', icone: '🎗️' },
  { id: 'odonto', col: 'odontologico_pendente', nome: 'Odontológico', cor: 'bg-blue-100 text-blue-700', icone: '🦷' },
  { id: 'prenatal', col: 'pre_natal_pendente', nome: 'Pré-natal', cor: 'bg-purple-100 text-purple-700', icone: '🤰' },
]

export default async function BuscaAtivaPage() {
  // Contagem de pacientes pendentes por tipo
  const contagens: Record<string, number> = {}
  for (const ind of INDICADORES_BUSCA) {
    const { count } = await supabase.from('pacientes')
      .select('*', { count: 'exact', head: true })
      .eq(ind.col, true)
    contagens[ind.id] = count || 0
  }

  return (
    <AppShell active="painel">
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-on-surface">Busca Ativa</h1>
        <p className="mt-1 text-on-surface-variant">
          Listas nominais de pacientes com exames pendentes. Selecione um indicador para ver quem precisa de atendimento.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {INDICADORES_BUSCA.map(ind => (
          <Link
            key={ind.id}
            href={`/busca-ativa/${ind.id}`}
            className="rounded-xl bg-surface border border-outline-variant/40 p-6 shadow-ambient hover:shadow-hover transition-all group"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{ind.icone}</span>
              <h2 className="font-semibold text-on-surface group-hover:text-primary">{ind.nome}</h2>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-sm font-bold px-3 py-1 rounded-full ${ind.cor}`}>
                {contagens[ind.id]} pendentes
              </span>
              <span className="text-sm text-primary group-hover:underline">Ver lista →</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="rounded-xl bg-surface border border-outline-variant/40 p-6 shadow-ambient">
        <h3 className="font-semibold text-on-surface mb-2">📊 Resumo geral</h3>
        <p className="text-sm text-on-surface-variant">
          <strong>{Object.values(contagens).reduce((a, b) => a + b, 0)} pacientes</strong> com exames pendentes
          em {Object.values(contagens).filter(c => c > 0).length} categorias.
        </p>
        <p className="text-xs text-on-surface-variant mt-4">
          Os dados são fictícios (seed). Com o PEC conectado, as listas nominais serão geradas automaticamente
          a partir dos registros de atendimento reais de cada equipe.
        </p>
      </div>
    </AppShell>
  )
}
