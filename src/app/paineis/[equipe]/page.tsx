import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AppShell } from '@/components/app-shell'
import { IndicadorCard } from '@/components/dashboard/indicador-card'
import { EQUIPES, EQUIPE_IDS, isEquipeId, nomeDoMembro } from '@/lib/mock/equipes'
import { PERFIS } from '@/lib/mock/perfis'
import { statusDoIndicador, valorMock } from '@/lib/mock/indicadores'
import { calcularNotaEquipe, classificacaoDaNota } from '@/lib/mock/nota'
import { equipesReaisPorTipo } from '@/lib/data/equipes'

export function generateStaticParams() {
  return EQUIPE_IDS.map((equipe) => ({ equipe }))
}

export default async function PainelEquipePage({
  params,
}: {
  params: Promise<{ equipe: string }>
}) {
  const { equipe } = await params
  if (!isEquipeId(equipe)) notFound()

  const config = EQUIPES[equipe]
  const nota = calcularNotaEquipe(`equipe-${equipe}`, config.indicadores)
  const classificacao = classificacaoDaNota(nota)

  // Dados reais do Supabase (Fase 2)
  const equipesReais = await equipesReaisPorTipo(equipe)
  const mediaReal = equipesReais.length > 0
    ? Math.round((equipesReais.reduce((s, e) => s + e.nota, 0) / equipesReais.length) * 10) / 10
    : null

  return (
    <AppShell active="painel">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface">Painel {config.nome}</h1>
          <p className="mt-1 text-on-surface-variant">
            {config.descricao} · dados de demonstração
          </p>
        </div>
        <div className="rounded-xl border border-outline-variant/40 bg-surface px-6 py-4 text-center shadow-ambient shrink-0">
          <p className="text-xs uppercase tracking-wide text-on-surface-variant">Nota da equipe</p>
          <p className="mt-1 font-mono text-3xl text-on-surface">
            {nota.toFixed(1).replace('.', ',')}
          </p>
          <span
            className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${classificacao.estilo}`}
          >
            {classificacao.label}
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-10">
        {config.indicadores.map((ind) => {
          const valor = valorMock(`equipe-${equipe}`, ind)
          return (
            <IndicadorCard
              key={ind.id}
              indicador={ind}
              valor={valor}
              status={statusDoIndicador(valor, ind)}
            />
          )
        })}
      </div>

      <section>
        <h2 className="text-lg font-semibold text-on-surface mb-4">Profissionais da equipe</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {config.membros.map((membroId) => {
            const membro = PERFIS[membroId]
            return (
              <Link
                key={membroId}
                href={`/dashboard/${membroId}`}
                className="group rounded-xl border border-outline-variant/40 bg-surface p-4 shadow-ambient hover-card"
              >
                <span className="text-xl">{membro.icon}</span>
                <p className="mt-2 font-medium text-on-surface group-hover:text-primary">
                  {nomeDoMembro(membroId)}
                </p>
                <p className="text-xs text-on-surface-variant">
                  {membro.indicadores.length} indicadores
                </p>
              </Link>
            )
          })}
        </div>
      </section>

      <div className="mt-8">
        <Link
          href={`/guias/${equipe}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          Abrir guia educativo {config.nome}
          <span className="material-symbols-outlined text-base">arrow_forward</span>
        </Link>
      </div>

      {/* Fase 2: equipes reais do Supabase */}
      {equipesReais.length > 0 && (
        <section className="mt-10 border-t border-outline-variant/30 pt-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">FASE 2</span>
            <h2 className="text-lg font-semibold text-on-surface">Equipes reais cadastradas</h2>
            {mediaReal !== null && (
              <span className="text-sm text-on-surface-variant">
                ({equipesReais.length} equipes · média {mediaReal.toFixed(1).replace('.', ',')})
              </span>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {equipesReais.map((eq) => {
              const cls = eq.nota >= 8.5 ? 'bg-emerald-100 text-emerald-700'
                : eq.nota >= 7 ? 'bg-blue-100 text-blue-700'
                : eq.nota >= 5 ? 'bg-amber-100 text-amber-700'
                : 'bg-red-100 text-red-700'
              return (
                <div key={eq.id} className="rounded-lg border border-outline-variant/30 bg-surface p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-on-surface text-sm">{eq.nome}</p>
                    <p className="text-xs text-on-surface-variant">{eq.municipioNome} · {eq.tipo.toUpperCase()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-on-surface">{eq.nota.toFixed(1).replace('.', ',')}</p>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>
                      {eq.nota >= 8.5 ? 'Ótimo' : eq.nota >= 7 ? 'Bom' : eq.nota >= 5 ? 'Suficiente' : 'Regular'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </AppShell>
  )
}
