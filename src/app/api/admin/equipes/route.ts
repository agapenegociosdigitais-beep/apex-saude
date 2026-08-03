import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/admin-guard';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function GET(req: NextRequest) {
  const guard = await requireAdmin(); if (guard) return guard;
  const unidadeId = req.nextUrl.searchParams.get('unidade_id');
  const municipioId = req.nextUrl.searchParams.get('municipio_id');
  let q = supabase.from('equipes').select('*, unidades_saude(nome)').order('nome');
  if (unidadeId) q = q.eq('unidade_id', unidadeId);
  if (municipioId) q = q.eq('municipio_id', municipioId);
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin(); if (guard) return guard;
  const { municipio_id, unidade_id, codigo_ine, nome, tipo } = await req.json();
  const { data, error } = await supabase.from('equipes')
    .insert({ municipio_id, unidade_id, codigo_ine: codigo_ine || nome.replace(/\s/g,'_'), nome, tipo })
    .select('*, unidades_saude(nome)').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const guard = await requireAdmin(); if (guard) return guard;
  const { id, nome, tipo, ativa, codigo_ine } = await req.json();
  const { error } = await supabase.from('equipes').update({ nome, tipo, ativa, codigo_ine }).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const guard = await requireAdmin(); if (guard) return guard;
  const id = req.nextUrl.searchParams.get('id');
  const { error } = await supabase.from('equipes').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
