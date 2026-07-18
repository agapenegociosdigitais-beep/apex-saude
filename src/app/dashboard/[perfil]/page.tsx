import { notFound } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { IndicadorCard } from '@/components/dashboard/indicador-card';
import { ChecklistCard } from '@/components/dashboard/checklist-card';
import { PERFIS, PERFIL_IDS, isPerfilId } from '@/lib/mock/perfis';
import { statusDoIndicador, valorMock } from '@/lib/mock/indicadores';

export function generateStaticParams() {
  return PERFIL_IDS.map((perfil) => ({ perfil }));
}

export default async function DashboardPerfilPage({
  params,
}: {
  params: Promise<{ perfil: string }>;
}) {
  const { perfil } = await params;
  if (!isPerfilId(perfil)) notFound();

  const config = PERFIS[perfil];

  return (
    <div className="min-h-screen bg-apex-bg">
      <DashboardHeader nomePerfil={config.nome} equipe={config.equipe} icon={config.icon} />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="font-display text-3xl font-semibold text-apex-ink">Seus indicadores</h1>
        <p className="mt-1 text-apex-muted">Competência atual · dados de demonstração</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {config.indicadores.map((ind) => {
            const valor = valorMock(perfil, ind);
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

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <ChecklistCard titulo="Checklist da semana" itens={config.checklist} />
          <section className="rounded-xl border border-apex-gold/40 bg-apex-gold-pale/40 p-6">
            <h2 className="font-display text-lg font-semibold text-apex-ink">Seu impacto</h2>
            <p className="mt-3 text-sm leading-relaxed text-apex-text">{config.impacto}</p>
          </section>
        </div>
      </main>
    </div>
  );
}
