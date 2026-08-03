# Relatório das páginas — ÁPEX Saúde Next

> Controle de acesso real: o `middleware.ts` (`src/lib/supabase/middleware.ts`) protege
> `/painel`, `/dashboard`, `/gerencial`, `/simulador`, `/ia`, `/admin`, `/paineis`, `/guias`,
> `/profissionais`, `/equipes`, `/gestao` e `/api/admin|integracao/*` — exige usuário logado
> (Supabase Auth) e, para `/admin` e `/api/admin/*`, verifica na tabela `usuarios` (fonte de
> verdade, não `user_metadata`) se `role` é `admin` ou `gestor`, senão redireciona para `/`.
> Sem Supabase configurado (`NEXT_PUBLIC_SUPABASE_URL`/`ANON_KEY` ausentes), o middleware faz
> passthrough total (modo demo). O hook `useUser()` só filtra a UI (esconder botões), nunca é
> a barreira de segurança real.

---

## 1. `/` — Landing pública

**Arquivo:** `src/app/page.tsx`
**Mostra:** Site institucional de vendas da ÁPEX Saúde: hero com CTA, "O Desafio Atual" (3 cards de dor), "Como Funciona" (3 passos: conecta PEC → calcula notas → projeta repasse), galeria de telas do produto (`TelasGallerySection`), 3 planos de preço (Essencial/Profissional/Municipal), seção "Sobre" e footer com links de privacidade/contato/login.
**Dados:** 100% estático/hardcoded no componente (arrays de texto). Nenhuma chamada a API ou Supabase.
**Acesso:** Público, sem login (não está no matcher do middleware).
**Interações:** Links de navegação (`#solucoes`, `#telas`, `#precos`, `#sobre`), botões "Entrar" (`/login`), "Demo" (`/painel`), "Ver demonstração", "Falar com consultor" (`/proposta`), 3 botões de assinatura de plano (levam a `/proposta`).

---

## 2. `/painel` — Hub / seletor de perfis

**Arquivo:** `src/app/painel/page.tsx`
**Mostra:** Página inicial pós-login. Grid com os 12 perfis profissionais (cada um linkando ao seu dashboard), grid com os 3 painéis de equipe (eSF/eAP, eSB, eMulti) e grid de "Gestão e ferramentas" (Visão gerencial, Simulador, Plano PDCA, e Admin se aplicável).
**Dados:** Mock estático — `PERFIS`/`PERFIL_IDS` (`lib/mock/perfis`) e `EQUIPES`/`EQUIPE_IDS` (`lib/mock/equipes`). Nenhuma chamada Supabase direta.
**Acesso:** Protegido pelo middleware (qualquer usuário logado). Usa `useUser()` só para decidir se mostra o card "Painel Admin" (`role === 'admin' || 'gestor'`) — é filtro de UX, comentário no código confirma que o middleware é a barreira real.
**Interações:** Apenas navegação por `Link` (cards clicáveis), sem formulários.

---

## 3. `/login` — Autenticação

**Arquivo:** `src/app/login/page.tsx`
**Mostra:** Tela de login com fundo gradiente verde, card central com formulário de e-mail/senha, link "Esqueci minha senha" e link de volta ao site.
**Dados:** Se Supabase configurado (`supabaseConfigurado()`), usa `criarClienteBrowser().auth.signInWithPassword` e `resetPasswordForEmail` (Supabase real). Se não configurado, cai em "modo demonstração" e apenas navega para `/painel` sem autenticar.
**Acesso:** Pública (rota liberada explicitamente no middleware via `PUBLICAS = ['/login']`).
**Interações:** Formulário de login (e-mail + senha), botão "Entrar", botão "Esqueci minha senha" (dispara `resetPasswordForEmail`). Após login bem-sucedido, redireciona por role: `admin` → `/admin`, `gestor` → `/gerencial`, demais → `/painel`. Também dispara um POST de auditoria (`/api/admin/auditoria`) registrando o login.

---

## 4. `/profissionais` — Gestão de profissionais (self-service por município)

