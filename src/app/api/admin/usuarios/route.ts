import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

// GET — listar usuarios por UBS, equipe ou municipio
export async function GET(req: NextRequest) {
  const unidadeId = req.nextUrl.searchParams.get('unidade_id');
  const equipeId = req.nextUrl.searchParams.get('equipe_id');
  const municipioId = req.nextUrl.searchParams.get('municipio_id');

  let q = supabase.from('usuarios').select('*').order('nome');
  if (unidadeId) q = q.eq('unidade_id', unidadeId);
  if (equipeId) q = q.eq('equipe_id', equipeId);
  if (municipioId) q = q.eq('municipio_id', municipioId);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// POST — criar usuario (auth + tabela)
export async function POST(req: NextRequest) {
  const { email, nome, role, municipio_id, unidade_id, equipe_id, perfil_id, password } = await req.json();
  if (!email || !nome) return NextResponse.json({ error: 'Email e nome obrigatórios' }, { status: 400 });

  // Criar no Auth
  const pw = password || 'mudar123';
  const authRes = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`, apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: pw, email_confirm: true, user_metadata: { nome, role } }),
  });
  if (!authRes.ok) {
    const err = await authRes.json();
    if (err.error_code === 'email_exists') {
      return NextResponse.json({ error: 'Email já cadastrado' }, { status: 409 });
    }
    return NextResponse.json({ error: err.msg || 'Erro ao criar usuário' }, { status: 500 });
  }
  const authUser = await authRes.json();

  // Inserir na tabela usuarios
  const { error } = await supabase.from('usuarios').insert({
    id: authUser.id, email, nome, role: role || 'profissional',
    municipio_id: municipio_id || null, unidade_id: unidade_id || null,
    equipe_id: equipe_id || null, perfil_id: perfil_id || 'medico',
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data: { id: authUser.id, email, nome, role }, senha: pw }, { status: 201 });
}

// PUT — atualizar usuario
export async function PUT(req: NextRequest) {
  const { id, nome, role, municipio_id, unidade_id, equipe_id, perfil_id, ativo } = await req.json();
  const { error } = await supabase.from('usuarios')
    .update({ nome, role, municipio_id, unidade_id, equipe_id, perfil_id, ativo }).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// DELETE — remover usuario (da tabela + auth)
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });

  const { error } = await supabase.from('usuarios').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Remover do auth
  await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`, apikey: process.env.SUPABASE_SERVICE_ROLE_KEY! },
  });

  return NextResponse.json({ ok: true });
}
