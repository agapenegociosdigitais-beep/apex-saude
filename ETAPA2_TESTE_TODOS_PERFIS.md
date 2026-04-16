# 🧪 ETAPA 2: TESTE COMPLETO — TODOS OS 12 PERFIS

**Data:** 16 de abril de 2026  
**Status:** ✅ Pronto para validação em produção  
**Escopo:** Validar arquitetura genérica para Médico, Enfermeiro, Técnico, ACS, Psicólogo, Fisioterapeuta, Nutricionista, Assistente Social, Farmacêutico, Dentista, Coordenador, Gestor

---

## 📋 ROTEIRO DE TESTES RÁPIDO

### **TESTE 1: Abrir Painel e Selecionar Cada Perfil**

```
1. Abrir dashboard-profissional.html
2. Verificar que todos os 12 perfis aparecem nos cards
3. ✅ ESPERADO: Cards com ícones corretos:
   - 👨‍⚕️ Médico (eSF/eAP)
   - 👩‍⚕️ Enfermeiro (eSF/eAP)
   - 🩺 Técnico de Enfermagem (eSF/eAP)
   - 🏘️ ACS (eSF/eAP)
   - 🧠 Psicólogo (eMulti)
   - 🏃 Fisioterapeuta (eMulti)
   - 🥗 Nutricionista (eMulti)
   - 🤝 Assistente Social (eMulti)
   - 💊 Farmacêutico (eMulti)
   - 🦷 Dentista (eSB)
   - 📋 Coordenador (Gestão)
   - 🏛️ Gestor (Gestão)

4. Para CADA perfil:
   a. Clicar no card
   b. Clicar "Acessar meu dashboard →"
   c. ✅ ESPERADO: Dashboard carrega com avatar, nome e equipe corretos
   d. Voltar e tentar outro perfil
```

---

## 🎯 TESTES POR GRUPO

### **GRUPO eSF/eAP — 4 PERFIS**

#### **TESTE 2: MÉDICO — Indicadores C4-C7 com Peso 2 em C7**

```
1. Selecionar Médico
2. Verificar indicadores: C4, C5, C6, C7
3. ✅ ESPERADO: C7 tem "×2" (peso 2), outros "×1"

TESTE: Digitar metrícs
   - C4 (Diabetes): 85 → VERDE
   - C5 (Pressão): 70 → AMARELO
   - C6 (Idoso): 92 → VERDE
   - C7 (Câncer): 50 → VERMELHO (CRÍTICO)

4. ✅ ESPERADO: Alerta 🔴 CRÍTICO aparece por C7 < 60
5. ✅ ESPERADO: Alertas sobre HbA1c e PA aparecem se < 60
6. Preencher "Registro Rápido":
   - Consultas diabéticos: 5
   - Consultas hipertensos: 8
   - Solicitações colpocitologia: 2
   - Solicitações mamografia: 1
   - Avaliações geriátricas: 3
   - Planos atualizados: 6
   
7. ✅ ESPERADO: Valores acumulam em "Total acumulado neste mês"
8. ✅ ESPERADO: localStorage tem "apex_dash_medico_metricas" e "apex_prod_medico_YYYY-MM-DD"
```

---

#### **TESTE 3: ENFERMEIRO — Indicadores C2, C3 com Peso 2**

```
1. Selecionar Enfermeiro
2. Verificar indicadores: C2 (Desenvolvimento infantil), C3 (Gestação), C1, Comp.II
3. ✅ ESPERADO: C2 e C3 têm "×2"

TESTE: Digitar métricas
   - C2: 45 → VERMELHO (CRÍTICO)
   - C3: 72 → AMARELO
   - C1: 88 → VERDE

4. ✅ ESPERADO: Alertas vermelhos aparecem para C2 e C3 < 60
5. Preencher "Registro Rápido":
   - Pré-natal: 3
   - Puericultura: 7
   - Puerpério: 2
   - Citopatológicos: 4
   - Registros supervisionados: 5
   
6. ✅ ESPERADO: localStorage tem "apex_dash_enfermeiro_metricas"
```

---

#### **TESTE 4: TÉCNICO — Alimenta C4, C5, C6**

