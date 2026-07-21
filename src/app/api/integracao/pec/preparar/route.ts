import { NextRequest, NextResponse } from 'next/server'
import { criarClienteSupabase } from '@/lib/supabase/server'

/**
 * POST /api/integracao/pec/preparar
 * Prepara um município para integração PEC:
 * 1. Cria/verifica o município
 * 2. Cria registro em integracoes_pec com defaults
 * 3. Retorna o município_id para configuração posterior
 */
export async function POST(req: NextRequest) {
  const supabase = await criarClienteSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })

  const { data: usuario } = await supabase
    .from('usuarios').select('role').eq('id', user.id).single()
  if (!usuario || !['admin','gestor'].includes(usuario.role))
    return NextResponse.json({ erro: 'Permissão negada' }, { status: 403 })

  try {
    const { nome, uf, codigo_ibge } = await req.json()
    if (!nome || !uf) return NextResponse.json({ erro: 'Nome e UF obrigatórios' }, { status: 400 })

    // 1. Buscar ou criar município
    let municipioId: string
    let criado = false

    if (codigo_ibge) {
      const { data: existente } = await supabase
        .from('municipios').select('id').eq('codigo_ibge', codigo_ibge).single()
      if (existente) {
        municipioId = existente.id
      } else {
        const { data: mun, error } = await supabase
          .from('municipios').insert({
            nome, uf: uf.toUpperCase(),
            codigo_ibge: parseInt(codigo_ibge) || null
          }).select('id').single()
        if (error) return NextResponse.json({ erro: error.message }, { status: 500 })
        municipioId = mun.id
        criado = true
      }
    } else {
      const { data: mun, error } = await supabase
        .from('municipios').insert({ nome, uf: uf.toUpperCase() }).select('id').single()
      if (error) return NextResponse.json({ erro: error.message }, { status: 500 })
      municipioId = mun.id
      criado = true
    }

    // 2. Criar/atualizar registro de integração PEC
    const { error: pecErr } = await supabase.from('integracoes_pec').upsert({
      municipio_id: municipioId,
      tipo: 'pec_local',
      ativo: false,
      sincronizar_automatico: true,
      frequencia_minutos: 1440,
      status_sincronizacao: 'pendente',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'municipio_id', ignoreDuplicates: false })

    if (pecErr) return NextResponse.json({ erro: pecErr.message }, { status: 500 })

    // 3. Criar UBS padrão para o município
    const { data: ubsExistentes } = await supabase
      .from('unidades_saude').select('id').eq('municipio_id', municipioId).limit(1)
    if (!ubsExistentes?.length) {
      await supabase.from('unidades_saude').insert({
        municipio_id: municipioId,
        nome: `UBS ${nome} Central`,
        tipo: 'ubs',
        ativa: true,
      })
    }

    return NextResponse.json({
      ok: true,
      municipio_id: municipioId,
      criado,
      mensagem: `✅ ${nome}/${uf} preparado. Configure os dados do PEC na lista abaixo.`
    })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    return NextResponse.json({ erro: message }, { status: 500 })
  }
}
