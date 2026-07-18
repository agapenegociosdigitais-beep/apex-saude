/**
 * PEC Connector - Queries por Indicador NT 6/2025
 * 15 queries SQL que leem direto do PostgreSQL do PEC Local
 */

import { PecIndicadorMapping } from './types'

// ====================================
// GRUPO 1: eSF/eAP - C1 a C7
// ====================================

const Q_C1 = `SELECT COUNT(DISTINCT a.cns_cidadao) as atendidos, (SELECT COUNT(*) FROM tb_cidadao WHERE nu_micro_area LIKE (SELECT nu_micro_area FROM tb_equipe WHERE nu_ine = $1 LIMIT 1) || '%') as cadastrados FROM tb_ficha_atendimento_individual a WHERE a.dt_atendimento BETWEEN $2 AND $3 AND a.cns_profissional IN (SELECT cns_profissional FROM tb_profissional_equipe WHERE nu_ine = $1)`

const Q_C2 = `SELECT COUNT(DISTINCT c.cns_cidadao) as criancas_acompanhadas, (SELECT COUNT(*) FROM tb_cidadao WHERE dt_nascimento >= ($3::date - INTERVAL '2 years') AND nu_micro_area LIKE (SELECT nu_micro_area FROM tb_equipe WHERE nu_ine = $1 LIMIT 1) || '%') as total_criancas FROM tb_cidadao c INNER JOIN tb_ficha_atendimento_individual a ON a.cns_cidadao = c.cns_cidadao AND a.dt_atendimento BETWEEN $2 AND $3 WHERE c.dt_nascimento >= ($3::date - INTERVAL '2 years')`

const Q_C3 = `WITH gestantes AS (SELECT DISTINCT cns_cidadao FROM tb_ficha_atendimento_individual WHERE dt_atendimento BETWEEN $2 AND $3 AND st_gestante = true GROUP BY cns_cidadao HAVING COUNT(*) >= 3), puerperas AS (SELECT DISTINCT a.cns_cidadao FROM tb_ficha_atendimento_individual a INNER JOIN tb_cidadao c ON c.cns_cidadao = a.cns_cidadao WHERE a.dt_atendimento BETWEEN $2 AND $3 AND a.st_puerpera = true AND c.dt_ultimo_parto >= ($2::date - INTERVAL '42 days')) SELECT (SELECT COUNT(*) FROM gestantes) as gestantes, (SELECT COUNT(*) FROM puerperas) as puerperas`

const Q_C4 = `SELECT COUNT(DISTINCT p.cns_cidadao) as exames, (SELECT COUNT(*) FROM tb_cidadao c INNER JOIN tb_condicao_avaliada ca ON ca.cns_cidadao = c.cns_cidadao WHERE ca.st_diabetes = true AND c.nu_micro_area LIKE (SELECT nu_micro_area FROM tb_equipe WHERE nu_ine = $1 LIMIT 1) || '%') as total FROM tb_ficha_procedimentos p WHERE p.dt_realizacao BETWEEN $2 AND $3 AND p.co_procedimento IN ('0202010420','0202010412')`

const Q_C5 = `SELECT COUNT(DISTINCT a.cns_cidadao) as pa_aferida, (SELECT COUNT(*) FROM tb_cidadao c INNER JOIN tb_condicao_avaliada ca ON ca.cns_cidadao = c.cns_cidadao WHERE ca.st_hipertensao = true AND c.nu_micro_area LIKE (SELECT nu_micro_area FROM tb_equipe WHERE nu_ine = $1 LIMIT 1) || '%') as total FROM tb_ficha_atendimento_individual a WHERE a.dt_atendimento BETWEEN $2 AND $3 AND a.st_pressao_arterial = true`

const Q_C6 = `SELECT COUNT(DISTINCT c.cns_cidadao) as idosos, (SELECT COUNT(*) FROM tb_cidadao WHERE dt_nascimento <= ($3::date - INTERVAL '60 years') AND nu_micro_area LIKE (SELECT nu_micro_area FROM tb_equipe WHERE nu_ine = $1 LIMIT 1) || '%') as total FROM tb_cidadao c INNER JOIN tb_ficha_atendimento_individual a ON a.cns_cidadao = c.cns_cidadao AND a.dt_atendimento BETWEEN $2 AND $3 WHERE c.dt_nascimento <= ($3::date - INTERVAL '60 years')`

