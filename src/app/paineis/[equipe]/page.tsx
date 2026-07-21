import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AppShell } from '@/components/app-shell'
import { IndicadorCard } from '@/components/dashboard/indicador-card'
import { EQUIPES, EQUIPE_IDS, isEquipeId, nomeDoMembro } from '@/lib/mock/equipes'
import { PERFIS } from '@/lib/mock/perfis'
import { statusDoIndicador, valorMock } from '@/lib/mock/indicadores'
import { calcularNotaEquipe, classificacaoDaNota } from '@/lib/mock/nota'

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
    </AppShell>
  )
}