```
1. Selecionar Técnico
2. Verificar indicadores: C5 (PA), C4 (Glicemia), C6 (Vacinação)
3. ✅ ESPERADO: Nenhum peso mostrado (técnico é suporte)

TESTE: Digitar métricas
   - PA (C5): 88 → VERDE
   - Glicemia (C4): 65 → AMARELO
   - Vacinação (C6): 92 → VERDE

4. ✅ ESPERADO: Alerta permanente: "Procedimento sem registro = ZERO"
5. ✅ ESPERADO: Alerta sobre procedimentos pendentes
6. Preencher registro:
   - Aferições PA: 12
   - Glicemias: 8
   - Vacinas: 5
   - Curativos: 2
   
7. ✅ ESPERADO: Dados salvos em localStorage
```

---

#### **TESTE 5: ACS — Dimensão Cadastro + Acompanhamento**

```
1. Selecionar ACS
2. Verificar indicadores: Cadastro, Acompanhamento, C1 (Acesso), Busca Ativa
3. ✅ ESPERADO: Indicadores ajustados para ACS

TESTE: Digitar métricas
   - Cadastros: 75 → AMARELO
   - Visitas: 82 → VERDE
   - Faltosos: 60 → AMARELO

4. ✅ ESPERADO: Alerta: "Tentativa de visita TAMBÉM conta"
5. ✅ ESPERADO: Se sync = 0, alerta vermelho "Sincronize app"
6. Preencher registro:
   - Visitas: 8
   - Cadastros atualizados: 3
   - Gestantes identificadas: 1
   - Crianças < 2 anos: 2
   - Faltosos (busca ativa): 2
   
7. ✅ ESPERADO: localStorage atualizado
```

---

### **GRUPO eMulti — 5 PERFIS**

#### **TESTE 6: PSICÓLOGO — M1 (Peso 6) + M2 (Peso 4)**

```
1. Selecionar Psicólogo
2. Verificar indicadores: M1 ×6, M2 ×4
3. ✅ ESPERADO: Pesos corretos

TESTE: Digitar métricas
   - M1: 55 → AMARELO
   - M2: 72 → AMARELO

4. ✅ ESPERADO: Alerta sobre M2 ser interprofissional
5. Preencher registro:
   - Atendimentos individuais: 6
   - Participantes em grupo: 10
   - Matriciamentos: 2
   - PTS documentados: 3
   - Visitas domiciliares: 1
   
6. ✅ ESPERADO: M1 = atendimentos + grupo, acumula corretamente
```

---

#### **TESTE 7: FISIOTERAPEUTA — M1 + M2**

```
1. Selecionar Fisioterapeuta
2. Verificar: M1 ×6, M2 ×4
3. ✅ ESPERADO: Alerta: "Grupos reabilitação = múltiplos atendimentos"

TESTE: Preencher registro
   - Atendimentos individuais: 4
   - Participantes grupo reabilitação: 15 (cada = 1 atendimento)
   - Visitas domiciliares: 2
   - Atendimentos compartilhados: 3
   
4. ✅ ESPERADO: Acúmulo correto em localStorage
```

---

#### **TESTE 8: NUTRICIONISTA — M1, M2, contribui C3/C4/C5**

```
1. Selecionar Nutricionista
2. Verificar: M1 ×6, M2 ×4, Contribui C3/C4/C5
3. ✅ ESPERADO: Alerta: "Grupo alimentação = cada participante é 1 atendimento"

TESTE: Preencher registro
   - Consultas nutricionais: 5
   - Participantes grupo alimentação: 8
   - Pré-natal nutricional: 1
   - Atividades educativas coletivas: 12
   
4. ✅ ESPERADO: Dados salvos
```

---

#### **TESTE 9: ASSISTENTE SOCIAL — M1, M2 (ações intersetoriais)**

```
1. Selecionar Assistente Social
2. Verificar: M1 ×6, M2 ×4
3. ✅ ESPERADO: Alerta: "Articulações CRAS/CREAS = M2"

TESTE: Preencher registro
   - Atendimentos individuais: 7
   - Articulações intersetoriais: 4
   - Reuniões de rede: 2
   - Encaminhamentos: 5
   
4. ✅ ESPERADO: localStorage atualizado
```

---

#### **TESTE 10: FARMACÊUTICO — M1, M2, contribui C4/C5**

```
1. Selecionar Farmacêutico
2. Verificar: M1 ×6, M2 ×4, Contribui C4/C5
3. ✅ ESPERADO: Alerta: "Discussões com médico = M2"

TESTE: Preencher registro
   - Consultas farmacêuticas: 6
   - Revisões polifarmácia: 3
   - Casos com médico: 2
   - Grupos uso racional: 10
   
4. ✅ ESPERADO: Dados salvos em localStorage
```

