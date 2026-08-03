# Graph Report - apex-saude-next  (2026-08-03)

## Corpus Check
- 111 files · ~478,189 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 453 nodes · 590 edges · 48 communities (31 shown, 17 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `aa943483`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- gerencial.ts
- page.tsx
- route.ts
- Community 13
- Community 14
- route.ts
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- ÁPEX Saúde Next — Instruções para Agentes
- ÁPEX Saúde Next — Scaffold + Dashboard Parametrizado
- README.md
- page.tsx
- route.ts
- cnes-gateway.py
- page.tsx
- update-cnes.js
- page.tsx
- update-enderecos.js
- admin-profissionais.tsx
- page.tsx
- simulador-client.tsx
- middleware.ts
- vincular-usf.js
- admin-municipios.tsx
- page.tsx
- Schemas SQL — qual usar
- page.tsx
- checklist-card.tsx
- route.ts
- ia-client.tsx
- page.tsx
- checklist-interativa.tsx

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `requireAdmin()` - 14 edges
3. `ÁPEX Saúde — Setup Supabase` - 10 edges
4. `useUser()` - 9 edges
5. `main()` - 8 edges
6. `IndicadorConfig` - 8 edges
7. `ÁPEX Saúde Next — Instruções para Agentes` - 8 edges
8. `criarClienteSupabase()` - 7 edges
9. `include` - 7 edges
10. `ÁPEX Saúde Next — Scaffold + Dashboard Parametrizado` - 7 edges

## Surprising Connections (you probably didn't know these)
- `GET()` --calls--> `requireAdmin()`  [EXTRACTED]
  src/app/api/admin/indicadores/route.ts → src/lib/admin-guard.ts
- `PUT()` --calls--> `requireAdmin()`  [EXTRACTED]
  src/app/api/admin/indicadores/route.ts → src/lib/admin-guard.ts
- `GET()` --calls--> `requireAdmin()`  [EXTRACTED]
  src/app/api/admin/municipios/route.ts → src/lib/admin-guard.ts
- `POST()` --calls--> `requireAdmin()`  [EXTRACTED]
  src/app/api/admin/municipios/route.ts → src/lib/admin-guard.ts
- `PUT()` --calls--> `requireAdmin()`  [EXTRACTED]
  src/app/api/admin/municipios/route.ts → src/lib/admin-guard.ts

## Import Cycles
- None detected.

## Communities (48 total, 17 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.12
Nodes (22): IndicadorCard(), IndicadorCardProps, STATUS_STYLES, formatarMeta(), formatarValor(), hashStr(), mesAnterior(), progressoPercentual() (+14 more)

### Community 1 - "Community 1"
Cohesion: 0.11
Nodes (29): POST(), POST(), GET(), executarQuery(), getPool(), pools, testarConexao(), validarSchema() (+21 more)

### Community 2 - "Community 2"
Cohesion: 0.10
Nodes (18): E, ESTADOS, Ind, M, U, DashboardHeader(), PERFIL_ICON, ROLE_LABEL (+10 more)

### Community 3 - "Community 3"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 4 - "Community 4"
Cohesion: 0.17
Nodes (15): EquipeConfig, EquipeId, GuiaIndicador, GUIAS, EquipeInstancia, indicadoresDoTipo(), MUNICIPIO_MOCK, MunicipioConfig (+7 more)

### Community 5 - "Community 5"
Cohesion: 0.09
Nodes (22): next, dependencies, next, pg, react, react-dom, @supabase/ssr, @supabase/supabase-js (+14 more)

### Community 6 - "Community 6"
Cohesion: 0.10
Nodes (21): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node (+13 more)

### Community 7 - "Community 7"
Cohesion: 0.18
Nodes (10): Passo 1: Criar projeto no Supabase (2 minutos), Passo 2: Pegar as credenciais, Passo 3: Rodar o schema, Passo 4: Rodar o seed de demonstração, Passo 5: Configurar .env.local, Passo 6: Habilitar Magic Link (Auth), Passo 7: Testar local, Passo 8: Deploy Vercel com envs (+2 more)

### Community 8 - "Community 8"
Cohesion: 0.17
Nodes (16): GET(), PUT(), supabase, DELETE(), GET(), MunicipioRow, POST(), PUT() (+8 more)

### Community 9 - "Community 9"
Cohesion: 0.60
Nodes (4): config, isPublica(), PUBLICAS, updateSession()

### Community 10 - "gerencial.ts"
Cohesion: 0.29
Nodes (8): formatarReais(), GerencialPage(), classificacao(), dadosGerencial(), FATOR, REPASSE_BASE, RepasseEquipe, supabase

### Community 11 - "page.tsx"
Cohesion: 0.38
Nodes (4): PainelEquipePage(), EquipeReal, equipesReaisPorTipo(), supabase

### Community 13 - "Community 13"
Cohesion: 0.33
Nodes (4): cormorant, dmMono, dmSans, metadata

### Community 14 - "Community 14"
Cohesion: 0.10
Nodes (31): auto_cadastrar(), conectar_pec(), descobrir_equipes(), descobrir_tabelas(), descobrir_ubs(), enviar_indicador_supabase(), enviar_para_supabase(), executar_query_indicador() (+23 more)

### Community 22 - "ÁPEX Saúde Next — Instruções para Agentes"
Cohesion: 0.22
Nodes (8): Comandos, Estrutura, Graphify, Projeto, Próximos passos (Fase 2), Regras, Stack, ÁPEX Saúde Next — Instruções para Agentes

### Community 23 - "ÁPEX Saúde Next — Scaffold + Dashboard Parametrizado"
Cohesion: 0.25
Nodes (7): Task 1: Preservar legado, Task 2: Scaffold Next.js, Task 3: Migrar código legado, Task 4: Dependências + shadcn + tokens, Task 5: Mock tipado + Dashboard parametrizado, Task 6: Pipeline QA, ÁPEX Saúde Next — Scaffold + Dashboard Parametrizado

### Community 24 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 26 - "page.tsx"
Cohesion: 0.40
Nodes (3): Cidade, ESTADOS, M

### Community 30 - "update-cnes.js"
Cohesion: 0.25
Nodes (6): {createClient}, env, fs, lines, s, vars

### Community 31 - "page.tsx"
Cohesion: 0.24
Nodes (6): Equipe, AppShell(), AppShellProps, NAV_MAIN, resolveActive(), ShellNavId

### Community 32 - "update-enderecos.js"
Cohesion: 0.25
Nodes (6): {createClient}, env, fs, lines, s, vars

### Community 33 - "admin-profissionais.tsx"
Cohesion: 0.40
Nodes (3): E, M, U

### Community 34 - "page.tsx"
Cohesion: 0.33
Nodes (6): Equipe, PERFIS, Prof, ProfissionaisPage(), ROLES_GESTOR, Ubs

### Community 35 - "simulador-client.tsx"
Cohesion: 0.31
Nodes (7): classificacaoLabel(), SimuladorPage(), CLASSIFICACOES, Props, repasseCenario(), SimuladorClient(), TIPOS

### Community 38 - "vincular-usf.js"
Cohesion: 0.33
Nodes (4): {createClient}, env, fs, s

### Community 39 - "admin-municipios.tsx"
Cohesion: 0.33
Nodes (4): E, ESTADOS, M, U

### Community 41 - "Schemas SQL — qual usar"
Cohesion: 0.40
Nodes (4): Regra, Schema alternativo (nao usado), Schema ativo (producao), Schemas SQL — qual usar

### Community 42 - "page.tsx"
Cohesion: 0.43
Nodes (4): DashboardPerfilPage(), heatCell(), equipeDoUsuario, supabase

## Knowledge Gaps
- **174 isolated node(s):** `supabase`, `PLANOS`, `Props`, `supabase`, `CLASSIFICACOES` (+169 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `Community 6` to `Community 5`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **What connects `supabase`, `PLANOS`, `Props` to the rest of the system?**
  _174 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.12096774193548387 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.11074197120708748 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.10344827586206896 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._
- **Should `Community 5` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._