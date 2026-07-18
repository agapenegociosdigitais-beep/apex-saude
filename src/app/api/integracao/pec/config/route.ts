import { NextRequest, NextResponse } from 'next/server'
import { criarClienteSupabase } from '@/lib/supabase/server'
import { testarConexao, validarSchema } from '@/lib/pec-connector/connection'
import { IntegracaoPecConfig } from '@/lib/pec-connector/types'

export async function GET(req: NextRequest) {
  const supabase = await criarClienteSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ erro: 'Nao autorizado' }, { status: 401 })
  const { data: usuario } = await supabase.from('usuarios').select('municipio_id').eq('id', user.id).single()
  if (!usuario) return NextResponse.json({ erro: 'Usuario nao encontrado' }, { status: 404 })
  const { data: config } = await supabase.from('integracoes_pec').select('*').eq('municipio_id', usuario.municipio_id).single()
  if (!config) return NextResponse.json({ configurado: false })
  const { host, porta, database, usuario: userDb, ...safeConfig } = config
  return NextResponse.json({ configurado: true, config: { ...safeConfig, host: '***', usuario: '***' }, ultima_sincronizacao: config.ultima_sincronizacao, status: config.status_sincronizacao })
}

export async function POST(req: NextRequest) {
  const supabase = await criarClienteSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ erro: 'Nao autorizado' }, { status: 401 })
  const { data: usuario } = await supabase.from('usuarios').select('municipio_id,role').eq('id', user.id).single()
  if (!usuario || !['gestor','admin'].includes(usuario.role)) return NextResponse.json({ erro: 'Permissao negada' }, { status: 403 })
  const body = await req.json()
  const config: IntegracaoPecConfig = { ...body, municipio_id: usuario.municipio_id }
  const teste = await testarConexao(config)
  if (!teste.ok) return NextResponse.json({ ok: false, erro: teste.erro })
  const schema = await validarSchema(config)
  await supabase.from('integracoes_pec').upsert({ municipio_id: usuario.municipio_id, ativo: true, ...body, updated_at: new Date().toISOString() }, { onConflict: 'municipio_id' })
  return NextResponse.json({ ok: true, versao: teste.versao, tabelas: schema.tabelas_encontradas?.length || 0, faltantes: schema.tabelas_faltantes })
}