const Q_C7 = `SELECT COUNT(DISTINCT p.cns_cidadao) as rastreadas, (SELECT COUNT(*) FROM tb_cidadao WHERE dt_nascimento BETWEEN ($3::date - INTERVAL '64 years') AND ($3::date - INTERVAL '25 years') AND nu_sexo = 'F' AND nu_micro_area LIKE (SELECT nu_micro_area FROM tb_equipe WHERE nu_ine = $1 LIMIT 1) || '%') as total FROM tb_ficha_procedimentos p INNER JOIN tb_cidadao c ON c.cns_cidadao = p.cns_cidadao WHERE p.dt_realizacao BETWEEN $2 AND $3 AND p.co_procedimento IN ('0203010019','0203010027') AND c.dt_nascimento BETWEEN ($3::date - INTERVAL '64 years') AND ($3::date - INTERVAL '25 years') AND c.nu_sexo = 'F'`

// ====================================
// GRUPO 2: eSB - B1 a B6
// ====================================

const Q_B1 = `SELECT COUNT(DISTINCT a.cns_cidadao) as primeira_consulta, (SELECT COUNT(*) FROM tb_cidadao WHERE nu_micro_area LIKE (SELECT nu_micro_area FROM tb_equipe WHERE nu_ine = $1 LIMIT 1) || '%') as total FROM tb_ficha_atendimento_odontologico a WHERE a.dt_atendimento BETWEEN $2 AND $3 AND a.st_primeira_consulta = true`

const Q_B2 = `SELECT COUNT(DISTINCT a.cns_cidadao) as concluidos, (SELECT COUNT(DISTINCT a2.cns_cidadao) FROM tb_ficha_atendimento_odontologico a2 WHERE a2.dt_atendimento BETWEEN $2 AND $3 AND a2.st_primeira_consulta = true) as iniciados FROM tb_ficha_atendimento_odontologico a WHERE a.dt_atendimento BETWEEN $2 AND $3 AND a.st_tratamento_concluido = true`

const Q_B3 = `SELECT COUNT(*) FILTER (WHERE co_procedimento IN ('0307010048','0307010056','0307010064')) as exodontias, COUNT(*) as total FROM tb_ficha_procedimentos WHERE dt_realizacao BETWEEN $2 AND $3 AND co_procedimento LIKE '03%'`

const Q_B4 = `SELECT COUNT(DISTINCT a.cns_cidadao) as gestantes, (SELECT COUNT(DISTINCT fa.cns_cidadao) FROM tb_ficha_atendimento_individual fa WHERE fa.dt_atendimento BETWEEN $2 AND $3 AND fa.st_gestante = true) as total FROM tb_ficha_atendimento_odontologico a INNER JOIN tb_ficha_atendimento_individual ai ON ai.cns_cidadao = a.cns_cidadao AND ai.dt_atendimento BETWEEN $2 AND $3 AND ai.st_gestante = true WHERE a.dt_atendimento BETWEEN $2 AND $3`

const Q_B5 = `SELECT COUNT(*) as escovacoes FROM tb_ficha_atividade_coletiva WHERE dt_atividade BETWEEN $2 AND $3 AND co_atividade IN ('0302010108','0302010116')`

const Q_B6 = `SELECT COUNT(*) as fluoretacoes FROM tb_ficha_atividade_coletiva WHERE dt_atividade BETWEEN $2 AND $3 AND co_atividade IN ('0302010124','0302010132')`

// ====================================
// GRUPO 3: eMulti - M1 e M2
// ====================================

const Q_M1 = `SELECT COUNT(*) as atendimentos FROM tb_ficha_atendimento_individual WHERE dt_atendimento BETWEEN $2 AND $3 AND co_cbo_profissional IN ('251510','223710','223605','224120','223505','251605','223810','223905','223910','223915')`

const Q_M2 = `SELECT COUNT(*) as coletivas FROM tb_ficha_atividade_coletiva WHERE dt_atividade BETWEEN $2 AND $3 AND cns_profissional IN (SELECT pe.cns_profissional FROM tb_profissional_equipe pe INNER JOIN tb_profissional p ON p.cns_profissional = pe.cns_profissional WHERE pe.nu_ine = $1 AND p.co_cbo IN ('251510','223710','223605','224120','223505','251605','223810','223905','223910','223915'))`

