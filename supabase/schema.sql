-- ═══════════════════════════════════════════════════════════════
-- ÁPEX Saúde — Schema Supabase
-- PostgreSQL 15+ | Supabase Auth + RLS
-- Criado: 19/07/2026
-- ═══════════════════════════════════════════════════════════════

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ═══════════════════════════════════════════════════════════════
-- 1. TABELAS
-- ═══════════════════════════════════════════════════════════════

-- Municípios
CREATE TABLE IF NOT EXISTS municipios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  uf CHAR(2) NOT NULL,
  codigo_ibge INTEGER UNIQUE,
  populacao INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Equipes de saúde
CREATE TABLE IF NOT EXISTS equipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  municipio_id UUID NOT NULL REFERENCES municipios(id) ON DELETE CASCADE,
  codigo_ine TEXT NOT NULL,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('esf', 'esb', 'emulti', 'eap')),
  ativa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(municipio_id, codigo_ine)
);

-- Indicadores (fonte de verdade dos 15 indicadores NT 6/2025)
CREATE TABLE IF NOT EXISTS indicadores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo TEXT NOT NULL UNIQUE, -- 'A1', 'B1', 'C1', ..., 'M2'
  nome TEXT NOT NULL,
  grupo TEXT NOT NULL CHECK (grupo IN ('acesso', 'bucal', 'cronicos', 'gestao', 'multiprofissional')),
  peso INTEGER NOT NULL DEFAULT 1,
  meta NUMERIC(5,2) NOT NULL,
  invertido BOOLEAN DEFAULT false,
  escala10 BOOLEAN DEFAULT false,
  descricao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Valores dos indicadores por equipe/período
CREATE TABLE IF NOT EXISTS valores_indicadores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipe_id UUID NOT NULL REFERENCES equipes(id) ON DELETE CASCADE,
  indicador_id UUID NOT NULL REFERENCES indicadores(id) ON DELETE CASCADE,
  valor NUMERIC(8,2) NOT NULL,
  periodo TEXT NOT NULL, -- '2026-07' formato YYYY-MM
  fonte TEXT DEFAULT 'manual', -- 'manual', 'pec', 'importacao'
  sincronizado_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(equipe_id, indicador_id, periodo)
);

-- Usuários (vinculados ao auth do Supabase)
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  nome TEXT,
  role TEXT NOT NULL DEFAULT 'profissional' CHECK (role IN ('profissional', 'coordenador', 'gestor', 'admin')),
  municipio_id UUID REFERENCES municipios(id),
  perfil_id TEXT, -- referência ao perfil em perfis.ts
  equipe_id UUID REFERENCES equipes(id),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Configuração de integração PEC por município
CREATE TABLE IF NOT EXISTS integracoes_pec (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  municipio_id UUID NOT NULL REFERENCES municipios(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL DEFAULT 'pec_local' CHECK (tipo IN ('pec_local', 'pec_cloud', 'sisaps', 'arquivo')),
  host TEXT,
  porta INTEGER DEFAULT 5432,
  database TEXT DEFAULT 'esus',
  usuario TEXT,
  senha TEXT, -- criptografada pelo app, não pelo banco
  ssl BOOLEAN DEFAULT false,
  ativo BOOLEAN DEFAULT false,
  sincronizar_automatico BOOLEAN DEFAULT false,
  frequencia_minutos INTEGER DEFAULT 1440,
  ultima_sincronizacao TIMESTAMPTZ,
  status_sincronizacao TEXT DEFAULT 'pendente' CHECK (status_sincronizacao IN ('ok', 'falha', 'pendente', 'rodando')),
  erro_ultima TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(municipio_id)
);

-- Log de sincronizações PEC
CREATE TABLE IF NOT EXISTS log_sincronizacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  municipio_id UUID NOT NULL REFERENCES municipios(id) ON DELETE CASCADE,
  integracao_id UUID REFERENCES integracoes_pec(id),
  iniciado_em TIMESTAMPTZ DEFAULT NOW(),
  finalizado_em TIMESTAMPTZ,
  duracao_segundos INTEGER,
  status TEXT NOT NULL CHECK (status IN ('ok', 'falha', 'parcial')),
  total_atualizados INTEGER DEFAULT 0,
  total_erros INTEGER DEFAULT 0,
  detalhes JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notas calculadas por equipe/período (cache)
CREATE TABLE IF NOT EXISTS notas_equipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipe_id UUID NOT NULL REFERENCES equipes(id) ON DELETE CASCADE,
  nota NUMERIC(3,1) NOT NULL,
  classificacao TEXT NOT NULL CHECK (classificacao IN ('Ótimo', 'Bom', 'Suficiente', 'Regular')),
  periodo TEXT NOT NULL, -- '2026-07'
  detalhamento JSONB, -- breakdown por indicador
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(equipe_id, periodo)
);

