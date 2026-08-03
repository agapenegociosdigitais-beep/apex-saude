import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { criarClienteSupabase } from '@/lib/supabase/server'

// Usa service_role key pra evitar problemas de RLS/cookie no Vercel
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

/**
 * POST /api/integracao/pec/preparar
 * Prepara um município:
 * 1. Cria/verifica no Supabase
 * 2. Cria integracoes_pec
 * 3. Cria UBS default
 *
 * Chamada exclusivamente pela aba PEC de /admin (onboarding de
 * municipios novos na plataforma). Auth + role dentro do handler
 * (nao confia so no middleware): o comentario original dizia "so
 * acessivel pela pagina admin, protegida pelo middleware", mas o
 * middleware nao checa role para /api/integracao/* — so exige login.
 * Sem essa checagem, qualquer usuario logado (mesmo profissional
 * comum) podia criar municipios/integracoes PEC arbitrarios.
 */
export async function POST(req: NextRequest) {
  try {
    const authClient = await criarClienteSupabase()
    const { data: { user } } = await authClient.auth.getUser()
    if (!user) return NextResponse.json({ erro: 'Nao autorizado' }, { status: 401 })

    const { data: usuario } = await authClient.from('usuarios').select('role').eq('id', user.id).single()
    if (!usuario || usuario.role !== 'admin') {
      return NextResponse.json({ erro: 'Permissao negada' }, { status: 403 })
    }

    const { nome, uf, codigo_ibge } = await req.json()
    if (!nome || !uf) {
      return NextResponse.json({ erro: 'Nome e UF obrigatórios' }, { status: 400 })
    }

    // 1. Criar/buscar município
    let municipioId: string
    let municCriado = false

    if (codigo_ibge) {
      const { data: existente } = await supabase
        .from('municipios')
        .select('id')
        .eq('codigo_ibge', parseInt(String(codigo_ibge)))
        .maybeSingle()

      if (existente) {
        municipioId = existente.id
      } else {
        const { data: mun, error } = await supabase
          .from('municipios')
          .insert({
            nome,
            uf: uf.toUpperCase(),
            codigo_ibge: parseInt(String(codigo_ibge)),
          })
          .select('id')
          .single()

        if (error) {
          return NextResponse.json({ erro: error.message }, { status: 500 })
        }
        municipioId = mun.id
        municCriado = true
      }
    } else {
      const { data: mun, error } = await supabase
        .from('municipios')
        .insert({ nome, uf: uf.toUpperCase() })
        .select('id')
        .single()

      if (error) {
        return NextResponse.json({ erro: error.message }, { status: 500 })
      }
      municipioId = mun.id
      municCriado = true
    }

    // 2. Criar integração PEC
    await supabase.from('integracoes_pec').upsert(
      {
        municipio_id: municipioId,
        tipo: 'pec_local',
        ativo: false,
        sincronizar_automatico: true,
        frequencia_minutos: 1440,
        status_sincronizacao: 'pendente',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'municipio_id' }
    )

    // 3. Criar UBS default
    let ubsCriadas = 0

    // Verifica se já existem UBS para este município
    const { count } = await supabase
      .from('unidades_saude')
      .select('*', { count: 'exact', head: true })
      .eq('municipio_id', municipioId)

    if (!count) {
      const { error: ubsErr } = await supabase
        .from('unidades_saude')
        .insert({
          municipio_id: municipioId,
          nome: `UBS ${nome} Central`,
          tipo: 'ubs',
          ativa: true,
        })

      if (!ubsErr) ubsCriadas = 1
    }

    return NextResponse.json({
      ok: true,
      municipio_id: municipioId,
      municipio_criado: municCriado,
      ubs_criadas: ubsCriadas,
      ibge_code: codigo_ibge || null,
      mensagem: `✅ ${nome}/${uf} preparado! Configure os dados do PEC abaixo.`,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    console.error('[PEC preparar]', message)
    return NextResponse.json({ erro: message }, { status: 500 })
  }
}
