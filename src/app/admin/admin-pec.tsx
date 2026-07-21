'use client'

import { useEffect, useState, useCallback } from 'react'

interface M { id: string; nome: string; uf: string; codigo_ibge: number | null }
interface Cidade { nome: string; ibge: number }

const ESTADOS = [
  { sigla:'AC', nome:'Acre' },{ sigla:'AL', nome:'Alagoas' },{ sigla:'AP', nome:'Amapá' },{ sigla:'AM', nome:'Amazonas' },
  { sigla:'BA', nome:'Bahia' },{ sigla:'CE', nome:'Ceará' },{ sigla:'DF', nome:'Distrito Federal' },{ sigla:'ES', nome:'Espírito Santo' },
  { sigla:'GO', nome:'Goiás' },{ sigla:'MA', nome:'Maranhão' },{ sigla:'MT', nome:'Mato Grosso' },{ sigla:'MS', nome:'Mato Grosso do Sul' },
  { sigla:'MG', nome:'Minas Gerais' },{ sigla:'PA', nome:'Pará' },{ sigla:'PB', nome:'Paraíba' },{ sigla:'PR', nome:'Paraná' },
  { sigla:'PE', nome:'Pernambuco' },{ sigla:'PI', nome:'Piauí' },{ sigla:'RJ', nome:'Rio de Janeiro' },{ sigla:'RN', nome:'Rio Grande do Norte' },
  { sigla:'RS', nome:'Rio Grande do Sul' },{ sigla:'RO', nome:'Rondônia' },{ sigla:'RR', nome:'Roraima' },{ sigla:'SC', nome:'Santa Catarina' },
  { sigla:'SP', nome:'São Paulo' },{ sigla:'SE', nome:'Sergipe' },{ sigla:'TO', nome:'Tocantins' },
]

