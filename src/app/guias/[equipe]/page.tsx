import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { EQUIPES, EQUIPE_IDS, isEquipeId } from '@/lib/mock/equipes';
import { GUIAS } from '@/lib/mock/guias-content';

export function generateStaticParams() {
  return EQUIPE_IDS.map((equipe) => ({ equipe }));
}

export default async function GuiaEquipePage({
  params,
}: {
  params: Promise<{ equipe: string }>;
}) {
  const { equipe } = await params;
  if (!isEquipeId(equipe)) notFound();

  const guia = GUIAS[equipe];
  const config = EQUIPES[equipe];

  return (
    <div className="min-h-screen bg-apex-bg">
      <DashboardHeader nomePerfil={config.nome} equipe="Guia de indicadores" icon={config.icon} />
      <main className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="font-display text-3xl font-semibold text-apex-ink">{guia.titulo}</h1>
        <p className="mt-3 leading-relaxed text-apex-text">{guia.introducao}</p>

        <div className="mt-8 space-y-6">
          {guia.indicadores.map((ind) => (
            <section
              key={ind.id}
              className="rounded-xl border border-apex-border bg-white p-6 shadow-sm"
            >
              <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-apex-ink">
                <span className="rounded-lg bg-apex-gold px-2 py-0.5 font-mono text-sm text-white">
                  {ind.id}
                </span>
                O que é
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-apex-text">{ind.oQueE}</p>
              <h3 className="mt-4 text-sm font-semibold uppercase tracking-wide text-apex-muted">
                Como melhorar
              </h3>
              <ul className="mt-2 space-y-2">
                {ind.comoMelhorar.map((dica) => (
                  <li key={dica} className="flex items-start gap-2.5 text-sm text-apex-text">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                    {dica}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <Link
          href={`/paineis/${equipe}`}
          className="mt-8 inline-block rounded-lg bg-apex-gold px-5 py-2.5 font-medium text-white transition hover:bg-apex-gold-light"
        >
          Ver painel {config.nome} →
        </Link>
      </main>
    </div>
  );
}
