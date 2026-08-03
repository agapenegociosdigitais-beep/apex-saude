# Apex Saúde Next — Plano de Evolução v2

Criado em 03/08/2026. Baseado na auditoria completa de 16 páginas, 11 rotas
de API, schema do banco e pesquisa regulatória (NT 6/2025, Portaria GM/MS
3.493/2024, FAQ SAPS).

---

## Onde estamos

O Apex hoje é um **dashboard de percentuais com simulador financeiro**.
Mostra indicadores, calcula nota ISF, projeta repasse. Mas não diz **o que
fazer** com aquela informação. O gestor vê "58%" e pergunta "e agora?".

## O que os concorrentes entregam que a gente não entrega

- **Impulso Previne (Umane):** GRÁTIS. Listas nominais (quem são os
  pacientes com exame pendente), busca ativa, correção de cadastro.
- **Monitora APS:** Listas nominais, busca ativa, dashboards institucionais.
- **SIAPS/Gerencia APS (governo):** Portal oficial com dados em tempo real,
  acesso gratuito a qualquer município.

## Diferencial competitivo possível

Nenhum concorrente faz **projeção financeira + benchmarking + alertas
automáticos** no mesmo lugar. Se o Apex disser "Santarém está perdendo
R$ 142 mil/ano só no indicador C4 — aqui estão os 847 pacientes que
precisam de HbA1c" — isso fecha venda com prefeito.

---

## Fase 2.1 — Fundação (aqui → 2 semanas)

O que falta pra completar a migração mock → Supabase e ter o produto básico
100% funcional.

| # | O que | Estimativa |
|---|-------|-----------|
| 1 | Migrar `/dashboard/[perfil]` completo (substituir valorMock por dados reais da equipe do usuário) | 3h |
| 2 | Migrar `/ia` (motor PDCA usar dados reais em vez de mock) | 2h |
| 3 | Corrigir valores de repasse no simulador (usar R$ reais da portaria: ~R$ 6k/eq/mês, não R$ 38k) | 1h |
| 4 | Adicionar componente Fixo + Capitação Ponderada ao `/gerencial` (hoje só tem Qualidade) | 3h |
| 5 | Conectar seed de dados com números realistas de indicadores (usar distribuições do SISAB real) | 2h |
| 6 | Criar página `/equipes/[id]` — dashboard individual de uma equipe específica | 4h |

**Resultado:** Produto básico completo, 100% Supabase, valores de repasse
corretos conforme portaria.

---

## Fase 2.2 — Listas Nominais (2-3 semanas)

O QUE FAZ DIFERENÇA. Transforma o Apex de "dashboard bonito" em "ferramenta
de trabalho diário da equipe".

| # | O que | Estimativa |
|---|-------|-----------|
| 1 | Nova tabela `pacientes` no banco (CNS, nome, nascimento, equipe_id, ultima_consulta, exames_pendentes) | 2h |
| 2 | Seed de pacientes fictícios por equipe (distribuição realista por faixa etária, condição) | 2h |
| 3 | Rota `/api/integracao/pec/pacientes` — puxar dados de paciente do PEC Local | 4h |
| 4 | Nova página `/busca-ativa` — lista nominal com filtros (por indicador, por equipe, por UBS) | 6h |
| 5 | Nova página `/busca-ativa/[indicador]` — "847 diabéticos sem HbA1c" com nome, CNS, telefone, última consulta | 4h |
| 6 | Exportar lista nominal em PDF/CSV pra agente de saúde imprimir e ir a campo | 2h |
| 7 | IndicadorCard com botão "Ver lista nominal →" | 1h |

**Resultado:** O Apex faz o que o Impulso Previne faz, mas pago. A diferença
é que o Apex também mostra o IMPACTO FINANCEIRO da lista nominal ("resolver
esses 847 pacientes = +R$ 142 mil/ano").

---

## Fase 2.3 — Inteligência e Alertas (2 semanas)

Transforma o sistema de passivo ("você abre e vê") pra ativo ("o sistema te
avisa antes de dar merda").

| # | O que | Estimativa |
|---|-------|-----------|
| 1 | Tabela `alertas` (equipe_id, tipo, mensagem, lido, created_at) | 1h |
| 2 | Cron job na VPS: a cada 24h, calcula variação de cada indicador e gera alerta se queda >10% | 3h |
| 3 | Cron job: 3 dias antes do prazo SISAB, verifica equipes sem envio e alerta | 2h |
| 4 | Página `/alertas` — central de notificações do gestor | 3h |
| 5 | Badge vermelho no header "3 alertas" com contador | 1h |
| 6 | Email semanal automático pro gestor: "Resumo da semana — 2 indicadores caíram, 1 melhorou" | 3h |

**Resultado:** O sistema trabalha mesmo quando ninguém abre. Gestor recebe
email segunda de manhã com o que importa.

---

## Fase 3 — Diferenciais pesados (3-4 semanas)

O que nenhum concorrente tem e fecha venda.

| # | O que | Estimativa |
|---|-------|-----------|
| 1 | **Benchmarking:** comparar município vs média do estado, vs média nacional, vs municípios do mesmo porte | 6h |
| 2 | **Projeção personalizada:** "Se você melhorar C4 de 58% para 75%, seu repasse anual vai de R$ X para R$ Y (+R$ Z)" — por indicador, com slider interativo | 4h |
| 3 | **Relatório PDF automático** pro prefeito: 1 página com nota, repasse, comparação regional, top 3 ações | 4h |
| 4 | **WhatsApp/Telegram bot:** "Bom dia! Sua equipe eSF Centro tem 8 diabéticos com HbA1c vencida. Agende hoje." | 8h |
| 5 | **Landing page de vendas** integrada: simulação com dados reais do município (CNES público) antes mesmo de contratar | 6h |

---

## Prioridade de execução

```
AGORA → Fase 2.1 (terminar migração, valores corretos)
   ↓
DEPOIS → Fase 2.2 (listas nominais — o que vende)
   ↓
DEPOIS → Fase 2.3 (alertas — o que fideliza)
   ↓
FUTURO → Fase 3 (diferenciais — o que justifica preço premium)
```

## O que NÃO fazer

- Não adicionar gamificação (conquistas, badges) antes das listas nominais
- Não gastar tempo com IA/LLM antes dos alertas automáticos
- Não refinar design/CSS antes da Fase 2.2 funcionar
- Não tentar integrar WhatsApp antes do calendário SISAB
