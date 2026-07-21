'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, type ReactNode } from 'react'
import { BrandLogo } from '@/components/brand-logo'
import { criarClienteBrowser, supabaseConfigurado } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'

export type ShellNavId =
  | 'painel'
  | 'municipios'
  | 'equipes'
  | 'indicadores'
  | 'pec'
  | 'profissionais'
  | 'gestao'
  | 'gerencial'
  | 'simulador'
  | 'ia'

const NAV_MAIN: { id: ShellNavId; href: string; icon: string; label: string; roles: string[] }[] = [
  { id: 'painel', href: '/painel', icon: 'monitoring', label: 'Indicadores', roles: ['admin','gestor','coordenador','profissional'] },
  { id: 'municipios', href: '/admin?tab=municipios', icon: 'location_city', label: 'Municípios', roles: ['admin'] },
  { id: 'equipes', href: '/admin?tab=equipes', icon: 'groups', label: 'Equipes', roles: ['admin'] },
  { id: 'indicadores', href: '/admin?tab=indicadores', icon: 'analytics', label: 'Admin Indicadores', roles: ['admin'] },
  { id: 'pec', href: '/admin?tab=integracao', icon: 'clinical_notes', label: 'PEC', roles: ['admin'] },
  { id: 'profissionais', href: '/admin?tab=usuarios', icon: 'badge', label: 'Profissionais', roles: ['admin'] },
  { id: 'gestao', href: '/admin?tab=gestao', icon: 'settings', label: 'Gestão', roles: ['admin'] },
  { id: 'gerencial', href: '/gerencial', icon: 'bar_chart', label: 'Gerencial', roles: ['admin','gestor','coordenador'] },
  { id: 'simulador', href: '/simulador', icon: 'payments', label: 'Simulador', roles: ['admin','gestor','coordenador'] },
  { id: 'ia', href: '/ia', icon: 'psychology', label: 'Plano PDCA', roles: ['admin','gestor','coordenador','profissional'] },
  { id: 'profissionais', href: '/profissionais', icon: 'badge', label: 'Profissionais', roles: ['gestor','coordenador'] },
  { id: 'equipes', href: '/equipes', icon: 'groups', label: 'Equipes', roles: ['gestor','coordenador'] },
  { id: 'gestao', href: '/gestao', icon: 'settings', label: 'Gestão', roles: ['gestor','coordenador'] },
]

interface AppShellProps {
  children: ReactNode
  active?: ShellNavId
}

function resolveActive(pathname: string, active?: ShellNavId): ShellNavId {
  if (active) return active
  if (pathname.startsWith('/admin')) return 'municipios'
  if (pathname.startsWith('/dashboard') || pathname === '/painel') return 'painel'
  if (pathname.startsWith('/gerencial')) return 'gerencial'
  if (pathname.startsWith('/simulador')) return 'simulador'
  if (pathname.startsWith('/ia')) return 'ia'
  if (pathname.startsWith('/paineis') || pathname.startsWith('/guias')) return 'painel'
  return 'painel'
}

export function AppShell({ children, active }: AppShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const user = useUser()
  const [mobileOpen, setMobileOpen] = useState(false)
  const resolved = resolveActive(pathname, active)

  async function logout() {
    try {
      if (supabaseConfigurado()) {
        const supabase = criarClienteBrowser()
        await supabase.auth.signOut()
      }
    } catch {
      /* ignore */
    }
    router.push('/login')
    router.refresh()
  }

  const nome = user.nome || user.email || 'Usuário'
  const sub = user.perfil_id
    ? `${user.perfil_id}${user.role ? ` · ${user.role}` : ''}`
    : user.role || 'Acesso'

  function NavItem({
    id,
    href,
    icon,
    label,
  }: {
    id: ShellNavId
    href: string
    icon: string
    label: string
  }) {
    const isActive = resolved === id
    return (
      <li>
        <Link
          href={href}
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg text-sm transition-colors border-l-[3px] ${
            isActive
              ? 'text-white font-semibold border-secondary-fixed bg-white/10'
              : 'text-white/65 hover:text-white hover:bg-white/8 border-transparent'
          }`}
        >
          <span
            className={`material-symbols-outlined text-[22px] ${isActive ? 'text-secondary-fixed' : ''}`}
            style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
          >
            {icon}
          </span>
          <span className="truncate">{label}</span>
        </Link>
      </li>
    )
  }

  const sidebarBody = (
    <>
      <div className="px-5 pt-6 pb-4 flex flex-col items-center border-b border-white/10">
        <BrandLogo size="lg" href="/painel" onDark priority className="mx-auto" />
        <p className="mt-3 text-[10px] uppercase tracking-[0.14em] text-secondary-fixed/90 font-semibold">
          Gestão Pública de Elite
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto py-4" aria-label="Menu principal">
        <ul className="flex flex-col gap-0.5">
          {NAV_MAIN.filter(item => item.roles.includes(user.role || 'profissional')).map((item) => (
            <NavItem key={item.id} {...item} />
          ))}
        </ul>
      </nav>

      <div className="px-3 pb-5 border-t border-white/10 pt-3">
        <ul className="flex flex-col gap-0.5">
          <li>
            <Link
              href="/privacidade"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm text-white/50 hover:text-white rounded-lg"
            >
              <span className="material-symbols-outlined text-[18px]">security</span>
              Privacidade
            </Link>
          </li>
          <li>
            <Link
              href="/proposta"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm text-white/50 hover:text-white rounded-lg"
            >
              <span className="material-symbols-outlined text-[18px]">help</span>
              Suporte
            </Link>
          </li>
        </ul>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-background text-on-background">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 w-64 bg-primary z-40 text-white shadow-xl">
        {sidebarBody}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Fechar menu"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-64 bg-primary text-white flex flex-col shadow-2xl">
            {sidebarBody}
          </aside>
        </div>
      )}

      {/* Top bar — não sobrepõe conteúdo: content tem padding-top fixo */}
      <header className="fixed top-0 right-0 left-0 md:left-64 h-16 z-30 bg-surface/95 backdrop-blur border-b border-outline-variant/40 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg text-primary hover:bg-surface-container"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menu"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="md:hidden">
            <BrandLogo size="sm" href="/painel" />
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex flex-col items-end min-w-0">
            <span className="text-sm font-semibold text-on-surface truncate max-w-[180px]">
              {user.loading ? '…' : nome}
            </span>
            <span className="text-[11px] text-on-surface-variant truncate max-w-[180px]">{sub}</span>
          </div>
          <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold border border-outline-variant/40">
            {(nome || 'U').charAt(0).toUpperCase()}
          </div>
          <button
            type="button"
            onClick={logout}
            className="text-sm font-semibold text-error border border-error/25 hover:bg-error-container/30 px-3 py-1.5 rounded-lg transition-colors"
          >
            Sair
          </button>
        </div>
      </header>

      {/* Área principal: offset da sidebar + topbar, sem overlap */}
      <div className="md:pl-64 pt-16 min-h-screen">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </div>
      </div>
    </div>
  )
}
