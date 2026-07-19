-- ═══════════════════════════════════════════════════════════════
-- ÁPEX Saúde — Seed de Demonstração
-- Valores mock determinísticos para Belterra-PA (jul/2026)
-- ═══════════════════════════════════════════════════════════════

DO $$
DECLARE
  v_municipio_id UUID;
  v_periodo TEXT := '2026-07';
  v_equipe RECORD;
  v_indicador RECORD;
  v_hash INTEGER;
  v_valor NUMERIC(8,2);
BEGIN
  -- Buscar município Belterra
  SELECT id INTO v_municipio_id FROM municipios WHERE nome = 'Belterra' AND uf = 'PA';
  
  IF v_municipio_id IS NULL THEN
    RAISE NOTICE 'Município Belterra não encontrado. Rode schema.sql primeiro.';
    RETURN;
  END IF;
  
  -- Para cada equipe de Belterra
  FOR v_equipe IN SELECT * FROM equipes WHERE municipio_id = v_municipio_id AND ativa = true
  LOOP
    -- Para cada indicador, gerar valor determinístico (mesma lógica do valorMock)
    FOR v_indicador IN SELECT * FROM indicadores ORDER BY codigo
    LOOP
      -- Hash determinístico: equipe_id + indicador_id
      v_hash := 0;
      FOR i IN 1..LENGTH(v_equipe.id::text || v_indicador.id::text)
      LOOP
        v_hash := (v_hash * 31 + ASCII(SUBSTRING(v_equipe.id::text || v_indicador.id::text, i, 1))) % 9973;
      END LOOP;
      
      -- Calcular valor baseado no tipo de indicador
      IF v_indicador.escala10 THEN
        v_valor := ROUND((5 + (v_hash % 46)::numeric / 10), 1);
      ELSIF v_indicador.invertido THEN
        v_valor := 5 + (v_hash % 26);
      ELSE
        v_valor := 45 + (v_hash % 51);
      END IF;
      
      -- Inserir valor
      INSERT INTO valores_indicadores (equipe_id, indicador_id, valor, periodo, fonte)
      VALUES (v_equipe.id, v_indicador.id, v_valor, v_periodo, 'demo')
      ON CONFLICT (equipe_id, indicador_id, periodo) DO UPDATE SET
        valor = EXCLUDED.valor,
        fonte = EXCLUDED.fonte,
        updated_at = NOW();
    END LOOP;
    
    -- Calcular nota da equipe
    PERFORM calcular_nota_equipe(v_equipe.id, v_periodo);
  END LOOP;
  
  RAISE NOTICE 'Seed de demonstração inserido para Belterra-PA, período %', v_periodo;
END $$;
