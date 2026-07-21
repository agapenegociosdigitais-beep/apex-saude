/**
 * UI Component Library — catálogo de componentes salvos (21st.dev / shadcn).
 * Atualize este arquivo sempre que um novo componente for colado em /components/ui.
 */

export type UiLibraryEntry = {
  /** Nome do arquivo em components/ui */
  slug: string
  /** Export principal */
  exportName: string
  /** Origem (ex: 21st.dev) */
  source: string
  /** Dependências npm extras */
  deps: string[]
  /** Resumo de uso */
  description: string
  /** Data de inclusão */
  addedAt: string
  /** Status de integração no app */
  status: 'saved' | 'wired' | 'demo-only'
}

export const UI_LIBRARY: UiLibraryEntry[] = [
  {
    slug: 'circular-gallery',
    exportName: 'CircularGallery',
    source: '21st.dev (Circular Gallery) — adaptado ÁPEX',
    deps: ['framer-motion'],
    description: 'Galeria circular 3D horizontal acionada por scroll. Disponível na lib.',
    addedAt: '2026-07-21',
    status: 'demo-only',
  },
  {
    slug: 'thumbnail-carousel',
    exportName: 'ThumbnailCarousel (default)',
    source: '21st.dev / user paste',
    deps: ['framer-motion'],
    description:
      'Carousel com drag + thumbnails expansíveis. Usado na landing (#telas) com screenshots ÁPEX.',
    addedAt: '2026-07-21',
    status: 'wired',
  },
]
