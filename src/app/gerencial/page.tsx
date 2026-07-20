import Link from 'next/link';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { InsightsPanel } from '@/components/dashboard/insights-panel';
import { MUNICIPIO_MOCK } from '@/lib/mock/municipio';
import { EQUIPES } from '@/lib/mock/equipes';
import { classificacaoDaNota } from '@/lib/mock/nota';
import { formatarReais, repasseDoMunicipio } from '@/lib/mock/repasse';

export default function GerencialPage() {
  const { porEquipe, totalMensal, perdaAnual } = repasseDoMunicipio(MUNICIPIO_MOCK.equipes);
  const notaMedia =
    Math.round((porEquipe.reduce((s, r) => s + r.nota, 0) / porEquipe.length) * 10) / 10;
  const mediaClass = classificacaoDaNota(notaMedia);

  return (
    <div className="min-h-screen bg-apex-bg">
      <DashboardHeader />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="font-display text-3xl font-semibold text-apex-ink">Visão gerencial</h1>
        <p className="mt-1 text-apex-muted">
          Competência atual · dados de demonstração · repasse com valores ilustrativos
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-apex-border bg-white p-5 text-center shadow-sm">
            <p className="text-xs uppercase tracking-wide text-apex-muted">Nota média</p>
            <p className="mt-1 font-mono text-3xl text-apex-ink">
              {notaMedia.toFixed(1).replace('.', ',')}
            </p>
            <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${mediaClass.estilo}`}>
              {mediaClass.label}
            </span>
          </div>
          <div className="rounded-xl border border-apex-border bg-white p-5 text-center shadow-sm">
            <p className="text-xs uppercase tracking-wide text-apex-muted">Repasse mensal (sim.)</p>
            <p className="mt-1 font-mono text-3xl text-emerald-600">{formatarReais(totalMensal)}</p>
            <p className="mt-1 text-xs text-apex-muted">{MUNICIPIO_MOCK.equipes.length} equipes</p>
          </div>
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-center shadow-sm">
            <p className="text-xs uppercase tracking-wide text-red-600">Perda anual projetada</p>
            <p className="mt-1 font-mono text-3xl text-red-600">{formatarReais(perdaAnual)}</p>
            <p className="mt-1 text-xs text-red-500">se as notas não melhorarem</p>
          </div>
        </div>

        <section className="mt-8 overflow-hidden rounded-xl border border-apex-border bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-apex-border bg-apex-surface text-left text-apex-muted">
                <th className="px-5 py-3 font-medium">Equipe</th>
                <th className="px-5 py-3 font-medium">Tipo</th>
                <th className="px-5 py-3 font-medium">Nota</th>
                <th className="px-5 py-3 font-medium">Classificação</th>
                <th className="px-5 py-3 text-right font-medium">Repasse (sim.)</th>
              </tr>
            </thead>
            <tbody>
              {porEquipe.map((r) => {
                const tipo = EQUIPES[r.equipe.tipo];
                const cls = classificacaoDaNota(r.nota);
                return (
                  <tr key={r.equipe.id} className="border-b border-apex-surface last:border-0">
                    <td className="px-5 py-3 font-medium text-apex-ink">{r.equipe.nome}</td>
                    <td className="px-5 py-3 text-apex-muted">
                      <Link href={`/paineis/${tipo.id}`} className="hover:text-apex-gold">
                        {tipo.nome}
                      </Link>
                    </td>
                    <td className="px-5 py-3 font-mono">{r.nota.toFixed(1).replace('.', ',')}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cls.estilo}`}>
                        {cls.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-mono">
                      {formatarReais(r.repasseMensal)}
                      {r.perdaMensal > 0 && (
                        <span className="ml-2 text-xs text-red-500">
                          (−{formatarReais(r.perdaMensal)})
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        <p className="mt-4 text-xs text-apex-muted">
          Valores de repasse são ilustrativos e configuráveis por município. Para projeções
          detalhadas, use o <Link href="/simulador" className="text-apex-gold underline">simulador financeiro</Link>.
        </p>

        <InsightsPanel indicadores={[]} equipes={[
          { nome: 'eSF Santa Luzia', nota: 10.1, classificacao: 'Ótimo' },
          { nome: 'eSF Floresta', nota: 10.5, classificacao: 'Ótimo' },
          { nome: 'eSF Nova Belterra', nota: 10.3, classificacao: 'Ótimo' },
          { nome: 'eSB Centro', nota: 10.4, classificacao: 'Ótimo' },
          { nome: 'eMulti 1', nota: 9.9, classificacao: 'Ótimo' },
        ]} />
      </main>
    </div>
  );
}
