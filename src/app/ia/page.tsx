'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/app-shell'
import { PERFIS, PERFIL_IDS, type PerfilId } from '@/lib/mock/perfis'
import { formatarMeta, statusDoIndicador, valorMock } from '@/lib/mock/indicadores'

export default function IaPage() {
  const [perfilId, setPerfilId] = useState<PerfilId>('medico')
  const perfil = PERFIS[perfilId]

  const avaliados = perfil.indicadores.map((ind) => {
    const valor = valorMock(perfilId, ind)
    return { ind, valor, status: statusDoIndicador(valor, ind) }
  })
  const criticos = avaliados.filter((a) => a.status !== 'otimo')

  return (
    <AppShell active="ia">
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-on-surface">Plano de ação PDCA</h1>
        <p className="mt-1 text-on-surface-variant">
          Motor de regras sobre seus indicadores · IA generativa na Fase 3
        </p>
      </header>

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

      <div className="space-y-4 max-w-3xl">
        <section className="rounded-xl border border-outline-variant/40 bg-surface p-6 shadow-ambient">
          <h2 className="font-semibold text-on-surface flex items-center gap-2">
            <span className="rounded bg-blue-100 px-2 py-0.5 text-sm text-blue-700">P</span>
            Planejar — onde agir
          </h2>
          {criticos.length === 0 ? (
            <p className="mt-3 text-sm text-primary-container">
              Todos os indicadores em Ótimo. Manter padrão e documentar práticas.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {criticos.map(({ ind, valor, status }) => (
                <li key={ind.id} className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-on-surface">{ind.nome}</span>
                  <span className={status === 'critico' ? 'text-error' : 'text-secondary shrink-0'}>
                    {ind.escala10 ? valor.toFixed(1).replace('.', ',') : `${Math.round(valor)}%`} →
                    meta {formatarMeta(ind)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-outline-variant/40 bg-surface p-6 shadow-ambient">
          <h2 className="font-semibold text-on-surface flex items-center gap-2">
            <span className="rounded bg-emerald-100 px-2 py-0.5 text-sm text-emerald-700">D</span>
            Executar — checklist da semana
          </h2>
          <ul className="mt-3 space-y-2">
            {perfil.checklist.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-on-surface-variant">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-secondary" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-outline-variant/40 bg-surface p-6 shadow-ambient">
          <h2 className="font-semibold text-on-surface flex items-center gap-2">
            <span className="rounded bg-amber-100 px-2 py-0.5 text-sm text-amber-800">C</span>
            Verificar — acompanhamento
          </h2>
          <p className="mt-3 text-sm text-on-surface-variant">
            Revisar indicadores semanalmente no{' '}
            <Link href={`/dashboard/${perfilId}`} className="text-primary font-medium underline">
              seu dashboard
            </Link>
            . Reunião de equipe no dia 8 antes do Siaps (dia 10).
          </p>
        </section>

        <section className="rounded-xl border border-outline-variant/40 bg-surface p-6 shadow-ambient">
          <h2 className="font-semibold text-on-surface flex items-center gap-2">
            <span className="rounded bg-purple-100 px-2 py-0.5 text-sm text-purple-700">A</span>
            Agir — padronizar o que funciona
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">{perfil.impacto}</p>
        </section>
      </div>
    </AppShell>
  )
}
