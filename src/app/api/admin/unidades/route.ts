import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function GET(req: NextRequest) {
  const municipioId = req.nextUrl.searchParams.get('municipio_id');
  let q = supabase.from('unidades_saude').select('*').order('nome');
  if (municipioId) q = q.eq('municipio_id', municipioId);
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: (data || []).map((u: any) => ({ ...u, equipes_count: 0 })) });
}

export async function POST(req: NextRequest) {
  const { municipio_id, nome, tipo } = await req.json();
  const { data, error } = await supabase.from('unidades_saude')
    .insert({ municipio_id, nome, tipo: tipo || 'ubs' }).select('*').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: { ...data, equipes_count: 0 } }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const { id, nome, tipo, ativa } = await req.json();
  const { error } = await supabase.from('unidades_saude').update({ nome, tipo, ativa }).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  const { error } = await supabase.from('unidades_saude').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
