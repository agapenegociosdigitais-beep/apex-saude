'use client'

import Link from 'next/link'
import { AppShell } from '@/components/app-shell'
import { BrandLogo } from '@/components/brand-logo'
import { PERFIS, PERFIL_IDS } from '@/lib/mock/perfis'
import { EQUIPES, EQUIPE_IDS } from '@/lib/mock/equipes'
import { useUser } from '@/lib/hooks/useUser'

const FERRAMENTAS_BASE = [
  { href: '/gerencial', icon: 'bar_chart', nome: 'Visão gerencial', desc: 'Notas e repasse do município' },
  { href: '/simulador', icon: 'payments', nome: 'Simulador financeiro', desc: 'Projeção do repasse anual' },
  { href: '/ia', icon: 'psychology', nome: 'Plano PDCA', desc: 'Ação por indicador' },
]

const FERRAMENTA_ADMIN = { href: '/admin', icon: 'admin_panel_settings', nome: 'Painel Admin', desc: 'Municípios, equipes e PEC' }

export default function PainelPage() {
  // O acesso real é garantido pelo middleware (consulta a tabela `usuarios`).
  // Este filtro é só de UX: evita mostrar um link que vai redirecionar de volta.
  const user = useUser()
  const podeVerAdmin = user.role === 'admin' || user.role === 'gestor'
  const FERRAMENTAS = podeVerAdmin ? [...FERRAMENTAS_BASE, FERRAMENTA_ADMIN] : FERRAMENTAS_BASE

  return (
    <AppShell active="painel">
      <div className="text-center mb-10 max-w-2xl mx-auto">
        <div className="flex justify-center mb-4">
          <BrandLogo size="hero" href={null} priority />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
          Gestão de Indicadores da APS
        </h1>
        <p className="mt-2 text-on-surface-variant text-sm sm:text-base">
          Acompanhe os 15 indicadores oficiais da NT 6/2025. Selecione seu perfil para abrir o
          dashboard.
        </p>
      </div>

      <section className="mb-12">
        <h2 className="sr-only">Perfis profissionais</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {PERFIL_IDS.map((id) => {
            const perfil = PERFIS[id]
            return (
              <Link
                key={id}
                href={`/dashboard/${id}`}
                className="group rounded-xl bg-surface border border-outline-variant/40 p-5 shadow-ambient hover-card flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="w-11 h-11 rounded-lg bg-surface-container flex items-center justify-center text-2xl">
                    {perfil.icon}
                  </div>
                  <span className="text-[11px] font-semibold text-on-surface-variant bg-surface-container-high px-2 py-1 rounded-md">
                    {perfil.equipe}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-on-surface group-hover:text-primary transition-colors">
                    {perfil.nome}
                  </h3>
                  <p className="text-sm text-on-surface-variant mt-0.5">
                    {perfil.indicadores.length} indicadores
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-bold text-primary text-center mb-6">Painéis de equipe</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {EQUIPE_IDS.map((id) => {
            const eq = EQUIPES[id]
            return (
              <Link
                key={id}
                href={`/paineis/${id}`}
                className="rounded-xl bg-surface border border-outline-variant/40 p-6 text-center shadow-ambient hover-card"
              >
                <div className="text-3xl mb-3">{eq.icon}</div>
                <h3 className="font-semibold text-on-surface">{eq.nome}</h3>
                <p className="text-sm text-on-surface-variant mt-1">{eq.descricao}</p>
              </Link>
            )
          })}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-primary text-center mb-6">Gestão e ferramentas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FERRAMENTAS.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className="rounded-xl bg-surface border border-outline-variant/40 p-5 shadow-ambient hover-card"
            >
              <span className="material-symbols-outlined text-primary text-3xl mb-3 block">
                {f.icon}
              </span>
              <h3 className="font-semibold text-on-surface">{f.nome}</h3>
              <p className="text-sm text-on-surface-variant mt-1">{f.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  )
}
