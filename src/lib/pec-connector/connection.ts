/**
 * PEC Connector — Connection Manager
 * 
 * Gerencia conexões seguras com bancos PostgreSQL do PEC Local
 * de múltiplos municípios, com pool de conexões e timeout.
 */

import { Pool, PoolClient } from 'pg'
import { IntegracaoPecConfig } from './types'
import { decryptSecret, isEncrypted } from './crypto'

// ──── Pool de Conexões (um pool por município) ────
const pools = new Map<string, Pool>()

/**
 * Criar ou reutilizar pool de conexão para um município.
 *
 * config.senha vem criptografada do banco (ver crypto.ts) — descriptografa
 * aqui, no único ponto onde a senha em texto plano existe em memória, para
 * repassar ao driver `pg`. Nunca persistir/logar o valor descriptografado.
 */
export function getPool(config: IntegracaoPecConfig): Pool {
  const key = config.municipio_id
  
  if (pools.has(key)) {
    const existing = pools.get(key)!
    // Verificar se pool ainda está ativo
    if (!existing.ended) return existing
    pools.delete(key)
  }

  const senhaPlana = config.senha && isEncrypted(config.senha)
    ? decryptSecret(config.senha)
    : config.senha // fallback: valores antigos ainda não migrados (texto puro)

  const pool = new Pool({
    host: config.host || 'localhost',
    port: config.porta || 5432,
    database: config.database || 'esus',
    user: config.usuario,
    password: senhaPlana,
    ssl: config.ssl ? { rejectUnauthorized: false } : false,
    max: 2,              // máximo 2 conexões simultâneas por município
    idleTimeoutMillis: 30000,  // fecha conexão ociosa após 30s
    connectionTimeoutMillis: 10000,  // timeout 10s
    statement_timeout: 30000,  // cada query max 30s
  })
  
  pool.on('error', (err) => {
    console.error(`[PEC] Pool error município ${config.municipio_id}:`, err.message)
  })
  
  pools.set(key, pool)
  return pool
}

/**
 * Testar conexão com o banco PEC
 * Retorna { ok: true, versao: string } ou { ok: false, erro: string }
 */
export async function testarConexao(
  config: IntegracaoPecConfig
): Promise<{ ok: boolean; versao?: string; erro?: string }> {
  const pool = getPool(config)
  let client: PoolClient | null = null
  
  try {
    client = await pool.connect()
    const result = await client.query('SELECT version()')
    return {
      ok: true,
      versao: result.rows[0]?.version?.split(',')[0] || 'desconhecida',
    }
  } catch (err: unknown) {
    return {
      ok: false,
      erro: err instanceof Error ? err.message : 'Erro desconhecido',
    }
  } finally {
    if (client) client.release()
  }
}

/**
 * Executar query no PEC com timeout
 */
export async function executarQuery(
  config: IntegracaoPecConfig,
  query: string,
  params: unknown[] = []
): Promise<Record<string, unknown>[]> {
  const pool = getPool(config)
  const client = await pool.connect()
  
  try {
    // Setar transaction para read-only (segurança extra)
    await client.query('SET TRANSACTION READ ONLY')
    
    const start = Date.now()
    const result = await client.query(query, params)
    const elapsed = Date.now() - start
    
    console.log(`[PEC] Query executada em ${elapsed}ms: ${query.substring(0, 80)}...`)
    return result.rows
  } finally {
    client.release()
  }
}

/**
 * Verificar se as tabelas esperadas do PEC existem
 */
export async function validarSchema(
  config: IntegracaoPecConfig
): Promise<{ ok: boolean; tabelas_encontradas: string[]; tabelas_faltantes: string[] }> {
  const expectedTables = [
    'tb_ficha_atendimento_individual',
    'tb_ficha_procedimentos',
    'tb_ficha_atendimento_odontologico',
    'tb_ficha_atividade_coletiva',
    'tb_cidadao',
    'tb_equipe',
  ]
  
  try {
    const rows = await executarQuery(
      config,
      `SELECT table_name FROM information_schema.tables 
       WHERE table_schema = 'public' 
       AND table_name LIKE 'tb_%'
       ORDER BY table_name`
    )
    
    const found = rows.map(r => String(r.table_name))
    const expected = expectedTables
    const missing = expected.filter(t => !found.includes(t))
    
    return {
      ok: missing.length === 0,
      tabelas_encontradas: found,
      tabelas_faltantes: missing,
    }
  } catch (err: unknown) {
    console.error('[PEC] Falha ao validar schema:', err instanceof Error ? err.message : err)
    return {
      ok: false,
      tabelas_encontradas: [],
      tabelas_faltantes: expectedTables,
    }
  }
}

/**
 * Fechar todas as conexões (útil para shutdown graceful)
 */
export async function fecharTodasConexoes(): Promise<void> {
  for (const [key, pool] of pools) {
    await pool.end()
    console.log(`[PEC] Pool fechado: município ${key}`)
  }
  pools.clear()
}

/**
 * Fechar conexão de um município específico
 */
export async function fecharConexao(municipioId: string): Promise<void> {
  const pool = pools.get(municipioId)
  if (pool) {
    await pool.end()
    pools.delete(municipioId)
    console.log(`[PEC] Conexão fechada: município ${municipioId}`)
  }
}
