-- ============================================================
-- APEX SAUDE - SCHEMA (parte 2/3)
-- ============================================================

-- 9. CONQUISTAS (catalogo)
CREATE TABLE conquistas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT NOT NULL UNIQUE, nome TEXT NOT NULL, descricao TEXT NOT NULL,
  criterio JSONB NOT NULL, xp INTEGER NOT NULL DEFAULT 0, icone TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- SEED: 15 conquistas iniciais
INSERT INTO conquistas (codigo, nome, descricao, criterio, xp, icone) VALUES
('primeiro_acesso','Primeiro Acesso','Acessou o sistema pela primeira vez','{"tipo":"login","contagem":1}',10,'\ud83d\udc4b'),
('primeira_producao','Primeira Producao','Registrou producao diaria pela primeira vez','{"tipo":"producao","contagem":1}',20,'\ud83d\udcdd'),
('sete_dias_seguidos','7 Dias Seguidos','Registrou producao por 7 dias consecutivos','{"tipo":"streak","dias":7}',50,'\ud83d\udd25'),
('trinta_dias_seguidos','30 Dias Seguidos','Registrou producao por 30 dias consecutivos','{"tipo":"streak","dias":30}',200,'\ud83c\udfc6'),
('meta_c4','Mestre do Diabetes','Atingiu meta do indicador C4 (Diabetes >= 75%)','{"tipo":"meta","indicador":"C4","valor":75}',100,'\ud83e\ude7a'),
('meta_c5','Mestre da Hipertensao','Atingiu meta do indicador C5 (Hipertensao >= 75%)','{"tipo":"meta","indicador":"C5","valor":75}',100,'\u2764\ufe0f'),
('otimo_equipe','Equipe Ouro','Equipe atingiu classificacao Otimo (> 7,5)','{"tipo":"classificacao","nota":7.5}',300,'\ud83e\udd47'),
('tres_meses_otimo','Tri-Campeao','Equipe manteve Otimo por 3 meses consecutivos','{"tipo":"classificacao_consecutiva","nota":7.5,"meses":3}',500,'\ud83d\udc51'),
('ia_utilizada','IA Ativada','Usou a IA para gerar um plano de melhoria','{"tipo":"ia","contagem":1}',30,'\ud83e\udd16'),
('pdca_completo','Ciclo Completo','Completou um ciclo PDCA inteiro (P->D->C->A)','{"tipo":"pdca","status":"done"}',150,'\ud83d\udd04'),
('checklist_mes','Checklist em Dia','Completou o checklist mensal','{"tipo":"checklist","completado":true}',50,'\u2705'),
('cinco_planos_ia','Estrategista','Gerou 5 planos de melhoria com IA','{"tipo":"ia","contagem":5}',100,'\ud83e\udde0'),
('dez_equipes','Multiplicador','Coordenador com 10+ equipes usando o sistema','{"tipo":"gestao","equipes":10}',400,'\ud83c\udf0e'),
('repasse_maximo','Repasse Maximo','Simulador mostrou repasse maximo para o municipio','{"tipo":"simulador","valor":"maximo"}',50,'\ud83d\udcb0'),
('todas_conquistas','Colecionador','Desbloqueou todas as conquistas','{"tipo":"todas"}',2000,'\ud83c\udfc5');

-- 10. USUARIO_CONQUISTAS
CREATE TABLE usuario_conquistas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  conquista_id UUID NOT NULL REFERENCES conquistas(id),
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(usuario_id, conquista_id)
);

-- 11. REUNIOES
CREATE TABLE reunioes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipe_id UUID NOT NULL REFERENCES equipes(id),
  titulo TEXT NOT NULL, slides JSONB NOT NULL,
  created_by UUID REFERENCES usuarios(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 12. PROPOSTAS_COMERCIAIS
CREATE TABLE propostas_comerciais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio_id UUID NOT NULL REFERENCES municipios(id),
  tipo TEXT NOT NULL CHECK (tipo IN ('pro','premium','personalizada')),
  dados JSONB NOT NULL,
  status TEXT DEFAULT 'gerada' CHECK (status IN ('gerada','enviada','aprovada','recusada')),
  created_by UUID REFERENCES usuarios(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 13. TREINAMENTOS
CREATE TABLE treinamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL, descricao TEXT, perfil_alvo TEXT,
  conteudo JSONB, ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
