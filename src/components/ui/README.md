# UI Component Library (`src/components/ui`)

Biblioteca de componentes no padrão **shadcn** + Tailwind + TypeScript.

## Por que `/components/ui`?

- Padrão do ecossistema shadcn/ui
- Imports estáveis: `@/components/ui/nome`
- Separado de componentes de domínio (`dashboard/`, `landing/`, etc.)

## Como adicionar (você cola → eu salvo)

1. Cole o código 21st.dev / shadcn no chat
2. O agente grava em `src/components/ui/<nome>.tsx` com TypeScript tipado
3. Atualiza `registry.ts` e `index.ts`
4. Instala deps se faltar (`framer-motion`, etc.)

## Componentes salvos

| Slug | Arquivo | Status |
|------|---------|--------|
| circular-gallery | `circular-gallery.tsx` | Wired na landing |
| thumbnail-carousel | `thumbnail-carousel.tsx` | Salvo, pronto para uso |

Ver catálogo programático: `registry.ts`

## Demo

Rota de laboratório: `/lab/ui`

## Uso rápido

```tsx
import ThumbnailCarousel from '@/components/ui/thumbnail-carousel'
// ou
import { ThumbnailCarousel, CircularGallery } from '@/components/ui'

// Com dados do ÁPEX
const items = [
  { id: 1, url: '/screenshots/2026-07-21/04-medico.png', title: 'Médico' },
]
;<ThumbnailCarousel items={items} />
```

## Stack do projeto

- Next.js 16 App Router + TypeScript
- Tailwind CSS v4 (`src/app/globals.css`)
- `framer-motion` já instalado
- Alias: `@/*` → `src/*`
