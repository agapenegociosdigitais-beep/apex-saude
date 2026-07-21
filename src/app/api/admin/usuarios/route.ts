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

  let q = supabase.from('usuarios').select('*').order('nome')
  if (municipioId) q = q.eq('municipio_id', municipioId)
  if (unidadeId) q = q.eq('unidade_id', unidadeId)

  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Enrich with unidade nome
  const unidadeMap: Record<string, string> = {}
  if (municipioId) {
    const { data: unidades } = await supabase.from('unidades_saude').select('id,nome').eq('municipio_id', municipioId)
    unidades?.forEach(u => { unidadeMap[u.id] = u.nome })
  } else {
    const { data: unidades } = await supabase.from('unidades_saude').select('id,nome')
    unidades?.forEach(u => { unidadeMap[u.id] = u.nome })
  }

  const result = (data || []).map(u => ({
    id: u.id, nome: u.nome, email: u.email, role: u.role, perfil_id: u.perfil_id,
    unidade_nome: unidadeMap[u.unidade_id] || null,
    municipio_id: u.municipio_id, unidade_id: u.unidade_id, equipe_id: u.equipe_id,
  }))

  return NextResponse.json({ data: result })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { email, nome, role, municipio_id, unidade_id, equipe_id, perfil_id, password } = body

  if (!email || !nome || !municipio_id) {
    return NextResponse.json({ error: 'Email, nome e município obrigatórios' }, { status: 400 })
  }

  // Criar no auth.users
  const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
    email,
    password: password || 'mudar123',
    email_confirm: true,
    user_metadata: { nome, role: role || 'profissional', perfil: perfil_id || 'medico' },
  })

  if (authErr) return NextResponse.json({ error: authErr.message }, { status: 500 })

  // Criar na tabela usuarios
  const { error: dbErr } = await supabase.from('usuarios').insert({
    id: authUser.user.id,
    email,
    nome,
    role: role || 'profissional',
    perfil_id: perfil_id || 'medico',
    municipio_id,
    unidade_id: unidade_id || null,
    equipe_id: equipe_id || null,
  })

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 })

  return NextResponse.json({ ok: true, senha: password || 'mudar123' }, { status: 201 })
}

export async function PUT(req: NextRequest) {
  const body = await req.json()
  const { id, nome, email, role, perfil_id, municipio_id, unidade_id, equipe_id } = body
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })

  const update: Record<string, unknown> = {}
  if (nome !== undefined) update.nome = nome
  if (email !== undefined) update.email = email
  if (role !== undefined) update.role = role
  if (perfil_id !== undefined) update.perfil_id = perfil_id
  if (municipio_id !== undefined) update.municipio_id = municipio_id
  if (unidade_id !== undefined) update.unidade_id = unidade_id
  if (equipe_id !== undefined) update.equipe_id = equipe_id

  const { error } = await supabase.from('usuarios').update(update).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })

  // Deletar do auth.users
  await supabase.auth.admin.deleteUser(id)

  // Deletar da tabela usuarios
  const { error } = await supabase.from('usuarios').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
