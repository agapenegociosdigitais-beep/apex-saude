-- Fix auditoria triggers (estavam quebrados sem SECURITY DEFINER)
DROP TRIGGER IF EXISTS audit_equipes ON equipes;
DROP TRIGGER IF EXISTS audit_unidades ON unidades_saude;
DROP TRIGGER IF EXISTS audit_municipios ON municipios;
DROP TRIGGER IF EXISTS audit_usuarios ON usuarios;
DROP TRIGGER IF EXISTS audit_integracoes ON integracoes_pec;
DROP TRIGGER IF EXISTS audit_indicadores ON indicadores;

-- Recriar com SECURITY DEFINER
CREATE OR REPLACE FUNCTION audit_trigger() RETURNS trigger AS $$
BEGIN
  INSERT INTO public.auditoria_log (tabela, registro_id, acao, dados_novos, created_at)
  VALUES (TG_TABLE_NAME, COALESCE(NEW.id, OLD.id)::text, TG_OP, 
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(NEW) END, now());
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_equipes AFTER INSERT OR UPDATE OR DELETE ON equipes FOR EACH ROW EXECUTE FUNCTION audit_trigger();
CREATE TRIGGER audit_unidades AFTER INSERT OR UPDATE OR DELETE ON unidades_saude FOR EACH ROW EXECUTE FUNCTION audit_trigger();
CREATE TRIGGER audit_municipios AFTER INSERT OR UPDATE OR DELETE ON municipios FOR EACH ROW EXECUTE FUNCTION audit_trigger();
CREATE TRIGGER audit_usuarios AFTER INSERT OR UPDATE OR DELETE ON usuarios FOR EACH ROW EXECUTE FUNCTION audit_trigger();
CREATE TRIGGER audit_integracoes AFTER INSERT OR UPDATE OR DELETE ON integracoes_pec FOR EACH ROW EXECUTE FUNCTION audit_trigger();
CREATE TRIGGER audit_indicadores AFTER INSERT OR UPDATE OR DELETE ON indicadores FOR EACH ROW EXECUTE FUNCTION audit_trigger();
