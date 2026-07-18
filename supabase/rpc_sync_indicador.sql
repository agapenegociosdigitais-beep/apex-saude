-- ============================================================
-- Funcao RPC: sync_indicador_pec
-- Chamada pelo script Python da VPS apos ler o PEC
-- ============================================================

CREATE OR REPLACE FUNCTION sync_indicador_pec(
  codigo TEXT,
  equipe_ine TEXT,
  valor REAL,
  periodo DATE,
  municipio_id UUID,
  sync_em TIMESTAMPTZ DEFAULT now()
) RETURNS JSONB AS $$
DECLARE
  v_equipe_id UUID;
  v_indicador_id UUID;
  v_result JSONB;
BEGIN
  -- Buscar equipe pelo INE e municipio
  SELECT id INTO v_equipe_id FROM equipes
  WHERE codigo_ine = equipe_ine AND municipio_id = $5;
  IF v_equipe_id IS NULL THEN
    RETURN jsonb_build_object('erro', 'Equipe nao encontrada', 'ine', equipe_ine);
  END IF;

  -- Buscar indicador pelo codigo
  SELECT id INTO v_indicador_id FROM indicadores WHERE codigo = $1;
  IF v_indicador_id IS NULL THEN
    RETURN jsonb_build_object('erro', 'Indicador nao encontrado', 'codigo', codigo);
  END IF;

  -- Upsert no valores_indicadores
  INSERT INTO valores_indicadores (equipe_id, indicador_id, valor, periodo, updated_at)
  VALUES (v_equipe_id, v_indicador_id, valor, periodo, sync_em)
  ON CONFLICT (equipe_id, indicador_id, periodo)
  DO UPDATE SET valor = EXCLUDED.valor, updated_at = EXCLUDED.updated_at;

  -- Atualizar status da integracao
  UPDATE integracoes_pec
  SET ultima_sincronizacao = sync_em, status_sincronizacao = 'ok', erro_ultima = NULL
  WHERE municipio_id = $5;

  RETURN jsonb_build_object('ok', true, 'codigo', codigo, 'valor', valor);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