---

### **eSB — 1 PERFIL**

#### **TESTE 11: DENTISTA — B1-B6 com B3 Invertido**

```
1. Selecionar Dentista
2. ✅ ESPERADO: B3 tem lógica invertida: Verde (≤15%), Amarelo (16-25%), Vermelho (>25%)

TESTE: Digitar métricas
   - B1 (1ªs consultas): 82 → VERDE
   - B2 (Tratamentos): 95 → VERDE
   - B3 (Taxa extração): 12 → VERDE (INVERTIDO = BOM)
   - B4 (Preventivos): 88 → VERDE

3. ✅ ESPERADO: Se B3 > 25%, aparece alerta CRÍTICO
4. ✅ ESPERADO: Se todos ≥ 80% e B3 ≤ 15%, aparece "EXCELENTE"
5. Preencher registro:
   - 1ªs consultas: 4
   - Tratamentos: 3
   - Extrações: 1
   - Preventivos: 5
   - Escovação: 6
   - TRA: 0
   
6. ✅ ESPERADO: Total do mês acumula corretamente
```

---

### **GESTÃO — 2 PERFIS**

#### **TESTE 12: COORDENADOR — Visão Consolidada de Todos**

```
1. Selecionar Coordenador
2. ✅ ESPERADO: Dashboard especial com:
   - Lista de profissionais
   - Calendário crítico (dias 1-10)
   - Simulador de classificação
   - Status consolidado

3. ✅ ESPERADO: Não permite editar métricas (apenas visualiza)
4. ✅ ESPERADO: Link funciona para "Treinamento"
```

---

#### **TESTE 13: GESTOR — Visão Municipal**

```
1. Selecionar Gestor
2. ✅ ESPERADO: Dashboard com:
   - Total de equipes
   - Equipes em Ótimo
   - Equipes em Regular
   - Repasse estimado

3. ✅ ESPERADO: Alerta: "Equipe em Regular = perde 75% do repasse"
4. ✅ ESPERADO: Dados consolidados
```

---

## 🔄 TESTES DE INTEGRAÇÃO

### **TESTE 14: Link Bidirecional Treinamento**

```
Para CADA perfil com config (Médico, Enfermeiro, Técnico, ACS, eMulti×5, Dentista):

1. Clicar "📚 Treinamento Completo →"
2. ✅ ESPERADO: Abre treinamento.html?perfil={id}
3. ✅ ESPERADO: Perfil já está pré-selecionado
4. Voltar ao dashboard
5. ✅ ESPERADO: Perfil continua ativo
```

---

### **TESTE 15: Persistência localStorage — Todos os Perfis**

```
1. Abrir DevTools (F12) → Application → LocalStorage
2. Para CADA perfil testado, verificar:
   - apex_dash_{perfilId}_metricas ← Métricas do mês
   - apex_prod_{perfilId}_YYYY-MM-DD ← Produção diária
   - apex_ck_{perfilId} ← Checklist

EXEMPLO para Médico após testes:
   apex_dash_medico_metricas: {"c4":85,"c5":70,"c6":92,"c7":50}
   apex_prod_medico_2026-04-16: {"c4":5,"c5":8,"c7_1":2,"c7_2":1,"c6":3,"plano":6}
   apex_ck_medico: [0,2,4]

3. ✅ ESPERADO: Todos os dados persistem após recarregar (F5)
```

---

### **TESTE 16: Semáforos Dinâmicos Todos os Perfis**

```
Para CADA perfil:

1. Digitar valor em métrica 1 na faixa VERDE (>=80%)
   ✅ ESPERADO: Cor vira VERDE

2. Digitar valor em métrica 2 na faixa AMARELA (60-79%)
   ✅ ESPERADO: Cor vira AMARELO

3. Digitar valor em métrica 3 na faixa VERMELHA (<60%)
   ✅ ESPERADO: Cor vira VERMELHO

4. ✅ ESPERADO: Cores mudam INSTANTANEAMENTE ao perder foco do input

EXCEÇÃO - Dentista B3 (INVERTIDO):
   - Digite B3 = 35: VERMELHO (muito alto)
   - Digite B3 = 20: AMARELO (médio)
   - Digite B3 = 10: VERDE (baixo = bom)
```

---

### **TESTE 17: Alertas Dinâmicos — Aparecem/Desaparecem**