**Arquivo:** `src/app/profissionais/page.tsx`
**Mostra:** Tabela de profissionais do município do usuário logado, com formulário de criação/edição (nome, e-mail, cargo/perfil, nível de acesso, UBS, equipe, senha inicial).
**Dados:** Supabase real via API routes: `GET/POST/PUT/DELETE /api/admin/usuarios`, `GET /api/admin/unidades`, `GET /api/admin/equipes` — todas filtradas por `municipio_id` do usuário. As rotas usam `createClient` do `@supabase/supabase-js` com `SUPABASE_SERVICE_ROLE_KEY` (acesso admin ao banco).
**Acesso:** Protegida pelo middleware (login obrigatório). Usa `useUser()` para saber `role`: só usuários com `role === 'gestor'` (`ehGestor`) veem os botões de editar/excluir e o seletor de "Nível" no formulário; demais só visualizam a lista.
**Interações: formulário de cadastro/edição (nome, e-mail, cargo, UBS, equipe, senha inicial), botão "+ Novo", botões de editar (✏️) e excluir (🗑️) por linha (com `confirm()`), alerta de senha gerada ao criar.

---

## 5. `/equipes` — Listagem de equipes do município

**Arquivo:** `src/app/equipes/page.tsx`
**Mostra:** Tabela somente-leitura das equipes de saúde (eSF, eSB, eMulti) do município do usuário: nome, tipo, código INE, unidade vinculada.
**Dados:** Supabase real via `GET /api/admin/equipes?municipio_id=...`.
**Acesso:** Protegida pelo middleware (login obrigatório). Não faz nenhuma checagem adicional de `role` — qualquer logado do município vê a lista.
**Interações:** Nenhuma interação além de carregamento; página é somente leitura (sem formulários, sem filtros, sem botões de ação).

---

## 6. `/gestao` — Painel resumo de gestão do município

**Arquivo:** `src/app/gestao/page.tsx`
**Mostra:** 3 cards de estatística (total de equipes, UBS, profissionais do município) e um bloco de status da "Configuração PEC" (mensagem fixa "Aguardando acesso do TI da prefeitura").
**Dados:** Supabase real — `Promise.all` de `GET /api/admin/equipes`, `/api/admin/unidades`, `/api/admin/usuarios`, todos filtrados por `municipio_id`; conta o `.length` de cada resultado.
**Acesso:** Protegida pelo middleware (login obrigatório). Não checa `role` — qualquer logado do município vê os números.
**Interações:** Nenhuma; página é um dashboard estático de leitura.

---

## 7. `/lab/ui` — Laboratório de componentes de UI

**Arquivo:** `src/app/lab/ui/page.tsx`
**Mostra:** Página interna de desenvolvimento: lista o catálogo de componentes salvos em `src/components/ui` (`UI_LIBRARY`, de `components/ui/registry`) com slug/status/dependências, e uma demo funcional do componente `ThumbnailCarousel` alimentado com 10 screenshots reais do produto (`/screenshots/2026-07-21/*.png`).
**Dados:** Mock estático (array `UI_LIBRARY` + array `APEX_ITEMS` hardcoded de imagens locais). Sem Supabase.
**Acesso:** Não está no matcher do middleware — pública/sem exigência de login (é uma ferramenta interna de dev, sem link visível na navegação principal).
**Interações:** Carousel navegável (arrastar, setas, clique em miniaturas), link "Voltar ao site".

---

## 8. `/proposta` — Página de vendas/comercial (planos e inexigibilidade)

**Arquivo:** `src/app/proposta/page.tsx`
**Mostra:** Página de proposta comercial detalhada: 3 planos por porte de município (Pequeno/Médio/Grande) com valor mensal, implantação e consultoria; lista "Tudo incluso"; texto legal sobre contratação por inexigibilidade de licitação (Art. 74, III, Lei 14.133/2021); menciona piloto em Belterra-PA.
**Dados:** 100% estático (array `PLANOS` e `INCLUSO` hardcoded no componente). Sem chamadas a API.
**Acesso:** Pública, sem login (não está no matcher do middleware).
**Interações:** Botões "mailto:" para solicitar proposta por e-mail (um por plano), link "ver demonstração do sistema" (`/painel`).

---

## 9. `/privacidade` — Política de Privacidade / LGPD

**Arquivo:** `src/app/privacidade/page.tsx`
**Mostra:** Texto institucional/legal: dados tratados, base legal (LGPD Art. 7º/11º), medidas de segurança, direitos do titular, política de retenção.
**Dados:** 100% estático (conteúdo textual fixo no JSX). Sem dados dinâmicos.
**Acesso:** Pública, sem login.
**Interações:** Apenas link "Voltar" (`/`); nenhum formulário ou botão de ação.

---

