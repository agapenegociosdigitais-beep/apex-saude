'use client'

import { useEffect, useState, useCallback } from 'react'

interface E { id: string; municipio_id: string; unidade_id: string; codigo_ine: string; nome: string; tipo: string; ativa: boolean; unidades_saude?: { nome: string } | null }
interface M { id: string; nome: string; uf: string; unidades: U[] }
interface U { id: string; municipio_id: string; nome: string; tipo: string; ativa: boolean; equipes_count: number }

export default function AdminEquipes() {
  const [equipes, setEquipes] = useState<E[]>([])
  const [municipios, setMunicipios] = useState<M[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showEquipeForm, setShowEquipeForm] = useState(false)
  const [equipeForm, setEquipeForm] = useState({ municipio_id:'', unidade_id:'', nome:'', tipo:'esf', codigo_ine:'' })
  const [unidadesPorMun, setUnidadesPorMun] = useState<U[]>([])
  const [filtroMunicipio, setFiltroMunicipio] = useState('')

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const [er, mr] = await Promise.all([fetch('/api/admin/equipes'), fetch('/api/admin/municipios')])
      if (er.ok) setEquipes((await er.json()).data || [])
      if (mr.ok) setMunicipios((await mr.json()).data || [])
    } catch {} finally { setLoading(false) }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  useEffect(() => {
    if (equipeForm.municipio_id) {
      setUnidadesPorMun(municipios.find(m => m.id === equipeForm.municipio_id)?.unidades || [])
    }
  }, [equipeForm.municipio_id, municipios])

  const saveEquipe = async (e: React.FormEvent) => { e.preventDefault(); setSaving(true)
    await fetch('/api/admin/equipes', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(equipeForm) })
    setShowEquipeForm(false); setEquipeForm({ municipio_id:'', unidade_id:'', nome:'', tipo:'esf', codigo_ine:'' }); carregar(); setSaving(false)
  }

  const deleteEquipe = async (id: string) => { if(!confirm('Excluir equipe?')) return; await fetch(`/api/admin/equipes?id=${id}`, { method:'DELETE' }); carregar() }

  const filtradas = equipes.filter(e => !filtroMunicipio || e.municipio_id === filtroMunicipio)

  return (
    <section>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold text-apex-ink">Equipes</h2>
          <p className="text-apex-muted mt-1">Gestão de equipes de saúde da família e multiprofissionais.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <select value={filtroMunicipio} onChange={e => setFiltroMunicipio(e.target.value)}
            className="appearance-none bg-white border border-gray-200 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-apex-gold min-w-[200px] shadow-sm">
            <option value="">Todos os municípios</option>
            {municipios.map(m => <option key={m.id} value={m.id}>{m.nome} — {m.uf}</option>)}
          </select>
          <button onClick={() => setShowEquipeForm(true)}
            className="bg-apex-gold text-white font-semibold text-sm px-6 py-2.5 rounded-lg hover:bg-amber-600 transition-colors shadow-sm flex items-center justify-center gap-2">
            <span>+</span> Nova Equipe
          </button>
        </div>
      </div>

      {showEquipeForm && (
        <form onSubmit={saveEquipe} className="mb-6 rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Nova Equipe</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">Município *
              <select value={equipeForm.municipio_id} onChange={e => setEquipeForm({...equipeForm, municipio_id:e.target.value, unidade_id:''})} className="rounded-md border px-3 py-2" required>
                <option value="">Selecione...</option>
                {municipios.map(m => <option key={m.id} value={m.id}>{m.nome} - {m.uf}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">Unidade de Saúde *
              <select value={equipeForm.unidade_id} onChange={e => setEquipeForm({...equipeForm, unidade_id:e.target.value})} className="rounded-md border px-3 py-2" required>
                <option value="">Selecione...</option>
                {unidadesPorMun.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">Nome *<input value={equipeForm.nome} onChange={e => setEquipeForm({...equipeForm, nome:e.target.value})} className="rounded-md border px-3 py-2" placeholder="eSF Centro" required /></label>
            <label className="flex flex-col gap-1 text-sm">Tipo *
              <select value={equipeForm.tipo} onChange={e => setEquipeForm({...equipeForm, tipo:e.target.value})} className="rounded-md border px-3 py-2">
                <option value="esf">eSF — Saúde da Família</option><option value="esb">eSB — Saúde Bucal</option><option value="emulti">eMulti — Multiprofissional</option><option value="eap">eAP — Atenção Primária</option>
              </select>
            </label>
          </div>
          <div className="mt-4 flex gap-3">
            <button type="submit" disabled={saving} className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">Salvar</button>
            <button type="button" onClick={() => setShowEquipeForm(false)} className="rounded-lg border px-5 py-2 text-sm text-gray-500">Cancelar</button>
          </div>
        </form>
      )}

      {loading ? <p className="text-center text-gray-500 py-8">Carregando...</p> : filtradas.length === 0 ? <p className="text-center text-gray-400 py-8">Nenhuma equipe cadastrada.</p> :
        <div className="space-y-3">
          {filtradas.map(eq => (
            <div key={eq.id} className="group bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <h3 className="font-semibold text-apex-ink">{eq.nome}</h3>
                  <div className="flex items-center gap-3">
                    <span className="bg-gray-100 text-gray-500 text-[10px] font-semibold px-2 py-0.5 rounded tracking-wider">{eq.tipo.toUpperCase()}</span>
                    {eq.unidades_saude?.nome && <span className="text-sm text-apex-muted">· {eq.unidades_saude.nome}</span>}
                  </div>
                </div>
              </div>
              <button onClick={() => deleteEquipe(eq.id)}
                className="text-gray-300 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50 opacity-0 group-hover:opacity-100 focus:opacity-100">
                <span>🗑️</span>
              </button>
            </div>
          ))}
          <div className="flex items-center justify-between border-t pt-4 mt-4">
            <p className="text-sm text-apex-muted">Mostrando <span className="font-medium text-apex-ink">{filtradas.length}</span> de <span className="font-medium text-apex-ink">{equipes.length}</span> equipes</p>
          </div>
        </div>
      }
    </section>
  )
}
