import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { criarClienteSupabase } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin-guard';

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
  const guard = await requireAdmin(); if (guard) return guard;
  try {
    // Vincular evento ao usuario autenticado
    const authClient = await criarClienteSupabase()
    const { data: { user } } = await authClient.auth.getUser()
    const { acao, tabela, dados, municipio_id } = await req.json()
    const { error } = await supabase.from('auditoria_log').insert({
      acao: acao || 'evento',
      tabela: tabela || 'sistema',
      dados_novos: dados || {},
      usuario_id: user?.id || null,
      municipio_id: municipio_id || null,
      created_at: new Date().toISOString(),
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    return NextResponse.json({ erro: (err as Error).message }, { status: 500 })
  }
}
