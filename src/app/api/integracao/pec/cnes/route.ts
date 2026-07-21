import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

const VPS_GATEWAY = 'http://23.106.45.137:3597/cnes'

/**
 * POST /api/integracao/pec/cnes
 * Body: { municipio_id, ibge_code }
 * Puxa UBS reais do CNES via VPS e salva no Supabase
 */
export async function POST(req: NextRequest) {
  try {
    const { municipio_id, ibge_code } = await req.json()
    if (!municipio_id || !ibge_code) {
      return NextResponse.json({ erro: 'municipio_id e ibge_code obrigatórios' }, { status: 400 })
    }

    const ibge6 = String(ibge_code).slice(0, 6)

    // Buscar UBS via VPS gateway
    let ubs: { cnes: string; nome: string; tipo: string }[] = []
    try {
      const res = await fetch(`${VPS_GATEWAY}/${ibge6}`, {
        signal: AbortSignal.timeout(20000),
      })
      if (res.ok) {
        const data = await res.json()
        ubs = data.ubs || []
      }
    } catch (e) {
      console.warn('[CNES] Gateway VPS offline:', e)
    }

    // Se o gateway falhar, tenta direto na API publica
    if (!ubs.length) {
      try {
        const tipos = [1, 2, 70]
        for (const tipo of tipos) {
          const url = `https://apidadosabertos.saude.gov.br/cnes/estabelecimentos?codigo_municipio=${ibge6}&codigo_tipo_unidade=${tipo}&limit=50`
          const res = await fetch(url, {
            headers: { Accept: 'application/json' },
            signal: AbortSignal.timeout(15000),
          })
          if (!res.ok) continue
          const data = await res.json()
          for (const e of data?.estabelecimentos || []) {
            if (e.codigo_cnes) {
              const nome = (e.nome_fantasia || e.nome_razao_social || '').trim().toUpperCase()
              if (nome) ubs.push({ cnes: String(e.codigo_cnes), nome, tipo: 'ubs' })
            }
          }
        }
      } catch {
        // Silencioso
      }
    }

    // Salvar no Supabase
    let criadas = 0

    if (ubs.length) {
      // Deletar UBS defaults genéricas antes de inserir as reais
      await supabase.from('unidades_saude').delete().eq('municipio_id', municipio_id)

      for (const u of ubs) {
        const { error } = await supabase.from('unidades_saude').insert({
          municipio_id,
          nome: u.nome,
          tipo: u.tipo,
          ativa: true,
        })

        if (!error) criadas++
      }
    }

    return NextResponse.json({
      ok: true,
      ubs_encontradas: ubs.length,
      ubs_criadas: criadas,
      mensagem: criadas > 0
        ? `✅ ${criadas} UBS importadas do CNES!`
        : '⚠️ Não foi possível acessar o CNES. Tente novamente.',
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro'
    return NextResponse.json({ erro: message }, { status: 500 })
  }
}
