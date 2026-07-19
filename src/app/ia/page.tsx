'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { PERFIS, PERFIL_IDS, type PerfilId } from '@/lib/mock/perfis'
import { formatarMeta, statusDoIndicador, valorMock } from '@/lib/mock/indicadores'

/**
 * PDCA orientado por regras sobre os indicadores do perfil.
 * Fase 3: motor DeepSeek V4 (rota /api/ia) com plano contextualizado ao município.
 */
export default function IaPage() {
  const [perfilId, setPerfilId] = useState<PerfilId>('medico')
  const perfil = PERFIS[perfilId]

  const avaliados = perfil.indicadores.map((ind) => {
    const valor = valorMock(perfilId, ind)
    return { ind, valor, status: statusDoIndicador(valor, ind) }
  })
  const criticos = avaliados.filter((a) => a.status !== 'otimo')

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-10">
      <Link href="/" className="flex items-center gap-3">
        <Image src="/brand/logo-icon.png" alt="ÁPEX" width={32} height={32} className="rounded" />
        <span className="font-display text-lg font-semibold text-apex-ink">ÁPEX Saúde</span>
      </Link>

      <h1 className="mt-6 font-display text-3xl font-semibold text-apex-ink">
        Plano de ação PDCA
      </h1>
      <p className="mt-2 text-apex-muted">
        Motor de regras sobre seus indicadores · IA generativa (DeepSeek) na Fase 3
      </p>

      <label className="mt-6 block max-w-xs">
        <span className="text-sm text-apex-muted">Seu perfil</span>
        <select
          value={perfilId}
          onChange={(e) => setPerfilId(e.target.value as PerfilId)}
          className="mt-1 w-full rounded-lg border border-apex-border bg-white px-3 py-2 outline-none focus:border-apex-gold"
        >
          {PERFIL_IDS.map((id) => (
            <option key={id} value={id}>
              {PERFIS[id].icon} {PERFIS[id].nome}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-8 space-y-6">
        <section className="rounded-xl border border-apex-border bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-semibold text-apex-ink">
            <span className="mr-2 rounded bg-blue-100 px-2 py-0.5 text-sm text-blue-700">P</span>
            Planejar — onde agir
          </h2>
          {criticos.length === 0 ? (
            <p className="mt-3 text-sm text-emerald-700">
              Todos os indicadores em Ótimo. Manter padrão e documentar práticas.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {criticos.map(({ ind, valor, status }) => (
                <li key={ind.id} className="flex items-center justify-between text-sm">
                  <span className="text-apex-text">{ind.nome}</span>
                  <span className={status === 'critico' ? 'text-red-600' : 'text-amber-600'}>
                    {ind.escala10 ? valor.toFixed(1).replace('.', ',') : `${Math.round(valor)}%`}
                    {' '}→ meta {formatarMeta(ind)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-apex-border bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-semibold text-apex-ink">
            <span className="mr-2 rounded bg-emerald-100 px-2 py-0.5 text-sm text-emerald-700">D</span>
            Executar — checklist da semana
          </h2>
          <ul className="mt-3 space-y-2">
            {perfil.checklist.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-apex-text">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-apex-gold" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-apex-border bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-semibold text-apex-ink">
            <span className="mr-2 rounded bg-amber-100 px-2 py-0.5 text-sm text-amber-700">C</span>
            Verificar — acompanhamento
          </h2>
          <p className="mt-3 text-sm text-apex-text">
            Revisar indicadores semanalmente no{' '}
            <Link href={`/dashboard/${perfilId}`} className="text-apex-gold underline">
              seu dashboard
            </Link>
            . Reunião de equipe no dia 8 para consolidar antes do envio ao Siaps (dia 10, improrrogável).
          </p>
        </section>

        <section className="rounded-xl border border-apex-border bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-semibold text-apex-ink">
            <span className="mr-2 rounded bg-purple-100 px-2 py-0.5 text-sm text-purple-700">A</span>
            Agir — padronizar o que funciona
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-apex-text">{perfil.impacto}</p>
        </section>
      </div>
    </main>
  )
}
