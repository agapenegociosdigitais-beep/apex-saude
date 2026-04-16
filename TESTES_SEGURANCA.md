# 🧪 GUIA DE TESTES — 4 Melhorias de Segurança

## 🚀 Como Testar Rapidamente

### Setup Inicial
```bash
# 1. Abrir arquivo localmente OU hospedar em GitHub Pages
# 2. Abrir browser com console (F12)
```

---

## ✅ **1. HASH DE SENHAS**

### Teste 1a: Verificar que senha NÃO fica em plaintext

```
1. Abrir https://.../apex-landing.html
2. Clicar em "Cadastrar"
3. Preencher:
   - Nome: "Test User"
   - Email: "teste@seguranca.com"
   - Município: "São Paulo"
   - Plano: "Municipal"
   - Senha: "TestPass123"

4. Clicar "Criar conta"

5. Abrir DevTools (F12) → Application → LocalStorage
6. Procurar por "apex_users"
7. ✅ ESPERA: Verá "senha_hash": "abc123def456..." (HASH)
8. ❌ NOT OK: Se vir "senha": "TestPass123" (PLAINTEXT)
```

### Teste 1b: Login com senha correta

```
1. (Continuando...após criar conta)
2. Voltar para "Entrar" tab
3. Email: teste@seguranca.com
4. Senha: TestPass123
5. ✅ ESPERA: Login bem-sucedido, redireciona para dashboard
```

### Teste 1c: Login com senha errada

```
1. Voltar para login
2. Email: teste@seguranca.com
3. Senha: WrongPass123
4. ✅ ESPERA: Mensagem "E-mail ou senha incorretos"
5. ❌ NOT OK: Se deixar passar
```

### Teste 1d: Admin login (demo)

```
1. Email: admin@apex.com
2. Senha: apex2025
3. ✅ ESPERA: Redireciona para admin.html
```

---

## ✅ **2. XSS PROTECTION**

### Teste 2a: Validar que não aceita tags perigosas

```
1. Abrir console (F12)
2. Digitar:
   document.getElementById('mr-nome').value = "<script>alert('XSS')</script>"

3. Clicar "Criar conta"
4. ✅ ESPERA: Erro "Preencha todos os campos" (sanitizado)
5. ❌ NOT OK: Se permanecer o campo com <script>
```

### Teste 2b: User input é exibido seguro

```
1. Ao exibir nome do usuário no dashboard
2. Digitar nome: "João <img src=x onerror='alert(1)'>"
3. Salvar
4. ✅ ESPERA: Nome exibido como texto, sem executar script
5. ❌ NOT OK: Se alert() chamado
```

### Teste 2c: Security headers presentes

```
1. DevTools → Network → apex-landing.html
2. Abrir request → Headers
3. Procurar por:
   ✅ Content-Security-Policy
   ✅ Strict-Transport-Security
4. Se ambas presentes = ✓ OK
```

---

## ✅ **3. SESSION TIMEOUT (15 min inatividade)**

### Teste 3a: Session ativa com movimento

```
1. Fazer login em apex-saude.html
2. Verificar console (não deve ter erros)
3. ✅ ESPERA: Dashboard carrega sem problemas
```

### Teste 3b: Session reseta ao mexer

```
1. Após login, OBSERVE o relógio
2. Mover mouse/clicar botão
3. ✅ ESPERA: Console mostra timeout resetado
4. Repetir movimento a cada 10 minutos
5. ✅ ESPERA: Continua logado enquanto ativo
```

### Teste 3c: Logout automático após inatividade

⚠️ **Este teste leva 15 minutos**

```
1. Fazer login em apex-saude.html
2. NÃO fazer NADA por 15 minutos
   - Não mexer mouse
   - Não clicar nada
   - Não digitar nada
3. ✅ ESPERA: Após 15 min → Alert aparece
   "Sua sessão expirou por inatividade"
4. ✅ ESPERA: Redireciona para login
5. DevTools → LocalStorage: apex_session_start deletado

ALTERNATIVA = Editar timeout em security.js para 1 min (testes):
const INACTIVITY_TIMEOUT = 1 * 60 * 1000; // 1 minuto ao invés de 15
```

---

## ✅ **4. VALIDAÇÃO DE SENHA FORTE**

