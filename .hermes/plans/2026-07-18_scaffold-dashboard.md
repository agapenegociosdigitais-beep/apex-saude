# ÁPEX Saúde Next — Scaffold + Dashboard Parametrizado

> **Para Hermes:** Executar task por task com TDD onde aplicável. Pipeline QA (Opus→Senior→V2F) antes de declarar pronto.

**Goal:** Inicializar o apex-saude-next como app Next.js 16 real, preservando o código legado (conector PEC, schema Supabase), com design tokens extraídos do MVP HTML e a primeira tela (dashboard profissional parametrizado por perfil) rodando com mock tipado.

**Architecture:** Next.js 16 App Router (src-dir) + TypeScript strict + Tailwind + shadcn/ui. Dados mock em JSON tipado na Fase 1; Supabase (Auth + Postgres + RLS) entra na Fase 2. Conector PEC e schema SQL legados migram para a estrutura nova sem alteração de lógica.

**Tech Stack:** Next.js 16.2.6 | React 19 | TS strict | Tailwind | shadcn/ui | @supabase/ssr + supabase-js | npm (nunca pnpm) | Node C:\nvm4w\nodejs v24.14.0

**Design tokens (extraídos do MVP, 18/07):**
- Primary: `#c9a84c` (dourado) | primary-light: `#e8c97a` | primary-pale: `#f5e4b0`
- Background: `#f9f7f4` | surface: `#ede8df` / `#e8e2d8` | border: `#d4cec4` / `#c8bfa8`
- Text: `#7a7060` (muted) / `#8c8070`
- Semânticas: success `#10b981` | danger `#ef4444` | info `#3b82f6` | warning `#f59e0b`
- Fontes: Cormorant Garamond (display), DM Sans (body), DM Mono (números/código)

---

## Task 1: Preservar legado
- `mv C:\Users\benja\apex-saude-next → C:\Users\benja\apex-saude-next-legacy`
- Verificação: `ls apex-saude-next-legacy` lista app/, lib/, scripts/, supabase/ (16 arquivos)

## Task 2: Scaffold Next.js
```bash
export PATH="/c/nvm4w/nodejs:$PATH"
cd /c/Users/benja
npx create-next-app@16.2.6 apex-saude-next --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --turbopack
```
- Esperado: "Success" + node_modules instalado
- Verificação: `cd apex-saude-next && npm run build` → Compiled successfully

## Task 3: Migrar código legado
- `apex-saude-next-legacy/lib/pec-connector/` → `apex-saude-next/src/lib/pec-connector/`
- `apex-saude-next-legacy/app/api/integracao/pec/` → `apex-saude-next/src/app/api/integracao/pec/`
- `apex-saude-next-legacy/scripts/` → `apex-saude-next/scripts/`
- `apex-saude-next-legacy/supabase/` → `apex-saude-next/supabase/`
- Corrigir imports quebrados (alias @/)
- Verificação: `npx tsc --noEmit` sem erros nos arquivos migrados (deps pg podem precisar de install)

## Task 4: Dependências + shadcn + tokens
```bash
npm install @supabase/supabase-js @supabase/ssr
npx shadcn@latest init -y
npx shadcn@latest add button card badge
```
- Aplicar tokens em `src/app/globals.css` (CSS vars: --primary #c9a84c, --background #f9f7f4, etc.)
- Google Fonts no `src/app/layout.tsx`: Cormorant Garamond, DM Sans, DM Mono
- Copiar logos do MVP (`apex-saude/logo-*.png`, favicon.png) → `apex-saude-next/public/brand/`
- Verificação: build verde + home renderiza com paleta dourada

## Task 5: Mock tipado + Dashboard parametrizado
**Files:**
- Create: `src/lib/mock/perfis.ts` — 12 perfis SUS (portado de perfis-config.js, tipado)
- Create: `src/lib/mock/indicadores.ts` — 15 indicadores NT 6/2025 (C1-C7, B1-B6, M1-M2) com valores mock
- Create: `src/app/dashboard/[perfil]/page.tsx` — dashboard parametrizado por perfil
- Create: `src/components/dashboard/*` — header, cards de indicador, grid

**Regras:**
- generateStaticParams para os 12 perfis
- Perfil inválido → notFound()
- Zero `any`; funções <30 linhas
- Verificação: `npm run build` verde + 12 rotas /dashboard/<perfil> geradas

## Task 6: Pipeline QA
- Opus: build + lint verde
- Senior: auditar SOLID, segurança (mock sem secrets), performance
- V2F: perfil inválido, perfil com caracteres especiais, build limpo do zero
- Smoke test: `npm run dev` + curl nas rotas

---

**Riscos:** create-next-app pode pedir prompt interativo (mitigado com flags completas) | imports do legado podem usar paths antigos (corrigir na Task 3) | shadcn init pode precisar de TTY (fallback: configurar components.json manualmente)

**Fora de escopo (Fase 2+):** Supabase Auth, RLS, troca mock→dados reais, painéis de equipe, IA/PDCA, deploy
