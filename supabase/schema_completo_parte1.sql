-- ============================================================
-- APEX SAUDE - SCHEMA COMPLETO (17 tabelas)
-- Cole isso no SQL Editor do Supabase (app.supabase.com)
-- ============================================================

-- 1. MUNICIPIOS
CREATE TABLE municipios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL, estado CHAR(2) NOT NULL, populacao INTEGER,
  plano TEXT DEFAULT 'basico' CHECK (plano IN ('basico','municipal','regional')),
  ativo BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. USUARIOS (estende auth.users)
CREATE TABLE usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
  perfil TEXT NOT NULL CHECK (perfil IN ('medico','enfermeiro','tecnico','acs','dentista','asb','asco','psicologo','nutricionista','fisioterapeuta','farmaceutico','assistente_social','coordenador','gestor','admin')),
  municipio_id UUID NOT NULL REFERENCES municipios(id),
  role TEXT DEFAULT 'profissional' CHECK (role IN ('profissional','coordenador','gestor','admin')),
  ativo BOOLEAN DEFAULT true, ultimo_acesso TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. EQUIPES
CREATE TABLE equipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio_id UUID NOT NULL REFERENCES municipios(id),
  tipo TEXT NOT NULL CHECK (tipo IN ('esf','esb','emulti')),
  nome TEXT NOT NULL, codigo_ine TEXT, ativa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(municipio_id, nome)
);

-- 4. EQUIPE_USUARIOS (N:N)
CREATE TABLE equipe_usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  equipe_id UUID NOT NULL REFERENCES equipes(id),
  papel TEXT DEFAULT 'membro' CHECK (papel IN ('membro','coordenador')),
  UNIQUE(usuario_id, equipe_id)
);

-- 5. INDICADORES (catalogo NT 6/2025)
CREATE TABLE indicadores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT NOT NULL UNIQUE, nome TEXT NOT NULL, nome_completo TEXT NOT NULL,
  grupo TEXT NOT NULL CHECK (grupo IN ('equipe','beneficiario','multiprofissional')),
  subgrupo TEXT NOT NULL CHECK (subgrupo IN ('esf','esb','emulti')),
  peso INTEGER NOT NULL DEFAULT 1, invertido BOOLEAN DEFAULT false,
  meta REAL NOT NULL, escala_10 BOOLEAN DEFAULT false, descricao TEXT, fonte_dados TEXT,
  ativo BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now()
);

-- SEED: 15 indicadores NT 6/2025
INSERT INTO indicadores (codigo, nome, nome_completo, grupo, subgrupo, peso, invertido, meta) VALUES
('C1','Acesso','Indicador de Acesso ao Servico de Saude','equipe','esf',1,false,75),
('C2','Desenvolvimento Infantil','Indicador de Desenvolvimento Infantil','equipe','esf',2,false,75),
('C3','Gestacao e Puerperio','Indicador de Gestacao e Puerperio','equipe','esf',2,false,75),
('C4','Diabetes','Indicador de Diabetes - HbA1c','equipe','esf',1,false,75),
('C5','Hipertensao','Indicador de Hipertensao - PA Aferida','equipe','esf',1,false,75),
('C6','Pessoa Idosa','Indicador de Atencao a Pessoa Idosa','equipe','esf',1,false,75),
('C7','Prevencao do Cancer','Indicador de Prevencao do Cancer','equipe','esf',2,false,75),
('B1','1a Consulta Odontologica','Cobertura de Primeira Consulta Odontologica','beneficiario','esb',1,false,75),
('B2','Tratamento Concluido','Proporcao de Tratamento Odontologico Concluido','beneficiario','esb',1,false,75),
('B3','Taxa de Exodontia','Taxa de Exodontia - INVERTIDO','beneficiario','esb',2,true,75),
('B4','Gestante Odontologico','Gestante com Atendimento Odontologico','beneficiario','esb',1,false,75),
('B5','Escovacao Supervisionada','Cobertura de Escovacao Supervisionada','beneficiario','esb',1,false,75),
('B6','Fluoretacao','Cobertura de Fluoretacao','beneficiario','esb',1,false,75),
('M1','Indicador M1 eMulti','Atendimentos eMulti (Peso 6)','multiprofissional','emulti',6,false,75),
('M2','Indicador M2 eMulti','Atendimentos eMulti (Peso 4)','multiprofissional','emulti',4,false,75);

-- 6. VALORES_INDICADORES
CREATE TABLE valores_indicadores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipe_id UUID NOT NULL REFERENCES equipes(id),
  indicador_id UUID NOT NULL REFERENCES indicadores(id),
  valor REAL NOT NULL,
  meta_atingida BOOLEAN GENERATED ALWAYS AS (valor >= (SELECT meta FROM indicadores WHERE id = indicador_id)) STORED,
  periodo DATE NOT NULL,
  quadrimestre INTEGER GENERATED ALWAYS AS (EXTRACT(QUARTER FROM periodo)::INTEGER) STORED,
  ano INTEGER GENERATED ALWAYS AS (EXTRACT(YEAR FROM periodo)::INTEGER) STORED,
  updated_by UUID REFERENCES usuarios(id),
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(equipe_id, indicador_id, periodo)
);

-- 7. PRODUCAO_DIARIA
CREATE TABLE producao_diaria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  equipe_id UUID NOT NULL REFERENCES equipes(id),
  data DATE NOT NULL DEFAULT CURRENT_DATE, metrica TEXT NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 0, observacao TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(usuario_id, data, metrica)
);

-- 8. PLANOS_PDCA
CREATE TABLE planos_pdca (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipe_id UUID NOT NULL REFERENCES equipes(id),
  indicador_id UUID REFERENCES indicadores(id),
  ciclo INTEGER NOT NULL DEFAULT 1,
  plano TEXT NOT NULL, executar TEXT NOT NULL, verificar TEXT, agir TEXT,
  status TEXT DEFAULT 'plan' CHECK (status IN ('plan','do','check','act','done')),
  gerado_por_ia BOOLEAN DEFAULT false, ia_modelo TEXT,
  created_by UUID REFERENCES usuarios(id),
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);

-- = continua =