### Teste 4a: Senha fraca rejeitada

```
1. Abrir apex-landing.html → Cadastrar
2. Tentar senhas FRACAS:

a) "123456" (só números)
   ✅ ESPERA: ✗ Sem maiúsculas
   
b) "ABCDEF" (só maiúsculas)
   ✅ ESPERA: ✗ Sem números
   
c) "abc123" (6 caracteres)
   ✅ ESPERA: ✗ Muito curta (precisa 8+)
   
d) "pass word" (com espaço)
   ✅ ESPERA: ✗ Contém espaço
   
e) Clicar "Criar conta"
   ✅ ESPERA: Mensagem erro "Senha fraca"
```

### Teste 4b: Senha forte aceita

```
1. Voltar para cadastro
2. Tentar senha FORTE: "SecurePass123"
   ✅ ESPERA: Feedback em VERDE mostra:
      ✓ 8+ caracteres
      ✓ Maiúscula (S, P)
      ✓ Minúscula (ecure, ass)
      ✓ Número (123)
      ✓ Sem espaços

3. Completar formulário e criar conta
   ✅ ESPERA: "✓ Conta criada! Redirecionando..."
```

### Teste 4c: Feedback em tempo real

```
1. Campo senha vazio:
   ✅ ESPERA: Sem feedback

2. Digitar "a":
   ✅ ESPERA: Mostra ✗ (vermelho)
   
3. Digitar "Abc123456":
   ✅ ESPERA: Muda para ✓ (verde) com todas as regras marcadas
```

---

## 🎯 **Teste Completo (5 minutos)**

```
PASSO 1: Hash de Senhas (1 min)
─────────────────────────────
☐ Criar conta → Verificar localStorage (sem plaintext)
☐ Login sucesso com senha certa
☐ Login erro com senha errada

PASSO 2: Validação Senha (1 min)
───────────────────────────────
☐ Senha "abc123" → Rejeitada (fraca)
☐ Senha "Abc123456" → Aceita (forte)
☐ Feedback muda cor em tempo real

PASSO 3: XSS Protection (1 min)
──────────────────────────────
☐ Verificar security headers presentes (Network tab)
☐ Tentar injetar script → Não executa

PASSO 4: Session (2 min)
───────────────────────
☐ Fazer login → Funciona
☐ Mover mouse → Permanece logado
☐ (Opcional) Aguardar 15 min → Logout automático
```

---

## 🐛 **Se algo não funcionar...**

### Erro: "CryptoJS is not defined"
```
Solução: Verificar se crypto-js CDN carregou
  → DevTools → Console
  → Digitar: typeof CryptoJS
  → Se disser "undefined", o CDN não carregou
  → Verificar conexão HTTPS (CDN requer HTTPS)
```

### Erro: "security.js não encontrado"
```
Solução: Verificar que security.js está no mesmo diretório
  → apex-saude.html e security.js devem estar juntos
  → Se tiver em pasta diferente, atualizar path:
     <script src="path/to/security.js"></script>
```

### Timeout não funciona
```
Solução: Verificar console para erros
  → DevTools → Console
  → Procurar por erros vermelhos
  → Se há erro: Verificar que startInactivityMonitor() foi chamado em doLogin()
```

### Validação senha não funciona
```
Solução: Verificar se arquivo foi atualizado corretamente
  → Limpar cache browser (Ctrl+Shift+Del)
  → Reload a página (Ctrl+F5)
  → Se ainda não funciona, copiar código de novo
```

---

## ✅ **Checklist Final**

| Teste | Status | Notas |
|-------|--------|-------|
| Hash SHA-256 armazenado | ☐ | Verificar localStorage |
| Login com hash funciona | ☐ | Senha correta = sucesso |
| Senha fraca rejeitada | ☐ | Menos de 5 critérios |
| Senha forte aceita | ☐ | 5/5 critérios passam |
| XSS não executa script | ☐ | Tentar <script> tag |
| Security headers presentes | ☐ | Network tab headers |
| Logout após 15 min | ☐ | Opcional (longo teste) |
| Feedback tempo real | ☐ | Cores mudam ao digitar |

---

**Data:** 16 abril 2026  
**Versão:** 1.0 Security Patch  
✅ **Todos os 4 pontos testáveis localmente**
