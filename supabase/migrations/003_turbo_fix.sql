-- ============================================
-- TURBO FIX: RLS + auditoria
-- ============================================

-- 1. RLS: usuario ve so dados da sua cidade
-- (admin usa service_role nas APIs, burla RLS)

CREATE POLICY "rls_municipios" ON municipios FOR SELECT
  USING (id IN (SELECT municipio_id FROM usuarios WHERE id = auth.uid()));

CREATE POLICY "rls_unidades" ON unidades_saude FOR SELECT
  USING (municipio_id IN (SELECT municipio_id FROM usuarios WHERE id = auth.uid()));

CREATE POLICY "rls_equipes" ON equipes FOR SELECT
  USING (municipio_id IN (SELECT municipio_id FROM usuarios WHERE id = auth.uid()));

CREATE POLICY "rls_valores" ON valores_indicadores FOR SELECT
  USING (equipe_id IN (SELECT id FROM equipes WHERE municipio_id IN (SELECT municipio_id FROM usuarios WHERE id = auth.uid())));

ALTER TABLE municipios ENABLE ROW LEVEL SECURITY;
ALTER TABLE unidades_saude ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE valores_indicadores ENABLE ROW LEVEL SECURITY;

-- 2. Auditoria automatica
CREATE OR REPLACE FUNCTION audit_trigger() RETURNS trigger AS $$
BEGIN
  INSERT INTO auditoria_log (tabela, registro_id, acao, dados_novos, created_at)
  VALUES (TG_TABLE_NAME, COALESCE(NEW.id, OLD.id)::text, TG_OP, 
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(NEW) END, now());
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_municipios AFTER INSERT OR UPDATE OR DELETE ON municipios FOR EACH ROW EXECUTE FUNCTION audit_trigger();
CREATE TRIGGER audit_unidades   AFTER INSERT OR UPDATE OR DELETE ON unidades_saude FOR EACH ROW EXECUTE FUNCTION audit_trigger();
CREATE TRIGGER audit_equipes    AFTER INSERT OR UPDATE OR DELETE ON equipes FOR EACH ROW EXECUTE FUNCTION audit_trigger();
CREATE TRIGGER audit_usuarios   AFTER INSERT OR UPDATE OR DELETE ON usuarios FOR EACH ROW EXECUTE FUNCTION audit_trigger();
