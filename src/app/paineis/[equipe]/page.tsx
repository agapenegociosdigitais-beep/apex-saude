import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { IndicadorCard } from '@/components/dashboard/indicador-card';
import { EQUIPES, EQUIPE_IDS, isEquipeId, nomeDoMembro } from '@/lib/mock/equipes';
import { PERFIS } from '@/lib/mock/perfis';
import { statusDoIndicador, valorMock } from '@/lib/mock/indicadores';
import { calcularNotaEquipe, classificacaoDaNota } from '@/lib/mock/nota';

export function generateStaticParams() {
  return EQUIPE_IDS.map((equipe) => ({ equipe }));
}

export default async function PainelEquipePage({
  params,
}: {
  params: Promise<{ equipe: string }>;
}) {
  const { equipe } = await params;
  if (!isEquipeId(equipe)) notFound();

  const config = EQUIPES[equipe];
  const nota = calcularNotaEquipe(`equipe-${equipe}`, config.indicadores);
  const classificacao = classificacaoDaNota(nota);

  return (
    <div className="min-h-screen bg-apex-bg">
      <DashboardHeader nomePerfil={config.nome} equipe="Painel de equipe" icon={config.icon} />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold text-apex-ink">
              Painel {config.nome}
            </h1>
            <p className="mt-1 text-apex-muted">{config.descricao} · dados de demonstração</p>
          </div>
          <div className="rounded-xl border border-apex-border bg-white px-6 py-4 text-center shadow-sm">
            <p className="text-xs uppercase tracking-wide text-apex-muted">Nota da equipe</p>
            <p className="mt-1 font-mono text-3xl text-apex-ink">
              {nota.toFixed(1).replace('.', ',')}
            </p>
            <span
              className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${classificacao.estilo}`}
            >
              {classificacao.label}
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {config.indicadores.map((ind) => {
            const valor = valorMock(`equipe-${equipe}`, ind);
            return (
              <IndicadorCard
                key={ind.id}
                indicador={ind}
                valor={valor}
                status={statusDoIndicador(valor, ind)}
              />
            );
          })}
        </div>

        <section className="mt-8">
          <h2 className="font-display text-lg font-semibold text-apex-ink">
            Profissionais da equipe
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {config.membros.map((membroId) => {
              const membro = PERFIS[membroId];
              return (
                <Link
                  key={membroId}
                  href={`/dashboard/${membroId}`}
                  className="group rounded-xl border border-apex-border bg-white p-4 shadow-sm transition hover:border-apex-gold"
                >
                  <span className="text-xl">{membro.icon}</span>
                  <p className="mt-2 font-medium text-apex-ink group-hover:text-apex-gold">
                    {nomeDoMembro(membroId)}
                  </p>
                  <p className="text-xs text-apex-muted">
                    {membro.indicadores.length} indicadores
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