export default function AdminPec() {
  const [municipios, setMunicipios] = useState<M[]>([])
  const [loading, setLoading] = useState(true)
  const [pecForms, setPecForms] = useState<Record<string, Record<string, string>>>({})
  const [pecStatus, setPecStatus] = useState<Record<string, string>>({})

  // Novo município
  const [novoUf, setNovoUf] = useState('')
  const [buscaCidade, setBuscaCidade] = useState('')
  const [cidades, setCidades] = useState<Cidade[]>([])
  const [cidadeSelecionada, setCidadeSelecionada] = useState<Cidade | null>(null)
  const [preparando, setPreparando] = useState(false)
  const [prepararMsg, setPrepararMsg] = useState('')

  useEffect(() => {
    if (!novoUf || novoUf.length !== 2) { setCidades([]); return }
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${novoUf}/municipios`)
      .then(r => r.json()).then((d: { nome: string; id: number }[]) => {
        setCidades(d.map(c => ({ nome: c.nome, ibge: c.id })))
      }).catch(() => setCidades([]))
  }, [novoUf])

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/municipios')
      if (res.ok) setMunicipios((await res.json()).data || [])
    } catch {} finally { setLoading(false) }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const prepararCidade = async () => {
    if (!cidadeSelecionada || !novoUf) return
    setPreparando(true)
    setPrepararMsg('')
    try {
      const res = await fetch('/api/integracao/pec/preparar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: cidadeSelecionada.nome,
          uf: novoUf,
          codigo_ibge: String(cidadeSelecionada.ibge),
        }),
      })
      const j = await res.json()
      if (j.ok) {
        setPrepararMsg(j.mensagem)
        setNovoUf(''); setBuscaCidade(''); setCidadeSelecionada(null)
        carregar()
      } else {
        setPrepararMsg(`❌ ${j.erro || 'Erro desconhecido'}`)
      }
    } catch {
      setPrepararMsg('❌ Falha de rede')
    } finally { setPreparando(false) }
  }

  const testar = async (municipio_id: string) => {
    const pf = pecForms[municipio_id] || { host:'', porta:'5432', database:'esus', usuario:'', senha:'', ativo:'false' }
    setPecStatus(s => ({...s, [municipio_id]: 'Testando...'}))
    try {
      const res = await fetch('/api/integracao/pec/config', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ municipio_id, ...pf })
      })
      const j = await res.json()
      setPecStatus(s => ({...s, [municipio_id]: j.ok ? '✅ Conectado!' : '❌ '+j.erro}))
    } catch { setPecStatus(s => ({...s, [municipio_id]: '❌ Falha de rede'})) }
  }

  const salvar = async (municipio_id: string) => {
    const pf = pecForms[municipio_id] || { host:'', porta:'5432', database:'esus', usuario:'', senha:'', ativo:'false' }
    setPecStatus(s => ({...s, [municipio_id]: 'Salvando...'}))
    await fetch('/api/integracao/pec/config', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ municipio_id, ...pf })
    })
    setPecStatus(s => ({...s, [municipio_id]: '✅ Salvo!'}))
  }

  const sincronizar = async (municipio_id: string) => {
    setPecStatus(s => ({...s, [municipio_id]: 'Sincronizando...'}))
    const res = await fetch('/api/integracao/pec/sincronizar', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ municipio_id })
    })
    const j = await res.json()
    setPecStatus(s => ({...s, [municipio_id]: j.sucesso ? `✅ ${j.resultados?.length || 0} equipes` : '❌ '+j.erro}))
  }

  return (
    <section>
      {/* Cabeçalho */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-apex-ink">🔌 Integração PEC</h2>
        <p className="text-apex-muted mt-1">Prepare municípios e configure a conexão com o banco PEC.</p>
      </div>

      {/* ─── ADICIONAR CIDADE ─── */}
      <div className="rounded-xl border-2 border-dashed border-apex-gold/40 bg-apex-gold/5 p-6 mb-8">
        <h3 className="text-lg font-semibold text-apex-ink mb-1">➕ Adicionar Cidade</h3>
        <p className="text-sm text-apex-muted mb-5">
          Cria o município, prepara a estrutura de integração e deixa tudo pronto para receber os dados do PEC.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <label className="flex flex-col gap-1 text-sm min-w-[160px]">
            Estado
            <select
              value={novoUf}
              onChange={e => { setNovoUf(e.target.value); setBuscaCidade(''); setCidadeSelecionada(null) }}
              className="rounded-md border px-3 py-2"
            >
              <option value="">Selecione...</option>
              {ESTADOS.map(e => <option key={e.sigla} value={e.sigla}>{e.sigla} — {e.nome}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm flex-1">
            Cidade
            <select
              value={cidadeSelecionada?.ibge || ''}
              onChange={e => {
                const ibge = parseInt(e.target.value)
                const cid = cidades.find(c => c.ibge === ibge)
                setCidadeSelecionada(cid || null)
              }}
              className="rounded-md border px-3 py-2 w-full"
              disabled={!novoUf || cidades.length === 0}
            >
              <option value="">
                {!novoUf ? 'Selecione o estado primeiro' : cidades.length === 0 ? 'Carregando...' : 'Selecione a cidade...'}
              </option>
              {cidades.map(c => (
                <option key={c.ibge} value={c.ibge}>{c.nome}</option>
              ))}
            </select>
          </label>
          <button
            onClick={prepararCidade}
            disabled={!cidadeSelecionada || preparando}
            className="bg-apex-gold text-apex-ink font-semibold px-6 py-2.5 rounded-lg hover:bg-apex-gold/90 transition-colors disabled:opacity-50 shadow-sm whitespace-nowrap"
          >
            {preparando ? 'Preparando...' : '🚀 Preparar Cidade'}
          </button>
        </div>
        {prepararMsg && (
          <p className="mt-3 text-sm font-medium text-apex-ink bg-apex-gold/10 rounded-lg px-3 py-2 border border-apex-gold/20">
            {prepararMsg}
          </p>
        )}
      </div>

      {/* ─── LISTA DE MUNICÍPIOS ─── */}
      {loading ? (
        <p className="text-center text-gray-500 py-8">Carregando...</p>
      ) : municipios.length === 0 ? (
        <p className="text-center text-gray-400 py-8">Nenhum município cadastrado. Adicione uma cidade acima.</p>
      ) : (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-apex-ink">Municípios Configurados</h3>
          {municipios.map(mun => {
            const pf = pecForms[mun.id] || { host:'', porta:'5432', database:'esus', usuario:'', senha:'', ativo:'false' }
            const st = pecStatus[mun.id] || ''
            return (
              <div key={mun.id} className="rounded-xl border bg-white shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-apex-ink">
                    {mun.nome} — {mun.uf}
                    {mun.codigo_ibge && <span className="text-xs text-gray-400 ml-2">IBGE: {mun.codigo_ibge}</span>}
                  </h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500">
                    Aguardando acesso PEC
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1 mb-4">
                  Configure os dados do banco PEC quando o TI da prefeitura liberar o acesso.
                </p>
                <div className="grid gap-4 sm:grid-cols-3">
                  {(['host','porta','database','usuario','senha'] as const).map(campo => (
                    <label key={campo} className="flex flex-col gap-1 text-sm">
                      {campo==='host'?'Host/IP':campo==='porta'?'Porta':campo==='database'?'Database':campo==='usuario'?'Usuário':'Senha'}
                      <input
                        type={campo==='senha'?'password':'text'}
                        value={pf[campo]||''}
                        onChange={e => setPecForms(f => ({...f, [mun.id]: {...pf, [campo]:e.target.value}}))}
                        className="rounded-md border px-3 py-2"
                        placeholder={campo==='host'?'192.168.1.100':campo==='porta'?'5432':campo==='database'?'esus':''}
                      />
                    </label>
                  ))}
                </div>
                <div className="mt-4 flex gap-3 items-center flex-wrap">
                  <button onClick={() => testar(mun.id)}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 shadow-sm">
                    🔍 Testar Conexão
                  </button>
                  <button onClick={() => salvar(mun.id)}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 shadow-sm">
                    💾 Salvar Config
                  </button>
                  <button onClick={() => sincronizar(mun.id)}
                    className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 shadow-sm">
                    🔄 Sincronizar
                  </button>
                  {st && <span className="text-sm font-medium text-apex-ink">{st}</span>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
