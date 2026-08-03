'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PERFIS, PERFIL_IDS, type PerfilId } from '@/lib/mock/perfis'
import { formatarMeta, statusDoIndicador, valorMock } from '@/lib/mock/indicadores'

interface Props {
  equipeNome: string | null
  municipioNome: string | null
  nota: number | null
  valoresReais: Record<string, number> | null  // codigo → valor real do Supabase
}

export function IaClient({ equipeNome, municipioNome, nota, valoresReais }: Props) {
  const [perfilId, setPerfilId] = useState<PerfilId>('medico')
  const perfil = PERFIS[perfilId]

  const avaliados = perfil.indicadores.map((ind) => {
    const valor = valoresReais?.[ind.id] ?? valorMock(perfilId, ind)
    return { ind, valor, status: statusDoIndicador(valor, ind) }
  })
  const criticos = avaliados.filter((a) => a.status !== 'otimo')

  return (
    <>
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-on-surface">Plano de ação PDCA</h1>
        <p className="mt-1 text-on-surface-variant">
          Motor de regras sobre seus indicadores · Dados reais quando disponíveis
        </p>
      </header>

      {equipeNome && (
        <div className="bg-green-50 border border-green-300 rounded-lg p-4 mb-6 flex gap-3 items-center">
          <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded">DADOS REAIS</span>
          <span className="text-sm text-on-surface">
            <strong>{equipeNome}</strong> · {municipioNome} · nota{' '}
            <strong>{nota?.toFixed(1).replace('.', ',')}</strong>
          </span>
        </div>
      )}

      <label className="block max-w-xs mb-8">
        <span className="text-sm text-on-surface-variant">Seu perfil</span>
        <select
          value={perfilId}
          onChange={(e) => setPerfilId(e.target.value as PerfilId)}
          className="mt-1 w-full rounded-lg border border-outline-variant bg-surface px-3 py-2.5 outline-none focus:border-secondary"
        >
          {PERFIL_IDS.map((id) => (
            <option key={id} value={id}>
              {PERFIS[id].icon} {PERFIS[id].nome}
            </option>
          ))}
        </select>
      </label>

      {criticos.length === 0 ? (
        <div className="rounded-xl bg-surface border border-outline-variant/40 p-8 text-center shadow-ambient">
          <span className="material-symbols-outlined text-4xl text-primary-container mb-2">celebration</span>
          <p className="font-semibold text-on-surface">Todos os indicadores estão ótimos!</p>
          <p className="text-sm text-on-surface-variant mt-1">Nenhum plano de ação necessário no momento.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {criticos.map(({ ind, valor, status }) => {
            const isReal = valoresReais?.[ind.id] !== undefined
            return (
            <div key={ind.id} className="rounded-xl bg-surface border border-outline-variant/40 p-6 shadow-ambient">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                  status === 'regular' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                }`}>
                  {status === 'regular' ? '⚠️ Regular' : '🔴 Crítico'}
                </span>
                <h3 className="font-semibold text-on-surface">{ind.id} — {ind.nome}</h3>
                {isReal && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">real</span>}
              </div>
              <div className="grid sm:grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-on-surface-variant">Valor atual: </span>
                  <strong className="font-mono">{Math.round(valor)}{ind.escala10 ? '' : '%'}</strong>
                </div>
                <div>
                  <span className="text-on-surface-variant">Meta: </span>
                  <strong className="font-mono">{formatarMeta(ind)}</strong>
                </div>
              </div>
              <div className="bg-surface-container-low rounded-lg p-4">
                <h4 className="font-semibold text-sm text-on-surface mb-2">📋 Plano de ação sugerido</h4>
                <div className="grid gap-2 text-sm">
                  <div className="flex gap-2">
                    <span className="text-blue-600 font-bold">P</span>
                    <span className="text-on-surface-variant">
                      {ind.id.startsWith('C') ? 'Revisar agendamento e busca ativa dos pacientes com condição crônica.' :
                       ind.id.startsWith('B') ? 'Organizar mutirão de atendimento odontológico na UBS.' :
                       'Mapear demanda reprimida e priorizar atendimentos interprofissionais.'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-green-600 font-bold">D</span>
                    <span className="text-on-surface-variant">Implementar as ações planejadas nas próximas 2 semanas.</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-amber-600 font-bold">C</span>
                    <span className="text-on-surface-variant">Verificar resultado na próxima sincronização do PEC.</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-red-600 font-bold">A</span>
                    <span className="text-on-surface-variant">Ajustar estratégia se o indicador não melhorar em 30 dias.</span>
                  </div>
                </div>
              </div>
            </div>
          )})}
        </div>
      )}

      <p className="mt-8 text-xs text-on-surface-variant border-t border-outline-variant/30 pt-6">
        Motor de regras determinístico. Na Fase 3, LLM local (via OmniRoute) gerará planos
        personalizados com dados reais do PEC.{' '}
        <Link href="/paineis/esf" className="text-primary underline">Ver painéis reais →</Link>
      </p>
    </>
  )
}
