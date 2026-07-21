'use client'

import ThumbnailCarousel, {
  type ThumbnailCarouselItem,
} from '@/components/ui/thumbnail-carousel'

const V = '20260721e'
const s = (file: string) => `/screenshots/2026-07-21/${file}?v=${V}`

/** Telas reais do ÁPEX no Thumbnail Carousel */
const APEX_ITEMS: ThumbnailCarouselItem[] = [
  { id: 1, url: s('01-login.png'), title: 'Login ÁPEX' },
  { id: 2, url: s('03-painel.png'), title: 'Hub de indicadores' },
  { id: 3, url: s('04-medico.png'), title: 'Dashboard Médico' },
  { id: 4, url: s('05-enfermeiro.png'), title: 'Dashboard Enfermeiro' },
  { id: 5, url: s('06-gerencial.png'), title: 'Visão Gerencial' },
  { id: 6, url: s('07-admin.png'), title: 'Painel Admin' },
  { id: 7, url: s('08-dentista.png'), title: 'Dashboard Dentista' },
  { id: 8, url: s('09-acs.png'), title: 'Dashboard ACS' },
  { id: 9, url: s('10-gestor.png'), title: 'Gestor Municipal' },
  { id: 10, url: s('02-landing.png'), title: 'Landing pública' },
]

export function TelasGallerySection() {
  return (
    <section id="telas" className="relative bg-surface py-16 md:py-24 px-4 md:px-8">
      <div className="max-w-[1440px] mx-auto">
        <div className="text-center mb-10 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight">
            O Que Você Recebe
          </h2>
          <p className="mt-3 text-on-surface-variant text-sm sm:text-base">
            Telas reais do sistema · arraste, use as setas ou clique nas miniaturas
          </p>
        </div>

        <div className="max-w-4xl mx-auto rounded-2xl border border-outline-variant/40 bg-surface-container-lowest shadow-ambient overflow-hidden">
          <ThumbnailCarousel
            items={APEX_ITEMS}
            imageHeight="h-[280px] sm:h-[400px] md:h-[460px]"
            className="!max-w-none !p-3 sm:!p-6"
          />
        </div>
      </div>
    </section>
  )
}
