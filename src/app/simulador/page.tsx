'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FATOR_CLASSIFICACAO, REPASSE_BASE_MENSAL, formatarReais } from '@/lib/mock/repasse'
import type { EquipeId } from '@/lib/mock/equipes'

const CLASSIFICACOES = Object.keys(FATOR_CLASSIFICACAO)
const TIPOS: { id: EquipeId; nome: string }[] = [
  { id: 'esf', nome: 'eSF / eAP' },
  { id: 'esb', nome: 'eSB' },
  { id: 'emulti', nome: 'eMulti' },
]

function repasseCenario(equipes: Record<EquipeId, number>, classificacao: string): number {
  const fator = FATOR_CLASSIFICACAO[classificacao] ?? 0
  return TIPOS.reduce((s, t) => s + equipes[t.id] * REPASSE_BASE_MENSAL[t.id], 0) * fator
}

export default function SimuladorPage() {
  const [equipes, setEquipes] = useState<Record<EquipeId, number>>({ esf: 3, esb: 1, emulti: 1 })
  const [atual, setAtual] = useState('Suficiente')
  const [alvo, setAlvo] = useState('Ótimo')

  const mensalAtual = Math.round(repasseCenario(equipes, atual))
  const mensalAlvo = Math.round(repasseCenario(equipes, alvo))
  const ganhoAnual = (mensalAlvo - mensalAtual) * 12

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-10">
      <Link href="/" className="flex items-center gap-3">
        <Image src="/brand/logo-icon.png" alt="ÁPEX" width={32} height={32} className="rounded" />
        <span className="font-display text-lg font-semibold text-apex-ink">ÁPEX Saúde</span>
      </Link>

      <h1 className="mt-6 font-display text-3xl font-semibold text-apex-ink">
        Simulador financeiro
      </h1>
      <p className="mt-2 text-apex-muted">
        Projeção ilustrativa do repasse por classificação das equipes. Parâmetros configuráveis por município.
      </p>

      <section className="mt-8 rounded-xl border border-apex-border bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-apex-ink">Quantidade de equipes</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {TIPOS.map((t) => (
            <label key={t.id} className="block">
              <span className="text-sm text-apex-muted">{t.nome}</span>
              <input
                type="number"
                min={0}
                max={50}
                value={equipes[t.id]}
                onChange={(e) =>
                  setEquipes({ ...equipes, [t.id]: Math.max(0, Number(e.target.value) || 0) })
                }
                className="mt-1 w-full rounded-lg border border-apex-border px-3 py-2 outline-none focus:border-apex-gold"
              />
            </label>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm text-apex-muted">Cenário atual (classificação média)</span>
            <select
              value={atual}
              onChange={(e) => setAtual(e.target.value)}
              className="mt-1 w-full rounded-lg border border-apex-border bg-white px-3 py-2 outline-none focus:border-apex-gold"
            >
              {CLASSIFICACOES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm text-apex-muted">Cenário alvo com ÁPEX</span>
            <select
              value={alvo}
              onChange={(e) => setAlvo(e.target.value)}
              className="mt-1 w-full rounded-lg border border-apex-border bg-white px-3 py-2 outline-none focus:border-apex-gold"
            >
              {CLASSIFICACOES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-apex-border bg-white p-5 text-center shadow-sm">
          <p className="text-xs uppercase tracking-wide text-apex-muted">Hoje (mensal)</p>
          <p className="mt-1 font-mono text-2xl text-apex-ink">{formatarReais(mensalAtual)}</p>
        </div>
        <div className="rounded-xl border border-apex-border bg-white p-5 text-center shadow-sm">
          <p className="text-xs uppercase tracking-wide text-apex-muted">Com ÁPEX (mensal)</p>
          <p className="mt-1 font-mono text-2xl text-emerald-600">{formatarReais(mensalAlvo)}</p>
        </div>
        <div className="rounded-xl border border-apex-gold/50 bg-apex-gold-pale/40 p-5 text-center shadow-sm">
          <p className="text-xs uppercase tracking-wide text-apex-text">Ganho projetado (anual)</p>
          <p className="mt-1 font-mono text-2xl font-bold text-apex-ink">
            {formatarReais(Math.max(0, ganhoAnual))}
          </p>
        </div>
      </div>

      <p className="mt-4 text-xs text-apex-muted">
        Simulação com valores-base ilustrativos por tipo de equipe. Não substitui os parâmetros
        oficiais do incentivo federal do seu município.
      </p>
    </main>
  )
}
