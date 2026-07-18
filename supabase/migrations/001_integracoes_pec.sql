-- ============================================
-- MIGRACAO 001: Tabela integracoes_pec
-- Suporte a leitura direta do PEC Local
-- ============================================

-- Tabela de configuracao de integracao com PEC
CREATE TABLE IF NOT EXISTS integracoes_pec (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio_id UUID NOT NULL REFERENCES municipios(id) UNIQUE,
  
  -- Tipo de conexao
  tipo TEXT NOT NULL DEFAULT 'pec_local'
    CHECK (tipo IN ('pec_local', 'pec_cloud', 'sisaps', 'arquivo')),
  
  -- Conexao PEC Local (PostgreSQL)
  host TEXT,
  porta INTEGER DEFAULT 5432,
  database TEXT DEFAULT 'esus',
  usuario TEXT,
  senha TEXT,  -- sera criptografada com pgsodium no futuro
  ssl BOOLEAN DEFAULT false,
  
  -- Configuracao de sincronizacao
  ativo BOOLEAN DEFAULT false,
  sincronizar_automatico BOOLEAN DEFAULT true,
  frequencia_minutos INTEGER DEFAULT 1440,  -- 24h
  
  -- Status
  ultima_sincronizacao TIMESTAMPTZ,
  status_sincronizacao TEXT DEFAULT 'pendente'
    CHECK (status_sincronizacao IN ('ok', 'falha', 'pendente', 'rodando')),
  erro_ultima TEXT,
  
  -- Metadados
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger para updated_at automatico
CREATE OR REPLACE FUNCTION trigger_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplica trigger em integracoes_pec
DROP TRIGGER IF EXISTS trg_integracoes_pec_updated_at ON integracoes_pec;
CREATE TRIGGER trg_integracoes_pec_updated_at
  BEFORE UPDATE ON integracoes_pec
  FOR EACH ROW EXECUTE FUNCTION trigger_updated_at();

-- Aplica trigger em municipios (se nao existir)
DROP TRIGGER IF EXISTS trg_municipios_updated_at ON municipios;
CREATE TRIGGER trg_municipios_updated_at
  BEFORE UPDATE ON municipios
  FOR EACH ROW EXECUTE FUNCTION trigger_updated_at();

-- Aplica trigger em equipes (se nao existir)
DROP TRIGGER IF EXISTS trg_equipes_updated_at ON equipes;
CREATE TRIGGER trg_equipes_updated_at
  BEFORE UPDATE ON equipes
  FOR EACH ROW EXECUTE FUNCTION trigger_updated_at();

-- Aplica trigger em usuarios (se nao existir)
DROP TRIGGER IF EXISTS trg_usuarios_updated_at ON usuarios;
CREATE TRIGGER trg_usuarios_updated_at
  BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION trigger_updated_at();

-- Aplica trigger em planos_pdca (se nao existir)
DROP TRIGGER IF EXISTS trg_planos_pdca_updated_at ON planos_pdca;
CREATE TRIGGER trg_planos_pdca_updated_at
  BEFORE UPDATE ON planos_pdca
  FOR EACH ROW EXECUTE FUNCTION trigger_updated_at();

-- Aplica trigger em checklists_equipe (se nao existir)
DROP TRIGGER IF EXISTS trg_checklists_updated_at ON checklists_equipe;
CREATE TRIGGER trg_checklists_updated_at
  BEFORE UPDATE ON checklists_equipe
  FOR EACH ROW EXECUTE FUNCTION trigger_updated_at();

-- RLS: so admin/gestor do municipio pode ver/configurar
ALTER TABLE integracoes_pec ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_gestor_municipio" ON integracoes_pec
  FOR ALL USING (
    municipio_id = (
      SELECT municipio_id FROM usuarios WHERE id = auth.uid()
    )
    AND (
      SELECT role FROM usuarios WHERE id = auth.uid()
    ) IN ('gestor', 'admin')
  );

-- Index para busca rapida
CREATE INDEX IF NOT EXISTS idx_integracoes_pec_municipio ON integracoes_pec(municipio_id);
CREATE INDEX IF NOT EXISTS idx_integracoes_pec_status ON integracoes_pec(status_sincronizacao);

COMMENT ON TABLE integracoes_pec IS 'Configuracao de integracao com PEC Local (PostgreSQL) por municipio';
COMMENT ON COLUMN integracoes_pec.senha IS 'Senha do usuario read-only no PostgreSQL do PEC - CRIPTOGRAFAR com pgsodium';
