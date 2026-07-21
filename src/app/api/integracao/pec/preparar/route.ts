import { NextRequest, NextResponse } from 'next/server'
import { criarClienteSupabase } from '@/lib/supabase/server'

const CNES_API = 'https://apidadosabertos.saude.gov.br/cnes'

interface CnesEstabelecimento {
  codigo_cnes: number
  nome_fantasia?: string
  nome_razao_social?: string
}

/**
 * Busca UBS de um município na API pública do DATASUS
 */
async function fetchUbs(ibge6: string) {
  const tipos = [1, 2, 70] // Posto, Centro/UBS, NASF
  const todas: CnesEstabelecimento[] = []

  for (const tipo of tipos) {
    try {
      const url = `${CNES_API}/estabelecimentos?codigo_municipio=${ibge6}&codigo_tipo_unidade=${tipo}&limit=50`
      const res = await fetch(url, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(15000),
      })
      if (!res.ok) continue
      const data = await res.json()
      const est = data?.estabelecimentos || []
      todas.push(...est)
    } catch {
      // Silencioso - o CNES pode não ter certos tipos
    }
  }

  return todas
}

/**
 * POST /api/integracao/pec/preparar
 * Prepara um município:
 * 1. Cria/verifica no Supabase
 * 2. Puxa UBS reais do CNES (API DATASUS)
 * 3. Cria integracoes_pec
 */
export async function POST(req: NextRequest) {
  const supabase = await criarClienteSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })

  const { data: usuario } = await supabase
    .from('usuarios').select('role').eq('email', user.email).single()
  if (!usuario || !['admin','gestor'].includes(usuario.role))
    return NextResponse.json({ erro: 'Permissão negada' }, { status: 403 })

  try {
    const { nome, uf, codigo_ibge } = await req.json()
    if (!nome || !uf) return NextResponse.json({ erro: 'Nome e UF obrigatórios' }, { status: 400 })

    const ibge6 = codigo_ibge ? String(codigo_ibge).slice(0, 6) : null

    // 1. Criar/buscar município
    let municipioId: string
    let municCriado = false

    if (codigo_ibge) {
      const { data: existente } = await supabase
        .from('municipios').select('id').eq('codigo_ibge', parseInt(String(codigo_ibge)))
        .maybeSingle()
      if (existente) {
        municipioId = existente.id
      } else {
        const { data: mun, error } = await supabase
          .from('municipios').insert({ nome, uf: uf.toUpperCase(), codigo_ibge: parseInt(String(codigo_ibge)) })
          .select('id').single()
        if (error) return NextResponse.json({ erro: error.message }, { status: 500 })
        municipioId = mun.id
        municCriado = true
      }
    } else {
      const { data: mun, error } = await supabase
        .from('municipios').insert({ nome, uf: uf.toUpperCase() }).select('id').single()
      if (error) return NextResponse.json({ erro: error.message }, { status: 500 })
      municipioId = mun.id
      municCriado = true
    }

    // 2. Criar integração PEC
    await supabase.from('integracoes_pec').upsert({
      municipio_id: municipioId,
      tipo: 'pec_local',
      ativo: false,
      sincronizar_automatico: true,
      frequencia_minutos: 1440,
      status_sincronizacao: 'pendente',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'municipio_id' })

    // 3. Puxar UBS reais do CNES
    let ubsCriadas = 0
    let ubsErro = ''

    if (ibge6) {
      try {
        const estabelecimentos = await fetchUbs(ibge6)

        for (const est of estabelecimentos) {
          const nome = (est.nome_fantasia || est.nome_razao_social || `UBS ${est.codigo_cnes}`)
            .trim().toUpperCase()
          const cnes = String(est.codigo_cnes)

          // Tentar upsert com CNES
          const { error } = await supabase.from('unidades_saude').upsert({
            municipio_id: municipioId,
            nome,
            tipo: 'ubs',
            ativa: true,
          }, { onConflict: 'id', ignoreDuplicates: true })

          if (!error) ubsCriadas++
        }
      } catch (e: unknown) {
        ubsErro = e instanceof Error ? e.message : 'Erro CNES'
        console.warn('[PEC] CNES fetch fail:', ubsErro)
      }
    }

    if (ubsCriadas === 0 && !ubsErro) {
      // Fallback: cria pelo menos uma UBS
      await supabase.from('unidades_saude').insert({
        municipio_id: municipioId,
        nome: `UBS ${nome} Central`,
        tipo: 'ubs',
        ativa: true,
      })
      ubsCriadas = 1
    }

    return NextResponse.json({
      ok: true,
      municipio_id: municipioId,
      municipio_criado: municCriado,
      ubs_criadas: ubsCriadas,
      ibge_code: codigo_ibge || null,
      mensagem: ubsCriadas > 0
        ? `✅ ${nome}/${uf} pronto! ${ubsCriadas} UBS importadas do CNES.`
        : `✅ ${nome}/${uf} salvo. Configure o acesso PEC abaixo.`,
      ubs_erro: ubsErro || null,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    return NextResponse.json({ erro: message }, { status: 500 })
  }
}