-- ═══════════════════════════════════════════════════════════════
-- 2. ÍNDICES
-- ═══════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_equipes_municipio ON equipes(municipio_id);
CREATE INDEX IF NOT EXISTS idx_equipes_tipo ON equipes(tipo);
CREATE INDEX IF NOT EXISTS idx_equipes_ativa ON equipes(ativa);

CREATE INDEX IF NOT EXISTS idx_valores_equipe ON valores_indicadores(equipe_id);
CREATE INDEX IF NOT EXISTS idx_valores_indicador ON valores_indicadores(indicador_id);
CREATE INDEX IF NOT EXISTS idx_valores_periodo ON valores_indicadores(periodo);
CREATE INDEX IF NOT EXISTS idx_valores_equipe_periodo ON valores_indicadores(equipe_id, periodo);

CREATE INDEX IF NOT EXISTS idx_usuarios_municipio ON usuarios(municipio_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_role ON usuarios(role);
CREATE INDEX IF NOT EXISTS idx_usuarios_equipe ON usuarios(equipe_id);

CREATE INDEX IF NOT EXISTS idx_notas_equipe ON notas_equipes(equipe_id);
CREATE INDEX IF NOT EXISTS idx_notas_periodo ON notas_equipes(periodo);

CREATE INDEX IF NOT EXISTS idx_log_sync_municipio ON log_sincronizacoes(municipio_id);
CREATE INDEX IF NOT EXISTS idx_log_sync_data ON log_sincronizacoes(created_at DESC);

-- ═══════════════════════════════════════════════════════════════
-- 3. ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════

-- Habilitar RLS em todas as tabelas
ALTER TABLE municipios ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE indicadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE valores_indicadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE integracoes_pec ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_sincronizacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notas_equipes ENABLE ROW LEVEL SECURITY;

-- Política: todos podem ler municípios (dados públicos)
CREATE POLICY "municipios_select_all" ON municipios
  FOR SELECT USING (true);

-- Política: gestores/admin podem inserir/atualizar municípios
CREATE POLICY "municipios_write_admin" ON municipios
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.id = auth.uid() AND u.role IN ('gestor', 'admin')
    )
  );

-- Política: equipes visíveis por município vinculado ao usuário
CREATE POLICY "equipes_select_vinculado" ON equipes
  FOR SELECT USING (
    municipio_id IN (
      SELECT municipio_id FROM usuarios WHERE id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM usuarios WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "equipes_write_gestor" ON equipes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.id = auth.uid() AND u.role IN ('gestor', 'admin')
      AND (u.municipio_id = equipes.municipio_id OR u.role = 'admin')
    )
  );

-- Política: indicadores são públicos (catálogo)
CREATE POLICY "indicadores_select_all" ON indicadores
  FOR SELECT USING (true);

