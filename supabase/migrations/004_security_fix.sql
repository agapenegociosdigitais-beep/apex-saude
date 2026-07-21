-- ============================================
-- SECURITY FIX: RLS + auditoria + hardening
-- ============================================

-- 1. RLS em integracoes_pec (isolar por municipio)
DROP POLICY IF EXISTS "rls_integracoes" ON integracoes_pec;
CREATE POLICY "rls_integracoes" ON integracoes_pec FOR SELECT
  USING (municipio_id IN (SELECT municipio_id FROM usuarios WHERE id = auth.uid()));
ALTER TABLE integracoes_pec ENABLE ROW LEVEL SECURITY;

-- 2. RLS em indicadores (tabela de referencia - todo mundo pode ler)
DROP POLICY IF EXISTS "rls_indicadores" ON indicadores;
CREATE POLICY "rls_indicadores" ON indicadores FOR SELECT USING (true);
ALTER TABLE indicadores ENABLE ROW LEVEL SECURITY;

-- 3. RLS em checklists e conquistas
DROP POLICY IF EXISTS "rls_checklists" ON checklists_equipe;
CREATE POLICY "rls_checklists" ON checklists_equipe FOR SELECT
  USING (equipe_id IN (SELECT id FROM equipes WHERE municipio_id IN
    (SELECT municipio_id FROM usuarios WHERE id = auth.uid())));
ALTER TABLE checklists_equipe ENABLE ROW LEVEL SECURITY;

-- 4. Auditoria em integracoes_pec
CREATE TRIGGER audit_integracoes AFTER INSERT OR UPDATE OR DELETE ON integracoes_pec
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

-- 5. Auditoria em indicadores
CREATE TRIGGER audit_indicadores AFTER INSERT OR UPDATE OR DELETE ON indicadores
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

-- 6. Auditoria de login (registrar ultimo acesso do usuario)
CREATE OR REPLACE FUNCTION log_user_access() RETURNS trigger AS $$
BEGIN
  IF NEW.last_sign_in_at IS DISTINCT FROM OLD.last_sign_in_at AND NEW.last_sign_in_at IS NOT NULL THEN
    INSERT INTO auditoria_log (tabela, registro_id, acao, dados_novos, created_at)
    VALUES ('auth.users', NEW.id::text, 'LOGIN',
      jsonb_build_object('email', NEW.email, 'last_sign_in', NEW.last_sign_in_at), now());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Nota: trigger em auth.users nao funciona no Supabase (schema separado)
-- Login audit seria implementado via hook/API, nao trigger
DROP FUNCTION IF EXISTS log_user_access();
