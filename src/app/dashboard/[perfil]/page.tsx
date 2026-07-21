import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { IndicadorCard } from '@/components/dashboard/indicador-card';
import { ChecklistCard } from '@/components/dashboard/checklist-card';
import { InsightsPanel } from '@/components/dashboard/insights-panel';
import { PerfilGuard } from '@/components/perfil-guard';
import { PERFIS, PERFIL_IDS, isPerfilId } from '@/lib/mock/perfis';
import {
  statusDoIndicador,
  valorMock,
  tendencia,
  iconeTendencia,
  ultimosMeses,
  dicaIndicador,
} from '@/lib/mock/indicadores';

export function generateStaticParams() {
  return PERFIL_IDS.map((perfil) => ({ perfil }));
}

function heatCell(status: 'otimo' | 'regular' | 'critico') {
  if (status === 'otimo') return 'bg-primary-fixed-dim';
  if (status === 'regular') return 'bg-secondary-container';
  return 'bg-error/70';
}

export default async function DashboardPerfilPage({
  params,
}: {
  params: Promise<{ perfil: string }>;
}) {
  const { perfil } = await params;
  if (!isPerfilId(perfil)) notFound();
  const config = PERFIS[perfil];
  const mesAtual = ultimosMeses(1)[0];

  let nota = 0;
  let peso = 0;
  for (const ind of config.indicadores) {
    const val = valorMock(perfil, ind, mesAtual);
    const pct = ind.invertido
      ? (ind.meta / Math.max(val, 1)) * 100
      : (val / ind.meta) * 100;
    nota += (Math.min(pct, 100) / 100) * 10 * ind.peso;
    peso += ind.peso;
  }
  const notaFinal = peso > 0 ? Math.round((nota / peso) * 10) / 10 : 0;
  const classificacao =
    notaFinal >= 7.5
      ? 'Ótimo'
      : notaFinal >= 6
        ? 'Bom'
        : notaFinal >= 5
          ? 'Suficiente'
          : 'Regular';
  const badgeClass =
    classificacao === 'Ótimo'
      ? 'bg-primary-fixed text-on-primary-fixed'
      : classificacao === 'Bom'
        ? 'bg-primary-fixed/40 text-on-primary-fixed'
        : classificacao === 'Suficiente'
          ? 'bg-secondary-fixed text-on-secondary-fixed'
          : 'bg-error-container text-on-error-container';

  const indicadoresData = config.indicadores.map((ind) => ({
    codigo: ind.id,
    nome: ind.nome,
    valor: valorMock(perfil, ind, mesAtual),
    meta: ind.meta,
    invertido: ind.invertido,
  }));

  const meses = ultimosMeses(12);

  return (
    <AppShell active="painel">
      <PerfilGuard>
        <div className="flex flex-col gap-6">
          {/* Demo Banner */}
          <div className="bg-secondary-fixed/20 border border-secondary-fixed/50 rounded-lg p-4 flex gap-4 items-start">
            <span className="material-symbols-outlined text-secondary-fixed-dim mt-0.5">
              electrical_services
            </span>
            <div>
              <h3 className="font-title-lg text-title-lg text-on-surface">
                Modo demonstração — dados simulados
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                Os valores variam mensalmente simulando padrões reais. Conecte o PEC para dados
                oficiais.
              </p>
            </div>
          </div>

          <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <h2 className="font-headline-lg text-headline-lg text-on-surface">
              Seus indicadores · {mesAtual}
            </h2>
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-gutter">
            <div className="xl:col-span-8 flex flex-col gap-gutter">
              {/* Nota */}
              <div className="bg-surface rounded-xl p-card-padding shadow-ambient border border-outline-variant/20 flex justify-between items-center relative overflow-hidden">
                <div className="absolute right-0 top-0 w-32 h-32 bg-primary-fixed/20 rounded-bl-full -mr-8 -mt-8 opacity-50" />
                <div>
                  <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-2">
                    Nota da Equipe · {mesAtual}
                  </p>
                  <div className="flex items-end gap-3">
                    <span className="font-display-lg text-display-lg text-primary-container leading-none">
                      {notaFinal.toFixed(1).replace('.', ',')}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-label-md text-[10px] mb-1 ${badgeClass}`}
                    >
                      {classificacao}
                    </span>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end z-10">
                  <div className="w-12 h-12 bg-surface-container rounded-full flex items-center justify-center mb-2 overflow-hidden border border-outline-variant/30 text-2xl">
                    {config.icon}
                  </div>
                  <p className="font-body-md text-body-md font-medium text-on-surface">
                    {config.nome}
                  </p>
                  <p className="font-label-md text-[11px] text-on-surface-variant">
                    {config.equipe}
                  </p>
                </div>
              </div>

              {/* Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                {config.indicadores.map((ind) => {
                  const valor = valorMock(perfil, ind, mesAtual);
                  const status = statusDoIndicador(valor, ind);
                  const trend = tendencia(perfil, ind, mesAtual);
                  return (
                    <div key={ind.id} className="relative">
                      <IndicadorCard indicador={ind} valor={valor} status={status} />
                      <span
                        className="absolute top-3 right-3 text-xs cursor-help"
                        title={dicaIndicador(ind.id, valor, ind.meta, status, trend)}
                      >
                        {iconeTendencia(trend, ind.invertido)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Heatmap */}
              <div className="bg-surface rounded-xl p-card-padding shadow-ambient border border-outline-variant/20 overflow-x-auto">
                <div className="flex items-center gap-2 mb-6">
                  <span className="material-symbols-outlined text-primary-container">
                    trending_up
                  </span>
                  <h3 className="font-title-lg text-title-lg text-on-surface">
                    Evolução — últimos 12 meses
                  </h3>
                </div>
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-outline-variant/40">
                      <th className="font-label-md text-label-md text-on-surface-variant pb-2 pr-4">
                        Indicador
                      </th>
                      {meses.map((m) => (
                        <th
                          key={m}
                          className="font-label-md text-label-md text-on-surface-variant pb-2 text-center w-8"
                        >
                          {m.split('-')[1]}
                        </th>
                      ))}
                      <th className="font-label-md text-label-md text-on-surface-variant pb-2 text-center w-16">
                        Tendência
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {config.indicadores.map((ind) => {
                      const trend = tendencia(perfil, ind, mesAtual);
                      return (
                        <tr
                          key={ind.id}
                          className="border-b border-outline-variant/20 hover:bg-surface-container-low transition-colors"
                        >
                          <td className="py-3 font-body-md text-body-md pr-4">{ind.id}</td>
                          {meses.map((m) => {
                            const v = valorMock(perfil, ind, m);
                            const s = statusDoIndicador(v, ind);
                            return (
                              <td key={m} className="py-3 text-center">
                                <div
                                  className={`w-4 h-4 ${heatCell(s)} rounded mx-auto`}
                                  title={`${m}: ${Math.round(v)}`}
                                />
                              </td>
                            );
                          })}
                          <td className="py-3 text-center">
                            <span
                              className="cursor-help"
                              title={dicaIndicador(
                                ind.id,
                                valorMock(perfil, ind, mesAtual),
                                ind.meta,
                                statusDoIndicador(valorMock(perfil, ind, mesAtual), ind),
                                trend,
                              )}
                            >
                              {iconeTendencia(trend, ind.invertido)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="xl:col-span-4 flex flex-col gap-gutter">
              <InsightsPanel indicadores={indicadoresData} />
              <ChecklistCard titulo="Checklist da semana" itens={config.checklist} />
              <section className="bg-secondary-fixed/10 rounded-xl p-card-padding border border-secondary-fixed/30">
                <h3 className="font-title-lg text-title-lg text-on-surface mb-2">Seu impacto</h3>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  {config.impacto}
                </p>
              </section>
              <div className="flex gap-4 flex-wrap">
                {config.links.map((link) => (
                  <Link
                    key={link.url}
                    href={link.url}
                    className="flex-1 bg-surface border border-outline-variant/50 hover:bg-surface-container-low transition-colors py-2.5 px-4 rounded-lg font-body-md text-body-md font-semibold text-on-surface flex items-center justify-center gap-2 shadow-ambient min-w-[140px]"
                  >
                    {link.label}
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </PerfilGuard>
    </AppShell>
  );
}
