import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { IndicadorCard } from '@/components/dashboard/indicador-card';
import { ChecklistCard } from '@/components/dashboard/checklist-card';
import { InsightsPanel } from '@/components/dashboard/insights-panel';
import { PerfilGuard } from '@/components/perfil-guard';
import { PERFIS, PERFIL_IDS, isPerfilId } from '@/lib/mock/perfis';
import { statusDoIndicador, valorMock, tendencia, iconeTendencia, ultimosMeses, dicaIndicador } from '@/lib/mock/indicadores';

export function generateStaticParams() {
  return PERFIL_IDS.map((perfil) => ({ perfil }));
}

export default async function DashboardPerfilPage({ params }: { params: Promise<{ perfil: string }> }) {
  const { perfil } = await params;
  if (!isPerfilId(perfil)) notFound();
  const config = PERFIS[perfil];
  const mesAtual = ultimosMeses(1)[0]; // mês corrente

  // Calcular nota com variação mensal
  let nota = 0, peso = 0;
  for (const ind of config.indicadores) {
    const val = valorMock(perfil, ind, mesAtual);
    const pct = ind.invertido ? (ind.meta / Math.max(val, 1)) * 100 : (val / ind.meta) * 100;
    nota += (Math.min(pct, 100) / 100) * 10 * ind.peso;
    peso += ind.peso;
  }
  const notaFinal = peso > 0 ? Math.round((nota / peso) * 10) / 10 : 0;
  const classificacao = notaFinal >= 7.5 ? 'Ótimo' : notaFinal >= 6 ? 'Bom' : notaFinal >= 5 ? 'Suficiente' : 'Regular';
  const corNota = classificacao === 'Ótimo' ? 'text-emerald-600' : classificacao === 'Bom' ? 'text-blue-600' : classificacao === 'Suficiente' ? 'text-amber-600' : 'text-red-600';

  const indicadoresData = config.indicadores.map(ind => ({
    codigo: ind.id, nome: ind.nome, valor: valorMock(perfil, ind, mesAtual), meta: ind.meta, invertido: ind.invertido,
  }));

  // Últimos 3 meses pra mini-gráfico
  const meses = ultimosMeses(12);

  return (
    <div className="min-h-screen bg-apex-bg">
      <DashboardHeader />
      <PerfilGuard>
      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Banner PEC */}
        <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4 flex items-center gap-3">
          <span className="text-xl">🔌</span>
          <div>
            <p className="font-semibold text-amber-800">Modo demonstração — dados simulados</p>
            <p className="text-sm text-amber-700">Os valores variam mensalmente simulando padrões reais. Conecte o PEC para dados oficiais.</p>
          </div>
        </div>

        {/* Nota + Classificação */}
        <div className="rounded-xl border bg-white p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wide">Nota da Equipe · {mesAtual}</p>
              <p className={`text-4xl font-bold ${corNota}`}>{notaFinal.toFixed(1).replace('.', ',')}</p>
              <span className={`inline-block mt-1 rounded-full px-3 py-0.5 text-xs font-semibold ${
                classificacao === 'Ótimo' ? 'bg-emerald-100 text-emerald-700' :
                classificacao === 'Bom' ? 'bg-blue-100 text-blue-700' :
                classificacao === 'Suficiente' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
              }`}>{classificacao}</span>
            </div>
            <div className="text-right">
              <p className="text-2xl">{config.icon}</p>
              <p className="text-sm text-gray-500">{config.nome}</p>
              <p className="text-xs text-gray-400">{config.equipe}</p>
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-semibold mb-4">Seus indicadores · {mesAtual}</h1>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {config.indicadores.map((ind) => {
            const valor = valorMock(perfil, ind, mesAtual);
            const status = statusDoIndicador(valor, ind);
            const trend = tendencia(perfil, ind, mesAtual);
            return (
              <div key={ind.id} className="relative group">
                <IndicadorCard indicador={ind} valor={valor} status={status} />
                <span className="absolute top-2 right-2 text-xs cursor-help" title={dicaIndicador(ind.id, valor, ind.meta, status, trend)}>{iconeTendencia(trend, ind.invertido)}</span>
              </div>
            );
          })}
        </div>

        {/* Mini gráfico de evolução 12 meses */}
        <div className="mt-6 rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="font-semibold mb-4">📈 Evolução — últimos 12 meses</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-500">
                  <th className="p-1 text-left">Indicador</th>
                  {meses.map(m => <th key={m} className="p-1 text-center">{m.split('-')[1]}</th>)}
                  <th className="p-1 text-center">Tendência</th>
                </tr>
              </thead>
              <tbody>
                {config.indicadores.map(ind => {
                  const trend = tendencia(perfil, ind, mesAtual);
                  return (
                    <tr key={ind.id} className="border-t">
                      <td className="p-1 font-medium">{ind.id}</td>
                      {meses.map(m => {
                        const v = valorMock(perfil, ind, m);
                        const s = statusDoIndicador(v, ind);
                        const bg = s === 'otimo' ? 'bg-emerald-500' : s === 'regular' ? 'bg-amber-500' : 'bg-red-500';
                        const opacity = v / 100;
                        return <td key={m} className="p-1 text-center"><span className={`inline-block w-5 h-5 rounded-sm ${bg} cursor-help`} style={{opacity: 0.3 + opacity * 0.7}} title={`${m}: ${Math.round(v)}% — ${s === 'otimo' ? '✅ Acima da meta' : s === 'regular' ? '⚠️ Próximo da meta' : '🔴 Abaixo da meta'}\n${ind.nome}`} /></td>;
                      })}
                      <td className="p-1 text-center"><span className="cursor-help" title={dicaIndicador(ind.id, valorMock(perfil, ind, mesAtual), ind.meta, statusDoIndicador(valorMock(perfil, ind, mesAtual), ind), trend)}>{iconeTendencia(trend, ind.invertido)}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Insights */}
        <InsightsPanel indicadores={indicadoresData} />

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <ChecklistCard titulo="Checklist da semana" itens={config.checklist} />
          <section className="rounded-xl border border-apex-gold/40 bg-apex-gold-pale/40 p-6">
            <h2 className="font-display text-lg font-semibold">Seu impacto</h2>
            <p className="mt-3 text-sm leading-relaxed">{config.impacto}</p>
          </section>
        </div>

        <nav className="mt-8 flex flex-wrap gap-3">
          {config.links.map((link) => (
            <Link key={link.url} href={link.url}
              className="rounded-lg border bg-white px-4 py-2 text-sm font-medium shadow-sm transition hover:border-apex-gold hover:text-apex-gold">
              {link.label} →
            </Link>
          ))}
        </nav>
      </main>
      </PerfilGuard>
    </div>
  );
}
