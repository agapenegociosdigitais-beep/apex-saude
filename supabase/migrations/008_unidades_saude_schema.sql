-- Migration 008: documenta a tabela unidades_saude (criada originalmente
-- via Supabase Dashboard, nunca versionada em SQL). Idempotente: usa
-- IF NOT EXISTS para nao quebrar em bancos onde a tabela ja existe.
--
-- A tabela armazena as Unidades Basicas de Saude (UBS) de cada municipio,
-- populadas via /api/integracao/pec/cnes (CNES/DATASUS) ou manualmente
-- pelo admin.
CREATE TABLE IF NOT EXISTS unidades_saude (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  municipio_id UUID NOT NULL REFERENCES municipios(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'ubs',      -- 'ubs', 'usf', 'upa', 'hospital'
  cnes TEXT,                              -- codigo CNES (7 digitos)
  endereco TEXT,
  bairro TEXT,
  cep TEXT,
  ativa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indices (idempotentes)
CREATE INDEX IF NOT EXISTS idx_unidades_municipio ON unidades_saude(municipio_id);
CREATE INDEX IF NOT EXISTS idx_unidades_tipo ON unidades_saude(tipo);
CREATE INDEX IF NOT EXISTS idx_unidades_ativa ON unidades_saude(ativa);

-- RLS: habilitar se ainda nao estiver
ALTER TABLE unidades_saude ENABLE ROW LEVEL SECURITY;

-- Policies basicas (idempotentes via DROP IF EXISTS)
DROP POLICY IF EXISTS "unidades_select" ON unidades_saude;
CREATE POLICY "unidades_select" ON unidades_saude
  FOR SELECT USING (true);  -- visivel para qualquer usuario autenticado

DROP POLICY IF EXISTS "unidades_admin_all" ON unidades_saude;
CREATE POLICY "unidades_admin_all" ON unidades_saude
  FOR ALL USING (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role IN ('admin','gestor'))
  );