export const PEC_INDICADOR_QUERIES: Record<string, PecIndicadorMapping> = {
  C1: { indicador_codigo:'C1', tabela_pec:'tb_ficha_atendimento_individual', campos_necessarios:['cns_cidadao','dt_atendimento'], query: Q_C1, descricao:'Indicador Sintetico de Acesso' },
  C2: { indicador_codigo:'C2', tabela_pec:'tb_ficha_atendimento_individual + tb_cidadao', campos_necessarios:['cns_cidadao','dt_atendimento','dt_nascimento'], query: Q_C2, descricao:'Desenvolvimento Infantil - criancas < 2 anos (Peso 2)' },
  C3: { indicador_codigo:'C3', tabela_pec:'tb_ficha_atendimento_individual + tb_cidadao', campos_necessarios:['cns_cidadao','dt_atendimento','st_gestante','st_puerpera'], query: Q_C3, descricao:'Gestacao e Puerperio (Peso 2)' },
  C4: { indicador_codigo:'C4', tabela_pec:'tb_ficha_procedimentos', campos_necessarios:['cns_cidadao','co_procedimento','dt_realizacao'], query: Q_C4, descricao:'Diabetes - HbA1c realizada' },
  C5: { indicador_codigo:'C5', tabela_pec:'tb_ficha_atendimento_individual', campos_necessarios:['cns_cidadao','dt_atendimento','st_pressao_arterial'], query: Q_C5, descricao:'Hipertensao - PA aferida' },
  C6: { indicador_codigo:'C6', tabela_pec:'tb_ficha_atendimento_individual + tb_cidadao', campos_necessarios:['cns_cidadao','dt_atendimento','dt_nascimento'], query: Q_C6, descricao:'Pessoa Idosa - >= 60 anos com atendimento' },
  C7: { indicador_codigo:'C7', tabela_pec:'tb_ficha_procedimentos + tb_cidadao', campos_necessarios:['cns_cidadao','co_procedimento','dt_realizacao','dt_nascimento','nu_sexo'], query: Q_C7, descricao:'Prevencao do Cancer - mulheres 25-64 com colpocitologia (Peso 2)' },
  B1: { indicador_codigo:'B1', tabela_pec:'tb_ficha_atendimento_odontologico', campos_necessarios:['cns_cidadao','dt_atendimento','st_primeira_consulta'], query: Q_B1, descricao:'Cobertura de 1a Consulta Odontologica' },
  B2: { indicador_codigo:'B2', tabela_pec:'tb_ficha_atendimento_odontologico', campos_necessarios:['cns_cidadao','dt_atendimento','st_tratamento_concluido'], query: Q_B2, descricao:'Tratamento Odontologico Concluido' },
  B3: { indicador_codigo:'B3', tabela_pec:'tb_ficha_procedimentos', campos_necessarios:['cns_cidadao','co_procedimento','dt_realizacao'], query: Q_B3, descricao:'Taxa de Exodontia - INVERTIDO (Peso 2)' },
  B4: { indicador_codigo:'B4', tabela_pec:'tb_ficha_atendimento_odontologico + tb_ficha_atendimento_individual', campos_necessarios:['cns_cidadao','dt_atendimento','st_gestante'], query: Q_B4, descricao:'Gestante com Atendimento Odontologico (Peso 2)' },
  B5: { indicador_codigo:'B5', tabela_pec:'tb_ficha_atividade_coletiva', campos_necessarios:['dt_atividade','co_atividade'], query: Q_B5, descricao:'Escovacao Supervisionada' },
  B6: { indicador_codigo:'B6', tabela_pec:'tb_ficha_atividade_coletiva', campos_necessarios:['dt_atividade','co_atividade'], query: Q_B6, descricao:'Fluoretacao' },
  M1: { indicador_codigo:'M1', tabela_pec:'tb_ficha_atendimento_individual', campos_necessarios:['dt_atendimento','co_cbo_profissional'], query: Q_M1, descricao:'Atendimentos Individuais eMulti (Peso 6)' },
  M2: { indicador_codigo:'M2', tabela_pec:'tb_ficha_atividade_coletiva', campos_necessarios:['dt_atividade','cns_profissional'], query: Q_M2, descricao:'Atividades Coletivas eMulti (Peso 4)' },
}

export function getQuery(codigo: string): PecIndicadorMapping | null {
  return PEC_INDICADOR_QUERIES[codigo] || null
}

export function getIndicadoresSuportados(): string[] {
  return Object.keys(PEC_INDICADOR_QUERIES)
}
