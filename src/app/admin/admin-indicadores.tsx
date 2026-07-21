'use client'

import { useEffect, useState, useCallback } from 'react'

interface Ind { id: string; codigo: string; nome: string; grupo: string; peso: number; meta: number; invertido: boolean; escala10: boolean }
interface M { id: string; nome: string; uf: string }

export default function AdminIndicadores() {
  const [indicadores, setIndicadores] = useState<Ind[]>([])
  const [municipios, setMunicipios] = useState<M[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingInd, setEditingInd] = useState<Ind | null>(null)
  const [indForm, setIndForm] = useState({ peso:0, meta:0 })
  const [filtroMunicipio, setFiltroMunicipio] = useState('')

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const [ir, mr] = await Promise.all([fetch('/api/admin/indicadores'), fetch('/api/admin/municipios')])
      if (ir.ok) setIndicadores((await ir.json()).data || [])
      if (mr.ok) setMunicipios((await mr.json()).data || [])
    } catch {} finally { setLoading(false) }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const saveInd = async (e: React.FormEvent) => { e.preventDefault(); setSaving(true)
    await fetch('/api/admin/indicadores', { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ id:editingInd!.id, ...indForm }) })
    setEditingInd(null); carregar(); setSaving(false)
  }

  const editInd = (ind: Ind) => { setEditingInd(ind); setIndForm({ peso:ind.peso, meta:ind.meta }) }

  return (
    <section>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold text-apex-ink">Indicadores</h2>
          <p className="text-apex-muted mt-1">Configuração de metas e pesos para os 15 indicadores oficiais.</p>
        </div>
        <select value={filtroMunicipio} onChange={e => setFiltroMunicipio(e.target.value)}
          className="appearance-none bg-white border border-gray-200 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-apex-gold min-w-[200px] shadow-sm">
          <option value="">Todas as cidades</option>
          {municipios.map(m => <option key={m.id} value={m.id}>{m.nome} — {m.uf}</option>)}
        </select>
      </div>

      {editingInd && (
        <form onSubmit={saveInd} className="mb-6 rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Editar: {editingInd.codigo} — {editingInd.nome}</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">Peso <input type="number" value={indForm.peso} onChange={e => setIndForm({...indForm, peso:parseInt(e.target.value)})} className="rounded-md border px-3 py-2" /></label>
            <label className="flex flex-col gap-1 text-sm">Meta {editingInd.escala10 ? '(0-10)' : '(%)'} <input type="number" step="0.1" value={indForm.meta} onChange={e => setIndForm({...indForm, meta:parseFloat(e.target.value)})} className="rounded-md border px-3 py-2" /></label>
          </div>
          <div className="mt-4 flex gap-3">
            <button type="submit" disabled={saving} className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white">Salvar</button>
            <button type="button" onClick={() => setEditingInd(null)} className="rounded-lg border px-5 py-2 text-sm text-gray-500">Cancelar</button>
          </div>
        </form>
      )}

      {loading ? <p className="text-center text-gray-500 py-8">Carregando...</p> :
        <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left font-semibold text-xs tracking-wider text-apex-muted uppercase">Código</th>
                <th className="p-4 text-left font-semibold text-xs tracking-wider text-apex-muted uppercase">Nome</th>
                <th className="p-4 text-left font-semibold text-xs tracking-wider text-apex-muted uppercase">Grupo</th>
                <th className="p-4 text-center font-semibold text-xs tracking-wider text-apex-muted uppercase">Peso</th>
                <th className="p-4 text-center font-semibold text-xs tracking-wider text-apex-muted uppercase">Meta</th>
                <th className="p-4 text-center font-semibold text-xs tracking-wider text-apex-muted uppercase">Inv.</th>
                <th className="p-4 text-right font-semibold text-xs tracking-wider text-apex-muted uppercase">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {indicadores.map(ind => (
                <tr key={ind.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="p-4 font-mono font-semibold text-apex-ink">{ind.codigo}</td>
                  <td className="p-4 text-apex-ink">{ind.nome}</td>
                  <td className="p-4 text-xs text-apex-muted capitalize">{ind.grupo}</td>
                  <td className="p-4 text-center text-apex-ink">{ind.peso}</td>
                  <td className="p-4 text-center text-apex-ink">{ind.meta}{ind.escala10?'':'%'}</td>
                  <td className="p-4 text-center">{ind.invertido ? '↓' : '↑'}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => editInd(ind)}
                      className="text-apex-gold hover:text-amber-600 transition-colors opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-amber-50">✏️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      }
    </section>
  )
}
