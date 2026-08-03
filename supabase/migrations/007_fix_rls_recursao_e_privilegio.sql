-- Migration 007: corrige recursao infinita em RLS, escalonamento de
-- privilegio via user_metadata, corrupcao de auth.users.role, e visibilidade
-- de integracoes_pec para admin.
--
-- Contexto (auditoria 03/08/2026):
-- 1. Policies de `usuarios` faziam subquery direta em `usuarios` dentro da
--    propria policy -> "infinite recursion detected in policy for relation
--    usuarios" (42P17). Quebrava quase todo o REST API com anon/authenticated.
-- 2. A tentativa inicial de fix usou auth.jwt() -> user_metadata ->> role,
--    mas user_metadata e editavel pelo proprio usuario via
--    PUT /auth/v1/user (endpoint publico do Supabase Auth, sem senha extra).
--    Confirmado por exploit real: login como profissional, forjar
--    role=admin no metadata, ganhar acesso de leitura a tabela usuarios
--    inteira. Corrigido com funcao SECURITY DEFINER que le a tabela
--    `usuarios` (fonte de verdade), nao o JWT.
-- 3. auth.users.role (coluna interna do Postgres/PostgREST) estava com o
--    valor 'profissional' em vez de 'authenticated' para um usuario -- gerava
--    erro "role \"profissional\" does not exist" em qualquer query REST desse
--    usuario. Corrigido normalizando para 'authenticated'.
-- 4. integracoes_pec filtrava SEMPRE por municipio_id do usuario, sem
--    excecao para admin -- admin nao via integracoes de outros municipios.

BEGIN;

-- ============================================================
-- 1. Funcao SECURITY DEFINER: le a role da tabela usuarios sem
--    disparar as policies dela (evita recursao). Unica fonte de
--    verdade de role -- nunca confiar em auth.jwt()/user_metadata,
--    que o cliente pode editar.
-- ============================================================
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM usuarios WHERE id = auth.uid();
$$;

REVOKE ALL ON FUNCTION public.current_user_role() FROM public;
GRANT EXECUTE ON FUNCTION public.current_user_role() TO authenticated, anon;

-- ============================================================
-- 2. usuarios: substitui subquery recursiva / JWT por current_user_role()
-- ============================================================
DROP POLICY IF EXISTS usuarios_admin_all ON usuarios;
DROP POLICY IF EXISTS usuarios_select_self_admin ON usuarios;

CREATE POLICY usuarios_admin_all ON usuarios
FOR ALL
USING (public.current_user_role() = 'admin' OR id = auth.uid());

CREATE POLICY usuarios_select_self_admin ON usuarios
FOR SELECT
USING (id = auth.uid() OR public.current_user_role() = 'admin');

-- ============================================================
-- 3. integracoes_pec: admin ve todos os municipios, nao so o proprio
-- ============================================================
DROP POLICY IF EXISTS rls_integracoes ON integracoes_pec;

CREATE POLICY rls_integracoes ON integracoes_pec
FOR SELECT
USING (
  public.current_user_role() = 'admin'
  OR municipio_id IN (SELECT usuarios.municipio_id FROM usuarios WHERE usuarios.id = auth.uid())
);

-- ============================================================
-- 4. Normaliza auth.users.role -- deve ser SEMPRE 'authenticated'
--    para usuarios comuns. Nunca gravar o cargo da aplicacao
--    (admin/gestor/coordenador/profissional) nesta coluna --
--    isso e responsabilidade exclusiva de public.usuarios.role.
-- ============================================================
UPDATE auth.users SET role = 'authenticated' WHERE role != 'authenticated';

COMMIT;
