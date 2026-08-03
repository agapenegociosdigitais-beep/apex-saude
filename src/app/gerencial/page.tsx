import Link from 'next/link'
import { AppShell } from '@/components/app-shell'
import { InsightsPanel } from '@/components/dashboard/insights-panel'
import { dadosGerencial } from '@/lib/data/gerencial'

export const dynamic = 'force-dynamic'

function formatarReais(valor: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(valor)
}

export default async function GerencialPage() {
  const { equipes, totalMensal, perdaAnual, notaMedia } = await dadosGerencial()

  const mediaClass = notaMedia >= 8.5 ? { label: 'Ótimo', estilo: 'bg-emerald-100 text-emerald-700' }
    : notaMedia >= 7 ? { label: 'Bom', estilo: 'bg-blue-100 text-blue-700' }
    : notaMedia >= 5 ? { label: 'Suficiente', estilo: 'bg-amber-100 text-amber-700' }
    : { label: 'Regular', estilo: 'bg-red-100 text-red-700' }

  return (
    <AppShell active="gerencial">
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-on-surface">Visão gerencial</h1>
        <p className="mt-1 text-on-surface-variant text-sm sm:text-base">
          Dados reais do Supabase · {equipes.length} equipes · repasse simulado
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl bg-surface border border-outline-variant/40 p-6 shadow-ambient flex flex-col items-center text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-3">Nota média</p>
          <p className="text-4xl font-bold text-on-surface">{notaMedia.toFixed(1).replace('.', ',')}</p>
          <span className={`mt-2 rounded-full px-3 py-1 text-xs font-semibold ${mediaClass.estilo}`}>{mediaClass.label}</span>
        </div>
        <div className="rounded-xl bg-surface border border-outline-variant/40 p-6 shadow-ambient flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-fixed/25 to-transparent pointer-events-none" />
          <p className="relative text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-3">Repasse mensal (sim.)</p>
          <p className="relative text-3xl font-bold text-primary-container">{formatarReais(totalMensal)}</p>
          <p className="relative text-sm text-on-surface-variant mt-1">{equipes.length} equipes</p>
        </div>
        <div className="rounded-xl bg-error-container/30 border border-error/20 p-6 shadow-ambient flex flex-col items-center text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-error mb-3">Perda anual projetada</p>
          <p className="text-3xl font-bold text-error">{formatarReais(perdaAnual)}</p>
          <p className="text-sm text-error/80 mt-1">se as notas não melhorarem</p>
        </div>
      </div>

      <div className="rounded-xl bg-surface border border-outline-variant/40 shadow-ambient overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[640px]">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/40">
                {['Equipe', 'Tipo', 'Nota ISF', 'Classificação', 'Repasse (sim.)'].map((h, i) => (
                  <th key={h} className={`py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-on-surface-variant ${i === 4 ? 'text-right' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {equipes.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-on-surface-variant">Nenhuma equipe com dados cadastrados.</td></tr>
              ) : equipes.map((r) => (
                <tr key={r.equipeId} className="hover:bg-surface-container-low/80">
                  <td className="py-3.5 px-4 font-medium text-on-surface">{r.equipeNome}</td>
                  <td className="py-3.5 px-4 text-on-surface-variant uppercase text-xs font-semibold">
                    <Link href={`/paineis/${r.tipo}`} className="hover:text-primary underline-offset-2 hover:underline">{r.tipo}</Link>
                  </td>
                  <td className="py-3.5 px-4 font-mono">{r.nota.toFixed(1).replace('.', ',')}</td>
                  <td className="py-3.5 px-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${r.estilo}`}>{r.classificacao}</span></td>
                  <td className="py-3.5 px-4 text-right font-mono">
                    {formatarReais(r.totalMensal)}
                    {r.perdaMensal > 0 && <span className="text-error text-xs ml-1">(-{formatarReais(r.perdaMensal)})</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-sm text-on-surface-variant mb-8">
        Dados do Supabase (Fase 2). Para projeções detalhadas, use o{' '}
        <Link href="/simulador" className="text-primary font-medium underline-offset-2 hover:underline">simulador financeiro</Link>.
      </p>

      <div className="rounded-xl bg-surface border border-outline-variant/40 p-6 shadow-ambient">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-secondary">lightbulb</span>
          <h2 className="font-semibold text-on-surface">Análise para seu município</h2>
        </div>
        <InsightsPanel indicadores={[]} equipes={equipes.map((r) => ({ nome: r.equipeNome, nota: r.nota, classificacao: r.classificacao }))} />
      </div>
    </AppShell>
  )
}
