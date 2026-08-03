'use client'

import { useState } from 'react'
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

interface Props {
  equipesReais: { esf: number; esb: number; emulti: number }
  notaMedia: number | null
  classificacaoAtual: string
}

export function SimuladorClient({ equipesReais, notaMedia, classificacaoAtual }: Props) {
  const [equipes, setEquipes] = useState<Record<EquipeId, number>>(equipesReais)
  const [atual, setAtual] = useState(classificacaoAtual)
  const [alvo, setAlvo] = useState('Ótimo')

  const mensalAtual = Math.round(repasseCenario(equipes, atual))
  const mensalAlvo = Math.round(repasseCenario(equipes, alvo))
  const ganhoAnual = (mensalAlvo - mensalAtual) * 12

  return (
    <>
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-on-surface">Simulador financeiro</h1>
        <p className="mt-1 text-on-surface-variant">
          Projeção do repasse por classificação das equipes.
          {notaMedia !== null && (
            <span className="ml-2 text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded">FASE 2</span>
          )}
        </p>
      </header>

      {notaMedia !== null && (
        <div className="rounded-xl bg-primary-fixed/20 border border-primary/20 p-4 mb-6 text-sm text-on-surface">
          📊 Dados reais: <strong>{equipesReais.esf + equipesReais.esb + equipesReais.emulti} equipes</strong> cadastradas
          ({equipesReais.esf} eSF, {equipesReais.esb} eSB, {equipesReais.emulti} eMulti).
          Nota média atual: <strong>{notaMedia.toFixed(1).replace('.', ',')}</strong> — {classificacaoAtual}.
        </div>
      )}

      <section className="rounded-xl border border-outline-variant/40 bg-surface p-6 shadow-ambient mb-6">
        <h2 className="font-semibold text-on-surface mb-4">Quantidade de equipes</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {TIPOS.map((t) => (
            <label key={t.id} className="block">
              <span className="text-sm text-on-surface-variant">{t.nome}</span>
              <input
                type="number" min={0} max={50}
                value={equipes[t.id]}
                onChange={(e) => setEquipes({ ...equipes, [t.id]: Math.max(0, Number(e.target.value) || 0) })}
                className="mt-1 w-full rounded-lg border border-outline-variant bg-surface px-3 py-2.5 outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
              />
            </label>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm text-on-surface-variant">Cenário atual</span>
            <select value={atual} onChange={(e) => setAtual(e.target.value)}
              className="mt-1 w-full rounded-lg border border-outline-variant bg-surface px-3 py-2.5 outline-none focus:border-secondary">
              {CLASSIFICACOES.map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm text-on-surface-variant">Cenário alvo com ÁPEX</span>
            <select value={alvo} onChange={(e) => setAlvo(e.target.value)}
              className="mt-1 w-full rounded-lg border border-outline-variant bg-surface px-3 py-2.5 outline-none focus:border-secondary">
              {CLASSIFICACOES.map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
          </label>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-outline-variant/40 bg-surface p-5 text-center shadow-ambient">
          <p className="text-xs uppercase tracking-wide text-on-surface-variant">Hoje (mensal)</p>
          <p className="mt-1 font-mono text-2xl text-on-surface">{formatarReais(mensalAtual)}</p>
        </div>
        <div className="rounded-xl border border-outline-variant/40 bg-surface p-5 text-center shadow-ambient">
          <p className="text-xs uppercase tracking-wide text-on-surface-variant">Com ÁPEX (mensal)</p>
          <p className="mt-1 font-mono text-2xl text-primary-container">{formatarReais(mensalAlvo)}</p>
        </div>
        <div className="rounded-xl border border-secondary/40 bg-secondary-fixed/30 p-5 text-center shadow-ambient">
          <p className="text-xs uppercase tracking-wide text-on-secondary-fixed">Ganho anual</p>
          <p className="mt-1 font-mono text-2xl font-bold text-on-surface">{formatarReais(Math.max(0, ganhoAnual))}</p>
        </div>
      </div>

      <p className="mt-6 text-xs text-on-surface-variant">
        Simulação com valores-base ilustrativos. Não substitui os parâmetros oficiais do incentivo federal do seu município.
      </p>
    </>
  )
}
