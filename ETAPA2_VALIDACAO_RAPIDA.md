# ⚡ ETAPA 2 — VALIDAÇÃO RÁPIDA

**Objetivo:** Validar rapidamente que a arquitetura genérica está FUNCIONANDO para os 12 perfis.

**Tempo:** ~5 minutos

---

## 🎯 TESTE RÁPIDO DE VALIDAÇÃO

### **PASSO 1: Abrir Dashboard**

```bash
# Abrir no navegador:
file:///c/Users/benja/AppData/Local/Temp/apex-saude/dashboard-profissional.html
```

---

### **PASSO 2: Testar Cada Perfil (2-3 segundos por perfil)**

**MÉDICO** 👨‍⚕️
```
✅ Selecionar → Acessar
✅ Verificar indicadores: C4, C5, C6, C7 com ×1, ×1, ×1, ×2
✅ Digitar C7 = 50 → Deve ficar VERMELHO
✅ Digitar C4 = 85 → Deve ficar VERDE
✅ Preencher registro: c4=3, c5=5, c6=2, c7=1
✅ Clicar "Salvar Produção" → Toast "✓ Produção do dia salva!"
✅ localStorage deve ter: apex_dash_medico_metricas com {c4:85,c5:0,c6:0,c7:50}
✅ Voltar
```

**ENFERMEIRO** 👩‍⚕️
```
✅ Selecionar → Acessar
✅ Verificar C2, C3 com ×2 (peso alto)
✅ Digitar C2 = 45 → VERMELHO, alerta crítico
✅ Preencher registro → Salvar
✅ localStorage atualizado
✅ Voltar
```

**TÉCNICO** 🩺
```
✅ Selecionar → Acessar
✅ Verificar: C5 (PA), C4 (Glicemia), C6 (Vacinação)
✅ Alerta permanente: "Procedimento sem registro = ZERO"
✅ Preencher registro → Salvar
✅ localStorage atualizado
✅ Voltar
```

**ACS** 🏘️
```
✅ Selecionar → Acessar
✅ Verificar indicadores
✅ Alerta: "Tentativa de visita TAMBÉM conta"
✅ Preencher registro → Salvar
✅ localStorage atualizado
✅ Voltar
```

**PSICÓLOGO** 🧠
```
✅ Selecionar → Acessar
✅ Verificar M1 ×6, M2 ×4
✅ Preencher registro → Salvar
✅ localStorage atualizado
✅ Link "Treinamento Completo" funciona
✅ Voltar
```

**FISIOTERAPEUTA** 🏃
```
✅ Selecionar → Acessar
✅ Verificar M1 ×6, M2 ×4
✅ Alerta: "Grupos reabilitação = múltiplos atendimentos"
✅ Preencher registro → Salvar
✅ localStorage atualizado
✅ Voltar
```

**NUTRICIONISTA** 🥗
```
✅ Selecionar → Acessar
✅ Verificar M1 ×6, M2 ×4
✅ Alerta: "Cada participante grupo = 1 atendimento"
✅ Preencher registro → Salvar
✅ localStorage atualizado
✅ Voltar
```

**ASSISTENTE SOCIAL** 🤝
```
✅ Selecionar → Acessar
✅ Verificar M1 ×6, M2 ×4
✅ Alerta: "Articulações CRAS/CREAS = M2"
✅ Preencher registro → Salvar
✅ localStorage atualizado
✅ Voltar
```

**FARMACÊUTICO** 💊
```
✅ Selecionar → Acessar
✅ Verificar M1 ×6, M2 ×4, Contribui C4/C5
✅ Alerta: "Discussões com médico = M2"
✅ Preencher registro → Salvar
✅ localStorage atualizado
✅ Voltar
```

**DENTISTA** 🦷
```
✅ Selecionar → Acessar
✅ Verificar B1-B6 com B3 INVERTIDO
✅ Digitar B3 = 30 → VERMELHO (invertido: alto = ruim)
✅ Digitar B3 = 10 → VERDE (invertido: baixo = bom)
✅ Preencher registro → Salvar
✅ localStorage atualizado
✅ Histórico 7 dias aparece
✅ Total mês acumula
✅ Voltar
```

**COORDENADOR** 📋
```
✅ Selecionar → Acessar
✅ Verificar dashboard especial (sem editar métricas)
✅ Calendário crítico, simulador aparecem
✅ Voltar
```

**GESTOR** 🏛️
```
✅ Selecionar → Acessar
✅ Verificar dashboard com totais de equipes
✅ Alerta: "Equipe em Regular = perde 75%"
✅ Voltar
```

---

## 🔍 VALIDAÇÃO DevTools

```
Abrir DevTools (F12) → Application → LocalStorage
```

**Após testes, deve haver:**

```
apex_dash_medico_metricas: {"c4":85,"c5":0,"c6":0,"c7":50}
apex_prod_medico_2026-04-16: {"c4":3,"c5":5,"c6":2,"c7":1}
apex_dash_enfermeiro_metricas: { ... }
apex_prod_enfermeiro_2026-04-16: { ... }
apex_dash_tecnico_metricas: { ... }
... (todos os 12 perfis com dados)
```

✅ Se tudo estiver aqui, **ETAPA 2 FUNCIONA 100%**

---

## ✅ CHECKLIST RÁPIDO

- [ ] Todos os 12 perfis carregam sem erro
- [ ] Indicadores aparecem com cores dinâmicas
- [ ] Semáforos mudam ao editar métricas
- [ ] Registros diários salvam
- [ ] localStorage salva dados corretamente
- [ ] Alertas aparecem/desaparecem
- [ ] Nenhum erro no console (F12)
- [ ] Treinamento links funcionam (para perfis com config)

---

## 🎯 RESULTADO

```
✅ Se todos os 12 perfis passarem → ETAPA 2 COMPLETA E VALIDADA
❌ Se algum perfil falhar → Corrigir isso e re-testar
```

---

**Tempo:** ~5 minutos  
**Status:** Pronto para validação

