# ÁPEX Saúde — Setup Supabase

## Passo 1: Criar projeto no Supabase (2 minutos)

1. Acesse https://supabase.com/dashboard
2. Clique em **"New Project"**
3. Escolha sua organização
4. Nome do projeto: `apex-saude`
5. Database password: **guarde essa senha** (você vai precisar)
6. Region: `sa-east-1` (São Paulo) — mais próximo do Brasil
7. Clique em **"Create new project"**
8. Aguarde ~2 minutos

## Passo 2: Pegar as credenciais

Após criar, no dashboard do projeto:

1. Vá em **Project Settings** (engrenagem no menu lateral)
2. Clique em **API**
3. Copie:
   - **URL** (ex: `https://xxxxxxxx.supabase.co`)
   - **anon public** key (ex: `eyJhbGciOiJIUzI1NiIs...`)

## Passo 3: Rodar o schema

No dashboard do Supabase:

1. Vá em **SQL Editor** (menu lateral)
2. Clique em **"New query"**
3. Cole TODO o conteúdo do arquivo `supabase/schema.sql`
4. Clique em **"Run"**
5. Verifique se deu "Success" (deve criar 8 tabelas + RLS + funções)

## Passo 4: Rodar o seed de demonstração

1. No mesmo SQL Editor, cole o conteúdo de `supabase/seed-demo.sql`
2. Clique em **"Run"**
3. Isso insere valores mock para Belterra-PA (jul/2026)

## Passo 5: Configurar .env.local

Crie o arquivo `.env.local` na raiz do projeto:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

## Passo 6: Habilitar Magic Link (Auth)

No dashboard do Supabase:

1. Vá em **Authentication** → **Providers**
2. Ative **Email** (deixe "Confirm email" desabilitado para magic link puro)
3. Em **Email Templates** → **Magic Link**, você pode customizar o email
4. Em **URL Configuration**, adicione:
   - Site URL: `https://apex-saude-next.vercel.app` (produção)
   - Redirect URLs: `http://localhost:3000` (dev)

## Passo 7: Testar local

```bash
cd C:\Users\benja\apex-saude-next
npm run dev
```

Acesse `http://localhost:3000/login` e teste o magic link.

## Passo 8: Deploy Vercel com envs

```bash
vercel --prod --yes
```

Ou no dashboard da Vercel, adicione as env vars:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Troubleshooting

**Erro "relation does not exist"**
→ Você esqueceu de rodar o `schema.sql` antes do `seed-demo.sql`

**RLS bloqueando leitura**
→ Verifique se o usuário tem `role` preenchido em `usuarios` e está vinculado a um município

**Magic link não chega**
→ Verifique spam. Ou use a função "Send test email" no Supabase para validar.

**Build falha no Vercel**
→ Confirme que as env vars estão setadas no projeto Vercel (não só no .env.local)
