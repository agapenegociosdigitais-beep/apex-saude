# Schemas SQL — qual usar

O repositorio contem **2 desenhos de schema diferentes**. Apenas um esta
em producao no Supabase.

## Schema ativo (producao)

**`supabase/schema.sql`** + **`migrations/001-008/`**

- 8 tabelas: municipios, unidades_saude, equipes, indicadores,
  valores_indicadores, usuarios, integracoes_pec, auditoria_log
- `periodo TEXT` (`'2026-07'`), `municipios.uf`
- Funcoes RPC: `calcular_nota_equipe`, `resumo_municipio`
- **Este eh o schema real**, sincronizado com o banco em
  `btpafifyixievhejjgty` (Supabase)

## Schema alternativo (nao usado)

**`supabase/schema_completo_parte1.sql`**, `parte2.sql`, `parte3.sql`,
`rpc_sync_indicador.sql`

- 17 tabelas (inclui gamificacao: conquistas, usuario_conquistas,
  reunioes, propostas_comerciais, treinamentos, producao_diaria,
  planos_pdca, checklists_equipe, notificacoes, auditoria_log,
  equipe_usuarios N:N)
- `periodo DATE`, `municipios.estado`
- RPC `sync_indicador_pec` usada pelo `pec-sync.py`
- **Ideias para features futuras**, nao implantadas ainda

## Regra

Ao aplicar migrations ou alterar schema, modificar APENAS o schema
ativo (`supabase/schema.sql` + `migrations/`). O schema alternativo
eh referencia de design apenas.
