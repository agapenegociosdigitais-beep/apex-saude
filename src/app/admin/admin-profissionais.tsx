'use client'

import { useEffect, useState, useCallback } from 'react'

interface M { id: string; nome: string; uf: string; unidades: U[] }
interface U { id: string; municipio_id: string; nome: string; tipo: string; ativa: boolean; equipes_count: number }
interface E { id: string; municipio_id: string; unidade_id: string; nome: string; tipo: string }

export default function AdminProfissionais() {
  const [usuarios, setUsuarios] = useState<Record<string, string>[]>([])
  const [municipios, setMunicipios] = useState<M[]>([])
  const [equipes, setEquipes] = useState<E[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showUserForm, setShowUserForm] = useState(false)
  const [editando, setEditando] = useState<string | null>(null)
  const [userForm, setUserForm] = useState({ email:'', nome:'', role:'profissional', municipio_id:'', unidade_id:'', equipe_id:'', perfil_id:'medico', password:'mudar123' })
  const [filtroUbs, setFiltroUbs] = useState('')

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const [ur, mr, er] = await Promise.all([fetch('/api/admin/usuarios'), fetch('/api/admin/municipios'), fetch('/api/admin/equipes')])
      if (ur.ok) setUsuarios((await ur.json()).data || [])
      if (mr.ok) setMunicipios((await mr.json()).data || [])
      if (er.ok) setEquipes((await er.json()).data || [])
    } catch {} finally { setLoading(false) }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    const method = editando ? 'PUT' : 'POST'
    const body = editando ? { id: editando, ...userForm } : userForm
    delete (body as Record<string,unknown>).password
    const res = await fetch('/api/admin/usuarios', { method, headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) })
    const j = await res.json()
    if (!res.ok) { alert(j.error || j.erro); setSaving(false); return }
    if (!editando) alert(`✅ Criado! Senha: ${j.senha}`)
    setShowUserForm(false); setEditando(null)
    setUserForm({ email:'', nome:'', role:'profissional', municipio_id:'', unidade_id:'', equipe_id:'', perfil_id:'medico', password:'mudar123' })
    carregar(); setSaving(false)
  }

  const editar = (u: Record<string, string>) => {
    setUserForm({ email:u.email, nome:u.nome, role:u.role, municipio_id:u.municipio_id, unidade_id:u.unidade_id||'', equipe_id:u.equipe_id||'', perfil_id:u.perfil_id, password:'' })
    setEditando(u.id)
    setShowUserForm(true)
  }

  const excluir = async (id: string) => { if(!confirm('Excluir profissional?')) return; await fetch(`/api/admin/usuarios?id=${id}`,{method:'DELETE'}); carregar() }

  const filtrados = usuarios.filter(u => !filtroUbs || u.unidade_id === filtroUbs)

  return (
    <section>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold text-apex-ink">Profissionais</h2>
          <p className="text-apex-muted mt-1">Cadastro de usuários do sistema por UBS e equipe.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <select value={filtroUbs} onChange={e => setFiltroUbs(e.target.value)}
            className="appearance-none bg-white border border-gray-200 text-sm rounded-lg px-4 py-2.5 shadow-sm">
            <option value="">Todas as UBS</option>
            {municipios.flatMap(m => m.unidades).map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
          </select>
          <button onClick={() => { setEditando(null); setShowUserForm(true) }}
            className="bg-apex-gold text-white font-semibold text-sm px-6 py-2.5 rounded-lg hover:bg-amber-600 transition-colors shadow-sm flex items-center gap-2">
            <span>+</span> Novo
          </button>
        </div>
      </div>

      {showUserForm && (
        <form onSubmit={salvar} className="mb-6 rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">{editando ? 'Editar Profissional' : 'Novo Profissional'}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">Nome *<input value={userForm.nome} onChange={e => setUserForm({...userForm, nome:e.target.value})} className="rounded-md border px-3 py-2" required /></label>
            <label className="flex flex-col gap-1 text-sm">Email *<input type="email" value={userForm.email} onChange={e => setUserForm({...userForm, email:e.target.value})} className="rounded-md border px-3 py-2" required /></label>
            <label className="flex flex-col gap-1 text-sm">Cargo
              <select value={userForm.perfil_id} onChange={e => setUserForm({...userForm, perfil_id:e.target.value})} className="rounded-md border px-3 py-2">
                {['medico','enfermeiro','tecnico','acs','dentista','psicologo','nutricionista','fisioterapeuta','farmaceutico','assistente_social','coordenador','gestor'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">Nível
              <select value={userForm.role} onChange={e => setUserForm({...userForm, role:e.target.value})} className="rounded-md border px-3 py-2">
                <option value="profissional">Profissional</option><option value="coordenador">Coordenador</option><option value="gestor">Gestor</option><option value="admin">Admin</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">Município *
              <select value={userForm.municipio_id} onChange={e => setUserForm({...userForm, municipio_id:e.target.value, unidade_id:'', equipe_id:''})} className="rounded-md border px-3 py-2" required>
                <option value="">Selecione...</option>{municipios.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">UBS *
              <select value={userForm.unidade_id} onChange={e => setUserForm({...userForm, unidade_id:e.target.value, equipe_id:''})} className="rounded-md border px-3 py-2" required>
                <option value="">Selecione...</option>
                {(municipios.find(m => m.id === userForm.municipio_id)?.unidades||[]).map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">Equipe
              <select value={userForm.equipe_id} onChange={e => setUserForm({...userForm, equipe_id:e.target.value})} className="rounded-md border px-3 py-2">
                <option value="">Nenhuma</option>
                {equipes.filter(e => e.unidade_id === userForm.unidade_id).map(e => <option key={e.id} value={e.id}>{e.nome} ({e.tipo})</option>)}
              </select>
            </label>
            {!editando && <label className="flex flex-col gap-1 text-sm">Senha inicial<input value={userForm.password} onChange={e => setUserForm({...userForm, password:e.target.value})} className="rounded-md border px-3 py-2" /></label>}
          </div>
          <div className="mt-4 flex gap-3">
            <button type="submit" disabled={saving} className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">{editando ? 'Atualizar' : 'Salvar'}</button>
            <button type="button" onClick={() => { setShowUserForm(false); setEditando(null) }} className="rounded-lg border px-5 py-2 text-sm text-gray-500">Cancelar</button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left font-semibold text-xs tracking-wider text-apex-muted uppercase">Nome</th>
              <th className="p-4 text-left font-semibold text-xs tracking-wider text-apex-muted uppercase">Email</th>
              <th className="p-4 text-left font-semibold text-xs tracking-wider text-apex-muted uppercase">Cargo</th>
              <th className="p-4 text-left font-semibold text-xs tracking-wider text-apex-muted uppercase">Nível</th>
              <th className="p-4 text-left font-semibold text-xs tracking-wider text-apex-muted uppercase">UBS</th>
              <th className="p-4 text-left font-semibold text-xs tracking-wider text-apex-muted uppercase">Equipe</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtrados.map(u => {
              const ubs = municipios.flatMap(m => m.unidades).find(ub => ub.id === u.unidade_id)
              const eq = equipes.find(e => e.id === u.equipe_id)
              return (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-apex-ink">{u.nome}</td>
                  <td className="p-4 text-xs text-apex-muted">{u.email}</td>
                  <td className="p-4 text-xs">{u.perfil_id}</td>
                  <td className="p-4"><span className="text-xs rounded bg-gray-100 px-2 py-0.5 font-semibold">{u.role}</span></td>
                  <td className="p-4 text-xs text-apex-muted">{ubs?.nome||'—'}</td>
                  <td className="p-4 text-xs text-apex-muted">{eq?.nome||'—'}</td>
                  <td className="p-4 flex gap-1">
                    <button onClick={() => editar(u)} className="text-xs text-blue-500 hover:text-blue-700">✏️</button>
                    <button onClick={() => excluir(u.id)} className="text-xs text-red-400 hover:text-red-600">🗑️</button>
                  </td>
                </tr>
              )
            })}
            {filtrados.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-gray-400">Nenhum profissional cadastrado.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  )
}
