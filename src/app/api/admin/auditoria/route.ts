import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

/**
 * POST /api/admin/auditoria
 * Registra evento de auditoria (login, config PEC, etc.)
 */
export async function POST(req: NextRequest) {
  try {
    const { acao, tabela, dados } = await req.json()
    const { error } = await supabase.from('auditoria_log').insert({
      acao: acao || 'evento',
      tabela: tabela || 'sistema',
      dados_novos: dados || {},
      created_at: new Date().toISOString(),
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    return NextResponse.json({ erro: (err as Error).message }, { status: 500 })
  }
}
