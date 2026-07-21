# ÁPEX Saúde Next — Instruções para Agentes

## Projeto
Plataforma SaaS de gestão dos 15 indicadores da APS (NT 6/2025 - DEAPS/SAPS/MS).
Sucessor do MVP HTML (`C:\Users\benja\apex-saude`). Migração iniciada em 18/07/2026.

## Stack
- Next.js 16.2.6 (App Router, src-dir, Turbopack) + React 19 + TypeScript strict
- Tailwind CSS v4 (tokens da paleta ÁPEX em `src/app/globals.css` — @theme)
- Supabase (Auth + Postgres + RLS) — Fase 2, client em `src/lib/supabase/server.ts`
- Fontes: Cormorant Garamond (display), DM Sans (body), DM Mono (números)
- npm (NUNCA pnpm — trava no sharp) | Node `C:\nvm4w\nodejs` (v24)

## Estrutura
```
src/
├── app/
│   ├── page.tsx                    # Home: seletor 12 perfis + paineis + ferramentas
│   ├── dashboard/[perfil]/page.tsx # 12 dashboards SSG (mock deterministico)
│   ├── paineis/[equipe]/page.tsx   # 3 paineis de equipe (nota ponderada)
│   ├── guias/[equipe]/page.tsx     # Conteudo educativo dos 15 indicadores
│   ├── gerencial/page.tsx          # Notas + repasse simulado do municipio
│   ├── simulador/page.tsx          # Projecao repasse anual (client)
│   ├── ia/page.tsx                 # PDCA por perfil (motor de regras)
│   ├── proposta/page.tsx           # Planos + inexigibilidade Art. 74
│   ├── admin/page.tsx              # Status implantacao + rotas PEC
│   ├── privacidade/page.tsx        # LGPD
│   ├── login/page.tsx              # Magic link (aguardando Supabase)
│   └── api/integracao/pec/         # Rotas PEC (config/sincronizar/status)
├── components/dashboard/           # Header, IndicadorCard, ChecklistCard
├── lib/
│   ├── mock/                       # perfis, equipes, indicadores, nota, repasse,
│   │   ├── municipio, guias-content + __tests__/ (Vitest, 18 testes)
│   ├── pec-connector/              # Conector PEC→PostgreSQL
│   └── supabase/                   # server.ts, client.ts, middleware.ts
├── middleware.ts                   # updateSession (passthrough sem env)
scripts/                            # pec-sync.py + setup-vps.sh (cron 6h na VPS)
supabase/                           # Schema SQL 17 tabelas + RPC + migrations
public/brand/                       # Logos oficiais
```

## Comandos
- Gate pre-commit: `npm run lint && npm run test && npm run build` (todos verdes)
- Deploy: `vercel --prod --yes` (alias automatico para apex-saude-next.vercel.app)

## Regras
- Dados atuais = mock determinístico (`valorMock`) — trocar por Supabase na Fase 2
- B3 é o único indicador invertido (menor é melhor); C2/C3 de gestão são escala 0-10
- `perfis.ts` é a fonte de verdade dos 12 perfis (portado de perfis-config.js)
- Build gate: `npm run build` deve estar verde antes de commitar
- Legado pré-migração preservado em `C:\Users\benja\apex-saude-next-legacy`
- Diff mínimo; Stitch/UI colado = fidelidade 1:1 se pedido exact

## Graphify
- Grafo: `graphify-out/` (code-only AST)
- Feature multi-arquivo: `graphify query "<tema>"` se o grafo existir
- Atualizar: `graphify update .` (PATH: `%USERPROFILE%\.local\bin`)
- Hermes: skill `graphify` / `graphify-context`

## Próximos passos (Fase 2)
1. Criar projeto Supabase + rodar schema SQL (supabase/*.sql)
2. Auth (magic link) + middleware de proteção de rotas
3. Trocar mock → leitura de valores_indicadores via RLS
4. Painéis de equipe (eSF/eSB/eMulti), gerencial, IA/PDCA
5. Deploy Vercel + pec-sync.py na VPS (cron)
