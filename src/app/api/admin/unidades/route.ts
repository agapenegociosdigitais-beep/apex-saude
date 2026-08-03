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
  const municipioId = req.nextUrl.searchParams.get('municipio_id');
  let q = supabase.from('unidades_saude').select('*').order('nome');
  if (municipioId) q = q.eq('municipio_id', municipioId);
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: (data || []).map(u => ({ ...u, equipes_count: 0 })) });
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin(); if (guard) return guard;
  const { municipio_id, nome, tipo, cnes, endereco, bairro, cep } = await req.json();
  const insert: Record<string, unknown> = { municipio_id, nome, tipo: tipo || 'ubs' };
  if (cnes) insert.cnes = cnes;
  if (endereco) insert.endereco = endereco;
  if (bairro) insert.bairro = bairro;
  if (cep) insert.cep = cep;
  const { data, error } = await supabase.from('unidades_saude')
    .insert(insert).select('*').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: { ...data, equipes_count: 0 } }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const guard = await requireAdmin(); if (guard) return guard;
  const { id, nome, tipo, ativa, cnes, endereco, bairro, cep } = await req.json();
  const update: Record<string, unknown> = { nome, tipo, ativa };
  if (cnes !== undefined) update.cnes = cnes;
  if (endereco !== undefined) update.endereco = endereco;
  if (bairro !== undefined) update.bairro = bairro;
  if (cep !== undefined) update.cep = cep;
  const { error } = await supabase.from('unidades_saude').update(update).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const guard = await requireAdmin(); if (guard) return guard;
  const id = req.nextUrl.searchParams.get('id');
  const { error } = await supabase.from('unidades_saude').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