```
CENÁRIO A: Nenhuma métrica preenchida
   ✅ ESPERADO: Alertas padrão aparecem

CENÁRIO B: Médico com C7 < 60
   ✅ ESPERADO: Alerta vermelho "CRÍTICO: C7 tem Peso 2..."

CENÁRIO C: Enfermeiro com C2 < 60 E C3 < 60
   ✅ ESPERADO: Dois alertas vermelhos aparecem

CENÁRIO D: Técnico sempre
   ✅ ESPERADO: Alerta permanente "Procedimento sem registro = ZERO"

CENÁRIO E: ACS com sync = 0
   ✅ ESPERADO: Alerta "Sincronize o app"

CENÁRIO F: Todos indicadores >= 80% (Médico/Enfermeiro/Dentista)
   ✅ ESPERADO: Alerta verde "EXCELENTE/PARABÉNS" aparece
```

---

### **TESTE 18: Checklist Persistente Todos Perfis**

```
1. Para CADA perfil:
   a. Marcar 3 items do checklist
   b. ✅ ESPERADO: Items ficam verdes com ✓
   c. ✅ ESPERADO: Progress bar atualiza
   d. Recarregar página (F5)
   e. ✅ ESPERADO: Items continuam marcados
   f. Desmarcar 1 item
   g. ✅ ESPERADO: Progress bar diminui
```

---

## ✅ CHECKLIST FINAL DE VALIDAÇÃO

### **Arquitetura Genérica**
- [ ] Todos os 12 perfis carregam sem erro
- [ ] perfilConfigs() contém todos os 11 perfis com config + Dentista
- [ ] Cada perfil tem: metricas, calcularIndicadores(), gerarAlertas(), renderRegistroDiario()
- [ ] Funções genéricas funcionam: calcularIndicadores(id), gerarAlertas(id), renderRegistroDiario(id)

### **Renderização**
- [ ] Dashboard renderiza corretamente para cada perfil
- [ ] Avatar, nome e equipe aparecem corretos
- [ ] Indicadores com pesos corretos (×1, ×2, ×4, ×6)
- [ ] Semáforos em 0 = neutro (ouro)

### **Métricas Editáveis**
- [ ] Cada perfil pode editar suas métricas
- [ ] Valores salvam ao perder foco (onchange)
- [ ] Cores atualizam dinamicamente
- [ ] B3 Dentista tem lógica invertida

### **Registros Diários**
- [ ] Cada perfil tem formulário com seus inputs específicos
- [ ] Botão "Salvar Produção" funciona
- [ ] Valores acumulam no total do mês
- [ ] localStorage tem apex_prod_{id}_data

### **Alertas**
- [ ] Alertas dinâmicos aparecem/desaparecem baseados em valores
- [ ] Cada perfil tem alertas contextualizados
- [ ] Técnico tem alerta permanente

### **localStorage**
- [ ] 3 keys criadas por perfil: dash, prod, checklist
- [ ] Dados persistem após recarregar (F5)
- [ ] Checklist salva lista de índices marcados

### **Treinamento**
- [ ] Link "Treinamento Completo" aparece para perfis com config
- [ ] URL com ?perfil={id} carrega perfil correto
- [ ] Link bidirecional funciona

### **UI/UX**
- [ ] Sem breaking changes na estrutura existente
- [ ] Design dark mode mantido
- [ ] Responsivo em mobile
- [ ] Toasts aparecem ao salvar

### **Código**
- [ ] 100% vanilla JavaScript
- [ ] Sem dependências externas (além crypto-js)
- [ ] Sem erros no console (F12)
- [ ] Sem memory leaks

---

## 🎯 PERFORMANCE DE TESTE

**Tempo esperado:** ~30 min (3 min/perfil)
- 5 min: Navegação e seleção
- 3 min × 12 perfis: Testes básicos por perfil
- 5 min: Integração localStorage
- 5 min: Alertas e semáforos

---

## 📊 RESULTADO ESPERADO

```
✅ Todos os 12 perfis funcionais
✅ Arquitetura genérica validada
✅ localStorage 100% operacional
✅ Alertas dinâmicos inteligentes
✅ Treinamento links funcionando
✅ Sem erros de JavaScript
✅ Pronto para ETAPA 3 (Integração com IA)
```

---

**Status:** 🟢 **PRONTO PARA TESTES COMPLETOS**  
**Próximo:** ETAPA 3 — Integração com IA (ia-profissional.html)  
**Arquivos Modificados:** dashboard-profissional.html (+1000 linhas, genérica completa)  
**Commits:** 1 (ETAPA 2 — 12 perfis implementados)