## 10. `/paineis/[equipe]` — Painel de equipe (eSF/eSB/eMulti)

**Arquivo:** `src/app/paineis/[equipe]/page.tsx`
**Mostra:** Painel agregado de uma equipe (parâmetro dinâmico `equipe` = `esf`, `esb` ou `emulti`): nota calculada da equipe com classificação, cards dos indicadores da equipe, grid de profissionais membros (linkando para os dashboards individuais) e link para o guia educativo da equipe.
**Dados:** Mock determinístico — `EQUIPES`/`isEquipeId` (`lib/mock/equipes`), `valorMock`/`statusDoIndicador` (`lib/mock/indicadores`), `calcularNotaEquipe`/`classificacaoDaNota` (`lib/mock/nota`). Sem Supabase; `generateStaticParams` pré-gera as 3 páginas em build time (SSG). `notFound()` se o parâmetro não for uma equipe válida.
**Acesso:** Protegida pelo middleware (login obrigatório para qualquer `/paineis/*`). Não há checagem adicional de `role`/perfil no componente — qualquer logado pode ver qualquer equipe.
**Interações:** Apenas navegação (links para dashboards de membros e para o guia da equipe); sem formulários.

---

## 11. `/ia` — Plano de ação PDCA

**Arquivo:** `src/app/ia/page.tsx`
**Mostra:** Ferramenta de "motor de regras" (não é IA generativa ainda, conforme texto na própria página: "IA generativa na Fase 3") que gera um plano PDCA (Planejar/Executar/Verificar/Agir) com base nos indicadores críticos do perfil selecionado pelo usuário.
**Dados:** Mock determinístico — `PERFIS`/`PERFIL_IDS` (`lib/mock/perfis`), `formatarMeta`/`statusDoIndicador`/`valorMock` (`lib/mock/indicadores`). Sem Supabase.
**Acesso:** Protegida pelo middleware (login obrigatório). Sem checagem de `role`; o próprio usuário escolhe manualmente o perfil a analisar via `<select>` (não é vinculado ao seu perfil real de login).
**Interações:** Dropdown para trocar o perfil analisado; link para o dashboard do perfil selecionado.

---

## 12. `/guias/[equipe]` — Conteúdo educativo por equipe

**Arquivo:** `src/app/guias/[equipe]/page.tsx` (+ sub-componente `checklist-interativa.tsx`)
**Mostra:** Material educativo detalhado por indicador da equipe (o que é, como melhorar, plano de ação sugerido) e um checklist interativo por indicador (via `CheckListInterativa`).
**Dados:** Mock estático — `EQUIPES`/`isEquipeId` (`lib/mock/equipes`), `GUIAS` (`lib/mock/guias-content`), mais um dicionário local `PLANOS` (texto fixo de metas por código de indicador). `generateStaticParams` pré-gera as 3 páginas (SSG). Sem Supabase.
**Acesso:** Protegida pelo middleware (login obrigatório para `/guias/*`). Sem checagem de `role`.
**Interações:** Checklist marcável item a item (estado local, provavelmente persistido em `localStorage` dentro de `checklist-interativa.tsx`), link para o painel da equipe correspondente.

---

## 13. `/admin` — Painel administrativo (com 7 abas/sub-módulos)

**Arquivo:** `src/app/admin/page.tsx`
**Mostra:** Shell de abas (Municípios, Equipes, Indicadores, PEC, Profissionais, Gestão, Comercial), cada uma renderizando um sub-componente. A aba ativa é controlada por state e sincronizada com query param `?tab=`.
**Dados:** Não busca dados diretamente; delega a cada sub-componente.
**Acesso:** Protegida pelo middleware de forma reforçada: além de exigir login, o middleware consulta a tabela `usuarios` no servidor e só libera se `role` for `admin` ou `gestor` (senão redireciona para `/`). É a única rota (além de `/api/admin/*`) com essa checagem extra de role no middleware.
**Interações:** Navegação por abas (botões de tab).

### 13.1 `admin-municipios.tsx` — Aba Municípios
**Mostra:** CRUD de municípios (nome/UF/código IBGE/população, com autocomplete de cidades via API pública do IBGE) e, dentro de cada município expandido, CRUD de UBS (nome/tipo/CNES).
**Dados:** Supabase real via `GET/POST/PUT/DELETE /api/admin/municipios` e `/api/admin/unidades`; busca de cidades por UF usa a API pública `servicodados.ibge.gov.br` (fetch externo, não Supabase).
**Interações:** Formulário de novo/editar município, autocomplete de cidade, formulário inline de nova UBS por município expandido, botões de editar/excluir (com `confirm()`).

