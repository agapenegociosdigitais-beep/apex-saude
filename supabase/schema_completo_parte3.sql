-- ============================================================
-- APEX SAUDE - SCHEMA (parte 3/3)
-- Tabelas restantes + RLS + Indexes
-- ============================================================

-- 14. CHECKLISTS_EQUIPE
CREATE TABLE checklists_equipe (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipe_id UUID NOT NULL REFERENCES equipes(id),
  mes DATE NOT NULL, itens JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(equipe_id, mes)
);

-- 15. NOTIFICACOES
CREATE TABLE notificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  tipo TEXT NOT NULL CHECK (tipo IN ('prazo','alerta','comunicado','conquista')),
  titulo TEXT NOT NULL, mensagem TEXT NOT NULL,
  lida BOOLEAN DEFAULT false, link TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 16. AUDITORIA_LOG
CREATE TABLE auditoria_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id),
  municipio_id UUID REFERENCES municipios(id),
  acao TEXT NOT NULL, tabela TEXT, registro_id UUID,
  dados_anteriores JSONB, dados_novos JSONB,
  ip INET, user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 17. INTEGRACOES_PEC (NOVA - leitura direta do PEC)
CREATE TABLE integracoes_pec (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio_id UUID NOT NULL REFERENCES municipios(id) UNIQUE,
  tipo TEXT NOT NULL DEFAULT 'pec_local'
    CHECK (tipo IN ('pec_local','pec_cloud','sisaps','arquivo')),
  host TEXT, porta INTEGER DEFAULT 5432, database TEXT DEFAULT 'esus',
  usuario TEXT, senha TEXT,  -- CRIPTOGRAFAR com pgsodium (TODO)
  ssl BOOLEAN DEFAULT false,
  ativo BOOLEAN DEFAULT false,
  sincronizar_automatico BOOLEAN DEFAULT true,
  frequencia_minutos INTEGER DEFAULT 1440,
  ultima_sincronizacao TIMESTAMPTZ,
  status_sincronizacao TEXT DEFAULT 'pendente'
    CHECK (status_sincronizacao IN ('ok','falha','pendente','rodando')),
  erro_ultima TEXT,
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- TRIGGERS (updated_at automatico)
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DO $$ DECLARE t TEXT; BEGIN
  FOR t IN SELECT table_name FROM information_schema.tables
    WHERE table_schema='public' AND table_name IN (
      'municipios','usuarios','equipes','planos_pdca','checklists_equipe','integracoes_pec'
    )
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%s_updated_at ON %I;', t, t);
    EXECUTE format('CREATE TRIGGER trg_%s_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION trigger_updated_at();', t, t);
  END LOOP;
END $$;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipe_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE valores_indicadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE producao_diaria ENABLE ROW LEVEL SECURITY;
ALTER TABLE planos_pdca ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuario_conquistas ENABLE ROW LEVEL SECURITY;
ALTER TABLE reunioes ENABLE ROW LEVEL SECURITY;
ALTER TABLE propostas_comerciais ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklists_equipe ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE auditoria_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE integracoes_pec ENABLE ROW LEVEL SECURITY;

-- Funcao helper: municipio do usuario logado
CREATE OR REPLACE FUNCTION meu_municipio() RETURNS UUID AS $$
  SELECT municipio_id FROM usuarios WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Politicas padrao: usuario so ve dados do seu municipio
CREATE POLICY "municipio_isolado_usuarios" ON usuarios FOR SELECT
  USING (municipio_id = meu_municipio());
CREATE POLICY "municipio_isolado_equipes" ON equipes FOR SELECT
  USING (municipio_id = meu_municipio());
CREATE POLICY "municipio_isolado_valores" ON valores_indicadores FOR SELECT
  USING (equipe_id IN (SELECT id FROM equipes WHERE municipio_id = meu_municipio()));

-- Politica: profissional so ve/edita sua propria producao
CREATE POLICY "propria_producao" ON producao_diaria FOR ALL
  USING (usuario_id = auth.uid());

-- Politica: coordenador/gestor/admin ve toda producao do municipio
CREATE POLICY "coordenador_producao" ON producao_diaria FOR SELECT
  USING (
    equipe_id IN (SELECT id FROM equipes WHERE municipio_id = meu_municipio())
    AND (SELECT role FROM usuarios WHERE id = auth.uid()) IN ('coordenador','gestor','admin')
  );

-- Politica: integracao PEC so gestor/admin
CREATE POLICY "gestor_admin_pec" ON integracoes_pec FOR ALL
  USING (
    municipio_id = meu_municipio()
    AND (SELECT role FROM usuarios WHERE id = auth.uid()) IN ('gestor','admin')
  );

-- Politica: notificacoes so do proprio usuario
CREATE POLICY "proprias_notificacoes" ON notificacoes FOR ALL
  USING (usuario_id = auth.uid());

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_valores_equipe_periodo ON valores_indicadores(equipe_id, periodo);
CREATE INDEX IF NOT EXISTS idx_valores_indicador_periodo ON valores_indicadores(indicador_id, periodo);
CREATE INDEX IF NOT EXISTS idx_producao_usuario_data ON producao_diaria(usuario_id, data);
CREATE INDEX IF NOT EXISTS idx_producao_equipe_data ON producao_diaria(equipe_id, data);
CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario ON notificacoes(usuario_id, lida);
CREATE INDEX IF NOT EXISTS idx_auditoria_municipio ON auditoria_log(municipio_id, created_at);
CREATE INDEX IF NOT EXISTS idx_planos_equipe_status ON planos_pdca(equipe_id, status);
CREATE INDEX IF NOT EXISTS idx_integracoes_pec_municipio ON integracoes_pec(municipio_id);

-- ============================================================
-- SCHEMA PRONTO! Execute: SELECT count(*) FROM indicadores; --> 15
-- ============================================================
