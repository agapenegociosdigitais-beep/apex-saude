-- Migration 009: tabela pacientes para listas nominais (Fase 2.2)
-- Armazena dados individuais de pacientes vinculados a equipes,
-- com flags de condicoes cronicas e exames pendentes para busca ativa.
CREATE TABLE IF NOT EXISTS pacientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cns TEXT UNIQUE,
  nome TEXT NOT NULL,
  data_nascimento DATE,
  sexo TEXT,
  equipe_id UUID REFERENCES equipes(id) ON DELETE SET NULL,
  diabetico BOOLEAN DEFAULT false,
  hipertenso BOOLEAN DEFAULT false,
  gestante BOOLEAN DEFAULT false,
  crianca BOOLEAN DEFAULT false,
  idoso BOOLEAN DEFAULT false,
  hba1c_pendente BOOLEAN DEFAULT false,
  pa_pendente BOOLEAN DEFAULT false,
  colpocitologia_pendente BOOLEAN DEFAULT false,
  mamografia_pendente BOOLEAN DEFAULT false,
  odontologico_pendente BOOLEAN DEFAULT false,
  pre_natal_pendente BOOLEAN DEFAULT false,
  ultima_consulta DATE,
  telefone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pacientes_equipe ON pacientes(equipe_id);
CREATE INDEX IF NOT EXISTS idx_pacientes_hba1c ON pacientes(equipe_id) WHERE hba1c_pendente = true;
CREATE INDEX IF NOT EXISTS idx_pacientes_pa ON pacientes(equipe_id) WHERE pa_pendente = true;

ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pacientes_select" ON pacientes;
CREATE POLICY "pacientes_select" ON pacientes FOR SELECT USING (
  EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role IN ('admin','gestor','coordenador','profissional'))
);
