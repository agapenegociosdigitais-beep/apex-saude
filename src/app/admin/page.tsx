'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { AppShell, type ShellNavId } from '@/components/app-shell'
import AdminMunicipios from './admin-municipios'
import AdminEquipes from './admin-equipes'
import AdminIndicadores from './admin-indicadores'
import AdminPec from './admin-pec'
import AdminProfissionais from './admin-profissionais'
import AdminGestao from './admin-gestao'
import AdminComercial from './admin-comercial'

export type AdminTab =
  | 'municipios'
  | 'equipes'
  | 'indicadores'
  | 'integracao'
  | 'usuarios'
  | 'gestao'
  | 'comercial'

const TAB_TO_SHELL: Record<AdminTab, ShellNavId> = {
  municipios: 'municipios',
  equipes: 'equipes',
  indicadores: 'indicadores',
  integracao: 'pec',
  usuarios: 'profissionais',
  gestao: 'gestao',
  comercial: 'gestao',
}

const VALID: AdminTab[] = [
  'municipios',
  'equipes',
  'indicadores',
  'integracao',
  'usuarios',
  'gestao',
  'comercial',
]

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background p-8 text-on-surface-variant">Carregando admin…</div>}>
      <AdminPageInner />
    </Suspense>
  )
}

function AdminPageInner() {
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<AdminTab>('municipios')

  useEffect(() => {
    const q = searchParams.get('tab') as AdminTab | null
    if (q && VALID.includes(q)) setTab(q)
  }, [searchParams])

  const tabs: { key: AdminTab; label: string; icon: string }[] = [
    { key: 'municipios', label: 'Municípios', icon: 'location_city' },
    { key: 'equipes', label: 'Equipes', icon: 'groups' },
    { key: 'indicadores', label: 'Indicadores', icon: 'analytics' },
    { key: 'integracao', label: 'PEC', icon: 'clinical_notes' },
    { key: 'usuarios', label: 'Profissionais', icon: 'badge' },
    { key: 'gestao', label: 'Gestão', icon: 'settings' },
    { key: 'comercial', label: 'Comercial', icon: 'payments' },
  ]

  return (
    <AppShell active={TAB_TO_SHELL[tab]}>
      <div className="flex flex-col gap-6">
        <div className="flex gap-1 rounded-xl bg-surface-container p-1 w-full sm:w-fit flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 ${
                tab === t.key
                  ? 'bg-surface shadow text-on-surface'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{t.icon}</span>
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {tab === 'municipios' && <AdminMunicipios />}
        {tab === 'equipes' && <AdminEquipes />}
        {tab === 'indicadores' && <AdminIndicadores />}
        {tab === 'integracao' && <AdminPec />}
        {tab === 'usuarios' && <AdminProfissionais />}
        {tab === 'gestao' && <AdminGestao />}
        {tab === 'comercial' && <AdminComercial />}
      </div>
    </AppShell>
  )
}
