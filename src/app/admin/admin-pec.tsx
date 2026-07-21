'use client'

import { useEffect, useState, useCallback } from 'react'

interface M { id: string; nome: string; uf: string }

export default function AdminPec() {
  const [municipios, setMunicipios] = useState<M[]>([])
  const [loading, setLoading] = useState(true)
  const [pecForms, setPecForms] = useState<Record<string, Record<string, string>>>({})
  const [pecStatus, setPecStatus] = useState<Record<string, string>>({})

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/municipios')
      if (res.ok) setMunicipios((await res.json()).data || [])
    } catch {} finally { setLoading(false) }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const testar = async (municipio_id: string) => {
    const pf = pecForms[municipio_id] || { host:'', porta:'5432', database:'esus', usuario:'', senha:'', ativo:'false' }
    setPecStatus(s => ({...s, [municipio_id]: 'Testando...'}))
    try {
      const res = await fetch('/api/integracao/pec/config', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ municipio_id, ...pf }) })
      const j = await res.json()
      setPecStatus(s => ({...s, [municipio_id]: j.ok?'✅ Conectado!':'❌ '+j.error}))
    } catch { setPecStatus(s => ({...s, [municipio_id]: '❌ Falha de rede'})) }
  }

  const salvar = async (municipio_id: string) => {
    const pf = pecForms[municipio_id] || { host:'', porta:'5432', database:'esus', usuario:'', senha:'', ativo:'false' }
    setPecStatus(s => ({...s, [municipio_id]: 'Salvando...'}))
    await fetch('/api/integracao/pec/config', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ municipio_id, ...pf }) })
    setPecStatus(s => ({...s, [municipio_id]: '✅ Salvo!'}))
  }

  const sincronizar = async (municipio_id: string) => {
    setPecStatus(s => ({...s, [municipio_id]: 'Sincronizando...'}))
    const res = await fetch('/api/integracao/pec/sincronizar', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ municipio_id }) })
    const j = await res.json()
    setPecStatus(s => ({...s, [municipio_id]: j.ok?`✅ ${j.total||0} registros`:'❌ '+j.error}))
  }

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-apex-ink">🔌 Integração PEC</h2>
        <p className="text-apex-muted mt-1">Configure a conexão com o banco do Prontuário Eletrônico para sincronizar dados.</p>
      </div>

      {loading ? <p className="text-center text-gray-500 py-8">Carregando...</p> : municipios.length === 0 ? <p className="text-center text-gray-400 py-8">Nenhum município cadastrado.</p> :
        <div className="space-y-4">
          {municipios.map(mun => {
            const pf = pecForms[mun.id] || { host:'', porta:'5432', database:'esus', usuario:'', senha:'', ativo:'false' }
            const st = pecStatus[mun.id] || ''
            return (
              <div key={mun.id} className="rounded-xl border bg-white shadow-sm p-6">
                <h3 className="text-lg font-semibold text-apex-ink">{mun.nome} — {mun.uf}</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  {(['host','porta','database','usuario','senha'] as const).map(campo => (
                    <label key={campo} className="flex flex-col gap-1 text-sm">
                      {campo==='host'?'Host/IP':campo==='porta'?'Porta':campo==='database'?'Database':campo==='usuario'?'Usuário':'Senha'}
                      <input type={campo==='senha'?'password':'text'} value={pf[campo]||''}
                        onChange={e => setPecForms(f => ({...f, [mun.id]: {...pf, [campo]:e.target.value}}))}
                        className="rounded-md border px-3 py-2" placeholder={campo==='host'?'192.168.1.100':campo==='porta'?'5432':campo==='database'?'esus':''} />
                    </label>
                  ))}
                </div>
                <div className="mt-4 flex gap-3 items-center flex-wrap">
                  <button onClick={() => testar(mun.id)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 shadow-sm">🔍 Testar Conexão</button>
                  <button onClick={() => salvar(mun.id)} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 shadow-sm">💾 Salvar Configuração</button>
                  <button onClick={() => sincronizar(mun.id)} className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 shadow-sm">🔄 Sincronizar Agora</button>
                  {st && <span className="text-sm font-medium text-apex-ink">{st}</span>}
                </div>
              </div>
            )
          })}
        </div>
      }
    </section>
  )
}