### 13.2 `admin-equipes.tsx` — Aba Equipes
**Mostra:** Lista de equipes de todos os municípios com filtro por município, formulário de criação (município → unidade → nome/tipo: eSF/eSB/eMulti/eAP).
**Dados:** Supabase real via `GET/POST/DELETE /api/admin/equipes` e `GET /api/admin/municipios` (para popular o filtro e o form).
**Interações:** Filtro por município (select), formulário "+ Nova Equipe", botão excluir por linha.

### 13.3 `admin-indicadores.tsx` — Aba Indicadores
**Mostra:** Tabela dos 15 indicadores oficiais com código, nome, grupo, peso, meta e direção (invertido ou não), com filtro por município e edição inline de peso/meta.
**Dados:** Supabase real via `GET /api/admin/indicadores` e `GET /api/admin/municipios` (para o filtro); salvamento via `PUT /api/admin/indicadores`.
**Interações:** Filtro por município (select, aparentemente decorativo — não vi filtragem local aplicada aos indicadores no snippet), formulário de edição de peso/meta por indicador, botão editar (✏️) por linha.

### 13.4 `admin-pec.tsx` — Aba Integração PEC
**Mostra:** Ferramenta de onboarding de municípios: "Adicionar Cidade" (seleciona UF/cidade via API do IBGE e chama endpoint de preparação), lista de municípios já configurados com formulário de conexão ao banco PEC (host, porta, database, usuário, senha), e ações de Testar Conexão / Salvar Config / Sincronizar / Puxar UBS do CNES / Excluir Cidade (com modal de confirmação).
**Dados:** Supabase real e integrações externas via várias API routes: `POST /api/integracao/pec/preparar`, `POST /api/integracao/pec/config` (testar/salvar), `POST /api/integracao/pec/sincronizar`, `POST /api/integracao/pec/cnes` (puxa UBS do CNES/DataSUS), `GET/DELETE /api/admin/municipios`. Também consome a API pública do IBGE para autocomplete de cidades.
**Interações:** Fluxo completo de "adicionar cidade" (2 selects + botão), formulário de credenciais PEC por município, 4 botões de ação por município (Testar/Salvar/Sincronizar/Puxar UBS), modal de confirmação de exclusão de cidade com aviso de irreversibilidade.

### 13.5 `admin-profissionais.tsx` — Aba Profissionais (visão global, todos municípios)
**Mostra:** Equivalente à página `/profissionais`, mas sem restrição de município — lista/gerencia profissionais de todos os municípios, com filtro por UBS.
**Dados:** Supabase real via `GET/POST/PUT/DELETE /api/admin/usuarios`, `GET /api/admin/municipios`, `GET /api/admin/equipes`.
**Interações:** Filtro por UBS (select), formulário completo de novo/editar profissional (inclui seleção de município, já que é visão global), botões editar/excluir por linha.

### 13.6 `admin-gestao.tsx` — Aba Gestão (visão geral de indicadores)
**Mostra:** Grid dos 12 perfis profissionais com atalho para abrir o dashboard de cada um em nova aba, e cards de acesso rápido por município (links para Gerencial, painéis eSF/eSB/eMulti, guia).
**Dados:** Supabase real via `GET /api/admin/municipios` e `GET /api/admin/equipes` (para contagens e filtro); os 12 perfis exibidos são um array hardcoded local (não vem de `lib/mock/perfis`, é uma lista própria e ligeiramente diferente — ex: usa `assistente` em vez de `assistente_social`, e inclui `gestor` como perfil).
**Interações:** Filtro por município (select), links de atalho (abrem em nova aba) para dashboards de perfil e para as ferramentas do município.

### `admin-comercial.tsx` (mencionado como aba, não lido a pedido — fora da lista dos 6 arquivos solicitados)

---

## 14. `/dashboard/[perfil]` — Dashboard individual por perfil profissional (12 perfis)

