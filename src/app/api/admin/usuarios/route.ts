import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

export async function GET(req: NextRequest) {
  const municipioId = req.nextUrl.searchParams.get('municipio_id')
  const unidadeId = req.nextUrl.searchParams.get('unidade_id')

  if (!municipioId) return NextResponse.json({ error: 'municipio_id required' }, { status: 400 })

  let q = supabase.from('usuarios').select('*').eq('municipio_id', municipioId).order('nome')
  if (unidadeId) q = q.eq('unidade_id', unidadeId)

  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Enrich with unidade nome
  const { data: unidades } = await supabase.from('unidades_saude').select('id,nome').eq('municipio_id', municipioId)
  const unidadeMap: Record<string, string> = {}
  unidades?.forEach(u => { unidadeMap[u.id] = u.nome })

  const result = (data || []).map(u => ({
    id: u.id, nome: u.nome, email: u.email, role: u.role, perfil_id: u.perfil_id,
    unidade_nome: unidadeMap[u.unidade_id] || null,
    municipio_id: u.municipio_id, unidade_id: u.unidade_id, equipe_id: u.equipe_id,
  }))

  return NextResponse.json({ data: result })
}