-- Política: valores_indicadores por município vinculado
CREATE POLICY "valores_select_vinculado" ON valores_indicadores
  FOR SELECT USING (
    equipe_id IN (
      SELECT e.id FROM equipes e
      JOIN usuarios u ON u.municipio_id = e.municipio_id
      WHERE u.id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM usuarios WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "valores_write_coordenador" ON valores_indicadores
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      JOIN equipes e ON e.municipio_id = u.municipio_id
      WHERE u.id = auth.uid()
      AND u.role IN ('coordenador', 'gestor', 'admin')
      AND e.id = valores_indicadores.equipe_id
    )
  );

-- Política: usuários só veem/gerenciam seu próprio perfil (exceto admin)
CREATE POLICY "usuarios_select_self" ON usuarios
  FOR SELECT USING (
    id = auth.uid() OR EXISTS (
      SELECT 1 FROM usuarios WHERE id = auth.uid() AND role IN ('gestor', 'admin')
    )
  );

CREATE POLICY "usuarios_update_self" ON usuarios
  FOR UPDATE USING (id = auth.uid());

-- Política: integrações PEC só por gestor/admin do município
CREATE POLICY "pec_select_gestor" ON integracoes_pec
  FOR SELECT USING (
    municipio_id IN (
      SELECT municipio_id FROM usuarios
      WHERE id = auth.uid() AND role IN ('gestor', 'admin')
    ) OR EXISTS (
      SELECT 1 FROM usuarios WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "pec_write_gestor" ON integracoes_pec
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.id = auth.uid() AND u.role IN ('gestor', 'admin')
      AND (u.municipio_id = integracoes_pec.municipio_id OR u.role = 'admin')
    )
  );

