import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { criarClienteSupabase } from '@/lib/supabase/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

const COLS: Record<string, string> = {
  hba1c: 'hba1c_pendente', pa: 'pa_pendente',
  colpo: 'colpocitologia_pendente', mamo: 'mamografia_pendente',
  odonto: 'odontologico_pendente', prenatal: 'pre_natal_pendente',
}

export async function GET(req: NextRequest) {
  const authClient = await criarClienteSupabase()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return NextResponse.json({ erro: 'Nao autorizado' }, { status: 401 })

  const indicador = req.nextUrl.searchParams.get('indicador') || 'hba1c'
  const col = COLS[indicador]
  if (!col) return NextResponse.json({ erro: 'Indicador invalido' }, { status: 400 })

  const { data: pacientes } = await supabase
    .from('pacientes')
    .select('nome,cns,data_nascimento,sexo,telefone,ultima_consulta,equipes(nome)')
    .eq(col, true)
    .order('nome')
    .limit(1000)

  const header = 'Nome,CNS,Nascimento,Sexo,Telefone,Ultima Consulta,Equipe'
  const rows = (pacientes || []).map(p =>
    `"${p.nome}","${p.cns}","${p.data_nascimento || ''}","${p.sexo}","${p.telefone || ''}","${p.ultima_consulta || ''}","${(p.equipes as any)?.nome || ''}"`
  )
  const csv = [header, ...rows].join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename=busca-ativa-${indicador}.csv`,
    },
  })
}
