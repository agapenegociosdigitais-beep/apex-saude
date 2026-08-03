import { NextRequest, NextResponse } from 'next/server'
import { criarClienteSupabase } from '@/lib/supabase/server'
import { testarConexao, validarSchema } from '@/lib/pec-connector/connection'
import { IntegracaoPecConfig } from '@/lib/pec-connector/types'
import { encryptSecret } from '@/lib/pec-connector/crypto'

export async function GET() {
  const supabase = await criarClienteSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ erro: 'Nao autorizado' }, { status: 401 })
  const { data: usuario } = await supabase.from('usuarios').select('municipio_id').eq('id', user.id).single()
  if (!usuario) return NextResponse.json({ erro: 'Usuario nao encontrado' }, { status: 404 })
  const { data: config } = await supabase.from('integracoes_pec').select('*').eq('municipio_id', usuario.municipio_id).single()
  if (!config) return NextResponse.json({ configurado: false })
  // Whitelist: nunca expor senha/host/credenciais do banco PEC na resposta
  const safeConfig = { ativo: config.ativo, ssl: config.ssl, updated_at: config.updated_at }
  return NextResponse.json({ configurado: true, config: safeConfig, ultima_sincronizacao: config.ultima_sincronizacao, status: config.status_sincronizacao })
}

export async function POST(req: NextRequest) {
  const supabase = await criarClienteSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ erro: 'Nao autorizado' }, { status: 401 })
  const { data: usuario } = await supabase.from('usuarios').select('municipio_id,role').eq('id', user.id).single()
  if (!usuario || !['gestor','admin'].includes(usuario.role)) return NextResponse.json({ erro: 'Permissao negada' }, { status: 403 })
  const body = await req.json()
  const config: IntegracaoPecConfig = { ...body, municipio_id: usuario.municipio_id }
  // testarConexao/validarSchema usam a senha em texto plano (nunca persistida assim)
  const teste = await testarConexao(config)
  if (!teste.ok) return NextResponse.json({ ok: false, erro: teste.erro })
  const schema = await validarSchema(config)
  // Só a versão criptografada é gravada em integracoes_pec.senha
  const bodyParaSalvar = { ...body }
  if (typeof bodyParaSalvar.senha === 'string' && bodyParaSalvar.senha.length > 0) {
    bodyParaSalvar.senha = encryptSecret(bodyParaSalvar.senha)
  }
  await supabase.from('integracoes_pec').upsert({ municipio_id: usuario.municipio_id, ativo: true, ...bodyParaSalvar, updated_at: new Date().toISOString() }, { onConflict: 'municipio_id' })
  return NextResponse.json({ ok: true, versao: teste.versao, tabelas: schema.tabelas_encontradas?.length || 0, faltantes: schema.tabelas_faltantes })
}
