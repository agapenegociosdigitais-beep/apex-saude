# Graph Report - apex-saude-next  (2026-07-20)

## Corpus Check
- 66 files · ~79,015 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 315 nodes · 509 edges · 26 communities (17 shown, 9 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3f82ebb6`
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
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- ÁPEX Saúde Next — Instruções para Agentes
- ÁPEX Saúde Next — Scaffold + Dashboard Parametrizado
- README.md

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `valorMock()` - 12 edges
3. `criarClienteSupabase()` - 10 edges
4. `ÁPEX Saúde — Setup Supabase` - 10 edges
5. `useUser()` - 9 edges
6. `DashboardPerfilPage()` - 8 edges
7. `statusDoIndicador()` - 8 edges
8. `classificacaoDaNota()` - 8 edges
9. `IndicadorConfig` - 8 edges
10. `ÁPEX Saúde Next — Instruções para Agentes` - 8 edges

## Surprising Connections (you probably didn't know these)
- `GET()` --calls--> `criarClienteSupabase()`  [EXTRACTED]
  src/app/api/integracao/pec/config/route.ts → src/lib/supabase/server.ts
- `GET()` --calls--> `criarClienteSupabase()`  [EXTRACTED]
  src/app/api/integracao/pec/status/route.ts → src/lib/supabase/server.ts
- `GuiaEquipePage()` --calls--> `isEquipeId()`  [EXTRACTED]
  src/app/guias/[equipe]/page.tsx → src/lib/mock/equipes.ts
- `PainelEquipePage()` --calls--> `statusDoIndicador()`  [EXTRACTED]
  src/app/paineis/[equipe]/page.tsx → src/lib/mock/indicadores.ts
- `PainelEquipePage()` --calls--> `valorMock()`  [EXTRACTED]
  src/app/paineis/[equipe]/page.tsx → src/lib/mock/indicadores.ts

## Import Cycles
- None detected.

## Communities (26 total, 9 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.12
Nodes (30): DashboardPerfilPage(), IaPage(), ChecklistCard(), ChecklistCardProps, IndicadorCard(), IndicadorCardProps, STATUS_STYLES, EquipeConfig (+22 more)

### Community 1 - "Community 1"
Cohesion: 0.13
Nodes (26): GET(), POST(), POST(), GET(), executarQuery(), getPool(), pools, testarConexao() (+18 more)

### Community 2 - "Community 2"
Cohesion: 0.11
Nodes (19): E, ESTADOS, Ind, M, U, LoginPage(), DashboardHeader(), PERFIL_ICON (+11 more)

### Community 3 - "Community 3"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 4 - "Community 4"
Cohesion: 0.12
Nodes (27): GerencialPage(), CheckListInterativa(), Props, GuiaEquipePage(), PainelEquipePage(), CLASSIFICACOES, repasseCenario(), SimuladorPage() (+19 more)

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
Cohesion: 0.25
Nodes (3): MunicipioRow, supabase, UnidadeRow

### Community 9 - "Community 9"
Cohesion: 0.39
Nodes (6): config, isPublica(), PUBLICAS, updateSession(), config, middleware()

### Community 13 - "Community 13"
Cohesion: 0.33
Nodes (4): cormorant, dmMono, dmSans, metadata

### Community 14 - "Community 14"
Cohesion: 0.70
Nodes (4): conectar_pec(), enviar_supabase(), executar_queries(), main()

### Community 22 - "ÁPEX Saúde Next — Instruções para Agentes"
Cohesion: 0.22
Nodes (8): Comandos, Estrutura, Graphify, Projeto, Próximos passos (Fase 2), Regras, Stack, ÁPEX Saúde Next — Instruções para Agentes

### Community 23 - "ÁPEX Saúde Next — Scaffold + Dashboard Parametrizado"
Cohesion: 0.25
Nodes (7): Task 1: Preservar legado, Task 2: Scaffold Next.js, Task 3: Migrar código legado, Task 4: Dependências + shadcn + tokens, Task 5: Mock tipado + Dashboard parametrizado, Task 6: Pipeline QA, ÁPEX Saúde Next — Scaffold + Dashboard Parametrizado

### Community 24 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

## Knowledge Gaps
- **120 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+115 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `Community 6` to `Community 5`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Why does `DashboardHeader()` connect `Community 2` to `Community 0`, `Community 4`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _120 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.11794871794871795 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.12912912912912913 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.11375661375661375 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._