-- Política: log de sincronizações por gestor
CREATE POLICY "log_select_gestor" ON log_sincronizacoes
  FOR SELECT USING (
    municipio_id IN (
      SELECT municipio_id FROM usuarios
      WHERE id = auth.uid() AND role IN ('gestor', 'admin')
    ) OR EXISTS (
      SELECT 1 FROM usuarios WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Política: notas por município vinculado
CREATE POLICY "notas_select_vinculado" ON notas_equipes
  FOR SELECT USING (
    equipe_id IN (
      SELECT e.id FROM equipes e
      JOIN usuarios u ON u.municipio_id = e.municipio_id
      WHERE u.id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM usuarios WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ═══════════════════════════════════════════════════════════════
-- 4. FUNÇÕES (RPC)
-- ═══════════════════════════════════════════════════════════════

-- Função: calcular nota de uma equipe para um período
CREATE OR REPLACE FUNCTION calcular_nota_equipe(p_equipe_id UUID, p_periodo TEXT)
RETURNS JSONB AS $$
DECLARE
  v_nota NUMERIC(3,1);
  v_classificacao TEXT;
  v_detalhamento JSONB;
  v_soma_pesos INTEGER := 0;
  v_soma_ponderada NUMERIC := 0;
  v_record RECORD;
BEGIN
  FOR v_record IN
    SELECT 
      i.id as indicador_id,
      i.codigo,
      i.nome,
      i.peso,
      i.meta,
      i.invertido,
      i.escala10,
      COALESCE(v.valor, 0) as valor
    FROM indicadores i
    LEFT JOIN valores_indicadores v ON v.indicador_id = i.id
      AND v.equipe_id = p_equipe_id AND v.periodo = p_periodo
    ORDER BY i.codigo
  LOOP
    DECLARE
      v_ratio NUMERIC;
      v_base NUMERIC;
    BEGIN
      v_base := CASE WHEN v_record.escala10 THEN 10 ELSE 100 END;
      
      IF v_record.invertido THEN
        v_ratio := LEAST(1, v_record.meta / NULLIF(v_record.valor, 0));
      ELSE
        v_ratio := LEAST(1, v_record.valor / NULLIF(v_record.meta, 0));
      END IF;
      
      v_soma_pesos := v_soma_pesos + v_record.peso;
      v_soma_ponderada := v_soma_ponderada + (v_record.peso * COALESCE(v_ratio, 0));
    END;
  END LOOP;
  
  IF v_soma_pesos = 0 THEN
    v_nota := 0;
  ELSE
    v_nota := ROUND((v_soma_ponderada / v_soma_pesos) * 10, 1);
  END IF;
  
  v_classificacao := CASE
    WHEN v_nota >= 8.5 THEN 'Ótimo'
    WHEN v_nota >= 7.0 THEN 'Bom'
    WHEN v_nota >= 5.5 THEN 'Suficiente'
    ELSE 'Regular'
  END;
  
  -- Upsert na tabela de cache
  INSERT INTO notas_equipes (equipe_id, nota, classificacao, periodo, detalhamento)
  VALUES (p_equipe_id, v_nota, v_classificacao, p_periodo, v_detalhamento)
  ON CONFLICT (equipe_id, periodo) DO UPDATE SET
    nota = EXCLUDED.nota,
    classificacao = EXCLUDED.classificacao,
    detalhamento = EXCLUDED.detalhamento,
    updated_at = NOW();
  
  RETURN jsonb_build_object(
    'nota', v_nota,
    'classificacao', v_classificacao,
    'equipe_id', p_equipe_id,
    'periodo', p_periodo
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função: resumo do município (notas, repasse, perdas)
CREATE OR REPLACE FUNCTION resumo_municipio(p_municipio_id UUID, p_periodo TEXT)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'municipio_id', p_municipio_id,
    'periodo', p_periodo,
    'total_equipes', COUNT(*),
    'nota_media', ROUND(AVG(n.nota), 1),
    'equipes_otimo', COUNT(*) FILTER (WHERE n.classificacao = 'Ótimo'),
    'equipes_bom', COUNT(*) FILTER (WHERE n.classificacao = 'Bom'),
    'equipes_suficiente', COUNT(*) FILTER (WHERE n.classificacao = 'Suficiente'),
    'equipes_regular', COUNT(*) FILTER (WHERE n.classificacao = 'Regular')
  )
  INTO v_result
  FROM equipes e
  LEFT JOIN notas_equipes n ON n.equipe_id = e.id AND n.periodo = p_periodo
  WHERE e.municipio_id = p_municipio_id AND e.ativa = true;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função: trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers de updated_at
CREATE TRIGGER update_municipios_updated_at BEFORE UPDATE ON municipios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_equipes_updated_at BEFORE UPDATE ON equipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_integracoes_pec_updated_at BEFORE UPDATE ON integracoes_pec
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_valores_indicadores_updated_at BEFORE UPDATE ON valores_indicadores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notas_equipes_updated_at BEFORE UPDATE ON notas_equipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════
-- 5. SEED — Indicadores NT 6/2025 (fonte de verdade)
-- ═══════════════════════════════════════════════════════════════

INSERT INTO indicadores (codigo, nome, grupo, peso, meta, invertido, escala10, descricao) VALUES
-- Acesso
('A1', 'A1 – Acesso à Atenção Primária', 'acesso', 1, 75, false, false, 'Proporção de pessoas atendidas no território'),
-- Bucal
('B1', 'B1 – 1ª Consulta Odontológica Programada', 'bucal', 2, 75, false, false, 'Primeira consulta odontológica programada'),
('B2', 'B2 – Tratamento Odontológico Concluído', 'bucal', 2, 75, false, false, 'Tratamento odontológico concluído'),
('B3', 'B3 – Taxa de Exodontia', 'bucal', 2, 25, true, false, 'Taxa de exodontia (menor é melhor)'),
('B4', 'B4 – Acompanhamento Odontológico de Gestantes', 'bucal', 1, 75, false, false, 'Gestantes com acompanhamento odontológico'),
('B5', 'B5 – Acompanhamento Odontológico de Crianças', 'bucal', 1, 75, false, false, 'Crianças com acompanhamento odontológico'),
('B6', 'B6 – Acompanhamento Odontológico de Diabéticos e Hipertensos', 'bucal', 1, 75, false, false, 'Diabéticos e hipertensos com acompanhamento odontológico'),
-- Crônicos
('C1', 'C1 – Acesso e Continuidade do Cuidado', 'cronicos', 1, 75, false, false, 'Proporção de pessoas atendidas com continuidade'),
('C2', 'C2 – Desenvolvimento Infantil', 'cronicos', 2, 75, false, false, 'Crianças com acompanhamento completo'),
('C3', 'C3 – Gestação e Puerpério', 'cronicos', 2, 75, false, false, 'Gestantes com pré-natal adequado'),
('C4', 'C4 – Diabetes', 'cronicos', 1, 75, false, false, 'Diabéticos com HbA1c e consulta'),
('C5', 'C5 – Hipertensão Arterial', 'cronicos', 1, 75, false, false, 'Hipertensos com PA registrada'),
('C6', 'C6 – Pessoa Idosa', 'cronicos', 1, 75, false, false, 'Idosos com acompanhamento completo'),
('C7', 'C7 – Prevenção do Câncer', 'cronicos', 2, 75, false, false, 'Mulheres com colpocitologia/mamografia'),
-- Gestão
('G1', 'G1 – Gestão da Atenção Primária', 'gestao', 1, 7.5, false, true, 'Nota de gestão da APS (escala 0-10)'),
-- Multiprofissional
('M1', 'M1 – Acesso Multiprofissional', 'multiprofissional', 1, 75, false, false, 'Acesso à equipe multiprofissional'),
('M2', 'M2 – Ações Multiprofissionais', 'multiprofissional', 1, 75, false, false, 'Ações realizadas pela equipe multiprofissional')
ON CONFLICT (codigo) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- 6. SEED — Belterra-PA (piloto)
-- ═══════════════════════════════════════════════════════════════

INSERT INTO municipios (nome, uf, codigo_ibge, populacao) VALUES
('Belterra', 'PA', 1501451, 17268)
ON CONFLICT (codigo_ibge) DO NOTHING;

-- Inserir equipes de Belterra (usando o ID do município recém-criado)
DO $$
DECLARE
  v_municipio_id UUID;
BEGIN
  SELECT id INTO v_municipio_id FROM municipios WHERE codigo_ibge = 1501451;
  
  IF v_municipio_id IS NOT NULL THEN
    INSERT INTO equipes (municipio_id, codigo_ine, nome, tipo, ativa) VALUES
    (v_municipio_id, '0000123456', 'eSF Santa Luzia', 'esf', true),
    (v_municipio_id, '0000123457', 'eSF Floresta', 'esf', true),
    (v_municipio_id, '0000123458', 'eSF Nova Belterra', 'esf', true),
    (v_municipio_id, '0000123459', 'eSB Centro', 'esb', true),
    (v_municipio_id, '0000123460', 'eMulti 1', 'emulti', true)
    ON CONFLICT (municipio_id, codigo_ine) DO NOTHING;
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- 7. PERMISSÕES
-- ═══════════════════════════════════════════════════════════════

-- Garantir que usuários autenticados possam usar as funções RPC
GRANT EXECUTE ON FUNCTION calcular_nota_equipe(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION resumo_municipio(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_updated_at_column() TO authenticated;

-- Permissões de tabelas para authenticated
GRANT SELECT ON indicadores TO authenticated;
GRANT SELECT ON municipios TO authenticated;
GRANT SELECT, INSERT, UPDATE ON equipes TO authenticated;
GRANT SELECT, INSERT, UPDATE ON valores_indicadores TO authenticated;
GRANT SELECT, INSERT, UPDATE ON notas_equipes TO authenticated;
GRANT SELECT, INSERT, UPDATE ON usuarios TO authenticated;
GRANT SELECT, INSERT, UPDATE ON integracoes_pec TO authenticated;
GRANT SELECT, INSERT ON log_sincronizacoes TO authenticated;

-- ═══════════════════════════════════════════════════════════════
-- FIM DO SCHEMA
-- ═══════════════════════════════════════════════════════════════
