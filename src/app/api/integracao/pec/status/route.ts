import { NextRequest, NextResponse } from 'next/server'
import { criarClienteSupabase } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await criarClienteSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ erro: 'Nao autorizado' }, { status: 401 })
  const { data: usuario } = await supabase.from('usuarios').select('municipio_id').eq('id', user.id).single()
  if (!usuario) return NextResponse.json({ erro: 'Usuario nao encontrado' }, { status: 404 })
  const { data: config } = await supabase.from('integracoes_pec').select('ultima_sincronizacao,status_sincronizacao,erro_ultima,ativo').eq('municipio_id', usuario.municipio_id).single()
  if (!config) return NextResponse.json({ configurado: false })
  return NextResponse.json({ configurado: true, ultima_sincronizacao: config.ultima_sincronizacao, status: config.status_sincronizacao, erro: config.erro_ultima, ativo: config.ativo })
}
