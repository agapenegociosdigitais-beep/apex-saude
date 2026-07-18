import { NextResponse } from 'next/server'
import { criarClienteSupabase } from '@/lib/supabase/server'
import { sincronizarMunicipio } from '@/lib/pec-connector/sync'
import { IntegracaoPecConfig } from '@/lib/pec-connector/types'

export async function POST() {
  try {
    const supabase = await criarClienteSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ erro: 'Nao autorizado' }, { status: 401 })

    const { data: usuario } = await supabase.from('usuarios').select('municipio_id,role').eq('id', user.id).single()
    if (!usuario || !['coordenador','gestor','admin'].includes(usuario.role)) {
      return NextResponse.json({ erro: 'Permissao negada' }, { status: 403 })
    }

    const { data: config } = await supabase.from('integracoes_pec').select('*').eq('municipio_id', usuario.municipio_id).single()
    if (!config || !config.ativo) return NextResponse.json({ erro: 'Integracao PEC nao configurada' }, { status: 400 })

    const { data: equipes } = await supabase.from('equipes').select('codigo_ine').eq('municipio_id', usuario.municipio_id).eq('ativa', true)
    if (!equipes?.length) return NextResponse.json({ erro: 'Nenhuma equipe encontrada' }, { status: 400 })

    const equipesInes = equipes.map(e => e.codigo_ine).filter(Boolean) as string[]

    await supabase.from('integracoes_pec').update({ status_sincronizacao: 'rodando' }).eq('id', config.id)

    const resultados = await sincronizarMunicipio(config as IntegracaoPecConfig, equipesInes)

    await supabase.from('integracoes_pec').update({
      ultima_sincronizacao: new Date().toISOString(),
      status_sincronizacao: resultados.some(r => r.status === 'falha') ? 'falha' : 'ok',
      erro_ultima: resultados.filter(r => r.status === 'falha').map(r => r.erros.join('; ')).join(' | ') || null,
    }).eq('id', config.id)

    await supabase.from('auditoria_log').insert({
      usuario_id: user.id, municipio_id: usuario.municipio_id,
      acao: 'sync_pec', tabela: 'valores_indicadores',
      dados_novos: { equipes: equipesInes.length, atualizados: resultados.reduce((s,r) => s + r.total_atualizados, 0) },
    })

    return NextResponse.json({ sucesso: true, resultados })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    console.error('[PEC API] Erro:', message)
    return NextResponse.json({ erro: message }, { status: 500 })
  }
}