**Arquivo:** `src/app/dashboard/[perfil]/page.tsx`
**Mostra:** Dashboard pessoal do profissional: banner "Modo demonstração", nota da equipe do mês com classificação, cards de cada indicador do perfil com ícone de tendência, heatmap de evolução dos últimos 12 meses por indicador, painel de insights, checklist da semana, bloco "Seu impacto" e links relacionados.
**Dados:** Mock determinístico — `PERFIS`/`isPerfilId` (`lib/mock/perfis`), `statusDoIndicador`/`valorMock`/`tendencia`/`iconeTendencia`/`ultimosMeses`/`dicaIndicador` (`lib/mock/indicadores`). `generateStaticParams` pré-gera as 12 páginas (SSG). Sem Supabase.
**Acesso:** Protegida pelo middleware (login obrigatório). Adicionalmente envolvida em `<PerfilGuard>`: usa `useUser()` para permitir livre acesso a qualquer perfil se `role` for `admin`/`gestor`; se for `profissional`/`coordenador`, só pode ver o próprio `perfil_id` — tentar acessar outro perfil redireciona (`router.replace`) para o dashboard do próprio perfil.
**Interações:** Apenas leitura/navegação — sem formulários; tooltips (`title=`) com dicas por indicador; links de "call to action" (`config.links`).

---

## 15. `/simulador` — Simulador financeiro de repasse

**Arquivo:** `src/app/simulador/page.tsx`
**Mostra:** Ferramenta interativa para o usuário simular o repasse mensal/anual do município variando a quantidade de equipes (eSF/eSB/eMulti) e comparando um cenário "atual" vs. "com ÁPEX" por classificação (Ótimo/Bom/Suficiente/Regular).
**Dados:** Mock — constantes `FATOR_CLASSIFICACAO`/`REPASSE_BASE_MENSAL`/`formatarReais` (`lib/mock/repasse`); cálculo 100% client-side, sem chamada de rede. Sem Supabase.
**Acesso:** Protegida pelo middleware (login obrigatório). Sem checagem de `role`.
**Interações:** 3 inputs numéricos (quantidade de equipes por tipo), 2 selects (cenário atual/alvo), resultado recalculado em tempo real (repasse hoje, repasse com ÁPEX, ganho anual projetado).

---

## 16. `/gerencial` — Visão gerencial do município

**Arquivo:** `src/app/gerencial/page.tsx`
**Mostra:** Painel executivo: nota média do município, repasse mensal simulado total, perda anual projetada se as notas não melhorarem, tabela detalhada por equipe (nota, classificação, repasse/perda), e um painel de insights/análise textual.
**Dados:** Mock — `MUNICIPIO_MOCK` (`lib/mock/municipio`), `EQUIPES` (`lib/mock/equipes`), `classificacaoDaNota` (`lib/mock/nota`), `formatarReais`/`repasseDoMunicipio` (`lib/mock/repasse`). Cálculo 100% server-side no componente (Server Component, sem `'use client'`), sem Supabase.
**Acesso:** Protegida pelo middleware (login obrigatório). Sem checagem adicional de `role` no componente (embora no fluxo de login, `gestor` seja redirecionado para cá por padrão, o middleware não restringe o acesso a essa rota especificamente para gestores).
**Interações:** Apenas navegação/leitura — link para o `/simulador` e para os painéis de equipe (`/paineis/[tipo]`); sem formulários.

---

## Resumo de padrões observados

- **Dados mock vs. Supabase real:** as rotas de "produto" voltadas ao profissional/gestão de indicadores (`/dashboard/[perfil]`, `/paineis/[equipe]`, `/guias/[equipe]`, `/ia`, `/simulador`, `/gerencial`) ainda usam **100% dados mock determinísticos** (`lib/mock/*`), conforme a Fase 1 do projeto. Já as rotas de **cadastro/administração** (`/profissionais`, `/equipes`, `/gestao`, `/admin` e seus 6 sub-módulos) já usam **Supabase real** via API routes (`/api/admin/*`, `/api/integracao/pec/*`) com `SUPABASE_SERVICE_ROLE_KEY`.
- **Controle de acesso real** está no middleware (server-side, consulta a tabela `usuarios`), não no `useUser()` client-side. `useUser()` e `PerfilGuard` só ajustam a UI/UX (esconder botões, redirecionar perfil errado); nunca são a barreira de segurança de fato.
- Só `/admin` e `/api/admin/*` exigem explicitamente `role` = `admin` ou `gestor` no middleware. As demais rotas protegidas só exigem "estar logado".
- `/`, `/proposta`, `/privacidade` e `/lab/ui` são públicas (fora do matcher do middleware). `/login` é explicitamente pública dentro do middleware.
