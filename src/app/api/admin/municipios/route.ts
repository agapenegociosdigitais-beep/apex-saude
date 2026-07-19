import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function GET() {
  const { data: municipios, error } = await supabase
    .from('municipios').select('*, unidades_saude(*)').order('nome');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const result = municipios.map((m: any) => ({
    id: m.id, nome: m.nome, uf: m.uf, codigo_ibge: m.codigo_ibge, populacao: m.populacao,
    unidades_count: m.unidades_saude?.length || 0,
    unidades: (m.unidades_saude || []).map((u: any) => ({
      id: u.id, municipio_id: u.municipio_id, nome: u.nome, tipo: u.tipo, ativa: u.ativa, equipes_count: 0,
    })),
  }));
  return NextResponse.json({ data: result });
}

export async function POST(req: NextRequest) {
  const { nome, uf, codigo_ibge, populacao } = await req.json();
  if (!nome || !uf) return NextResponse.json({ error: 'Nome e UF obrigatórios' }, { status: 400 });
  const { data: mun, error } = await supabase.from('municipios')
    .insert({ nome, uf: uf.toUpperCase(), codigo_ibge, populacao }).select('*').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const { data: ubs } = await supabase.from('unidades_saude')
    .insert({ municipio_id: mun.id, nome: `UBS ${mun.nome}`, tipo: 'ubs' }).select('*').single();
  return NextResponse.json({ data: { ...mun, unidades_count: 1, unidades: [{ id: ubs!.id, municipio_id: ubs!.municipio_id, nome: ubs!.nome, tipo: ubs!.tipo, ativa: ubs!.ativa, equipes_count: 0 }] } }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const { id, nome, uf, codigo_ibge, populacao } = await req.json();
  const { error } = await supabase.from('municipios').update({ nome, uf, codigo_ibge, populacao }).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });
  const { error } = await supabase.from('municipios').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
