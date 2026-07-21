'use client'

import Link from 'next/link'
import { BrandLogo } from '@/components/brand-logo'
import ThumbnailCarousel, {
  type ThumbnailCarouselItem,
} from '@/components/ui/thumbnail-carousel'
import { UI_LIBRARY } from '@/components/ui/registry'

const APEX_ITEMS: ThumbnailCarouselItem[] = [
  {
    id: 1,
    url: '/screenshots/2026-07-21/01-login.png',
    title: 'Login ÁPEX',
  },
  {
    id: 2,
    url: '/screenshots/2026-07-21/03-painel.png',
    title: 'Hub de indicadores',
  },
  {
    id: 3,
    url: '/screenshots/2026-07-21/04-medico.png',
    title: 'Dashboard Médico',
  },
  {
    id: 4,
    url: '/screenshots/2026-07-21/05-enfermeiro.png',
    title: 'Dashboard Enfermeiro',
  },
  {
    id: 5,
    url: '/screenshots/2026-07-21/06-gerencial.png',
    title: 'Visão Gerencial',
  },
  {
    id: 6,
    url: '/screenshots/2026-07-21/07-admin.png',
    title: 'Painel Admin',
  },
  {
    id: 7,
    url: '/screenshots/2026-07-21/08-dentista.png',
    title: 'Dashboard Dentista',
  },
  {
    id: 8,
    url: '/screenshots/2026-07-21/09-acs.png',
    title: 'Dashboard ACS',
  },
  {
    id: 9,
    url: '/screenshots/2026-07-21/10-gestor.png',
    title: 'Gestor Municipal',
  },
  {
    id: 10,
    url: '/screenshots/2026-07-21/02-landing.png',
    title: 'Landing pública',
  },
]

export default function UiLabPage() {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-outline-variant/40 bg-surface">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <BrandLogo size="md" href="/" />
          <Link href="/" className="text-sm font-semibold text-primary hover:underline">
            Voltar ao site
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-12">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">UI Library · Lab</h1>
          <p className="mt-2 text-on-surface-variant text-sm">
            Componentes salvos em <code className="text-primary">src/components/ui</code>. Cole o
            próximo no chat para eu adicionar.
          </p>
        </div>

        <section>
          <h2 className="text-lg font-semibold text-on-surface mb-3">Catálogo</h2>
          <ul className="space-y-2">
            {UI_LIBRARY.map((c) => (
              <li
                key={c.slug}
                className="rounded-lg border border-outline-variant/40 bg-surface px-4 py-3 text-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-on-surface">{c.slug}</span>
                  <span className="text-xs rounded-full bg-surface-container px-2 py-0.5 text-on-surface-variant">
                    {c.status}
                  </span>
                </div>
                <p className="text-on-surface-variant mt-1">{c.description}</p>
                <p className="text-xs text-outline mt-1">
                  deps: {c.deps.join(', ') || '—'} · {c.addedAt}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-on-surface mb-1">Demo · Thumbnail Carousel</h2>
          <p className="text-sm text-on-surface-variant mb-4">
            Arraste, use setas ou clique nas miniaturas. Dados = screenshots ÁPEX.
          </p>
          <div className="rounded-2xl border border-outline-variant/40 bg-surface shadow-ambient overflow-hidden">
            <ThumbnailCarousel items={APEX_ITEMS} imageHeight="h-[360px] sm:h-[420px]" />
          </div>
        </section>
      </div>
    </main>
  )
}
