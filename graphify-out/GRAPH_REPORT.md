# Graph Report - apex-saude-next  (2026-07-21)

## Corpus Check
- 86 files · ~468,798 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 356 nodes · 564 edges · 29 communities (20 shown, 9 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8ac88854`
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
- page.tsx
- route.ts
- cnes-gateway.py

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `valorMock()` - 12 edges
3. `criarClienteSupabase()` - 10 edges
4. `ÁPEX Saúde — Setup Supabase` - 10 edges
5. `useUser()` - 9 edges
6. `main()` - 8 edges
7. `DashboardPerfilPage()` - 8 edges
8. `statusDoIndicador()` - 8 edges
9. `classificacaoDaNota()` - 8 edges
10. `IndicadorConfig` - 8 edges

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

## Communities (29 total, 9 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.13
Nodes (30): DashboardPerfilPage(), IaPage(), ChecklistCard(), ChecklistCardProps, IndicadorCard(), IndicadorCardProps, STATUS_STYLES, EquipeConfig (+22 more)

### Community 1 - "Community 1"
Cohesion: 0.13
Nodes (26): GET(), POST(), POST(), GET(), executarQuery(), getPool(), pools, testarConexao() (+18 more)

### Community 2 - "Community 2"
Cohesion: 0.11
Nodes (18): E, ESTADOS, Ind, M, U, LoginPage(), PERFIL_ICON, ROLE_LABEL (+10 more)

### Community 3 - "Community 3"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 4 - "Community 4"
Cohesion: 0.12
Nodes (28): GerencialPage(), CheckListInterativa(), Props, GuiaEquipePage(), PainelEquipePage(), CLASSIFICACOES, repasseCenario(), SimuladorPage() (+20 more)

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

### Community 27 - "route.ts"
Cohesion: 0.67
Nodes (3): CnesEstabelecimento, fetchUbs(), POST()

### Community 28 - "cnes-gateway.py"
Cohesion: 0.40
Nodes (4): fetch_cnes(), list_to_ubs(), Busca estabelecimentos de um municipio na API do DATASUS, Converte resposta da API pro formato padrao de UBS

## Knowledge Gaps
- **124 isolated node(s):** `M`, `Cidade`, `ESTADOS`, `CnesEstabelecimento`, `setup-vps.sh script` (+119 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `Community 6` to `Community 5`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Why does `DashboardHeader()` connect `Community 4` to `Community 0`, `Community 2`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **What connects `M`, `Cidade`, `ESTADOS` to the rest of the system?**
  _124 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.12660028449502134 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.12912912912912913 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.10591133004926108 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._