'use client'

import { useEffect, useState } from 'react'
import { AppShell } from '@/components/app-shell'
import { useUser } from '@/lib/hooks/useUser'

interface Prof {
  id: string; nome: string; email: string; role: string; perfil_id: string;
  unidade_nome?: string; unidade_id?: string; equipe_id?: string; municipio_id?: string;
}
interface Ubs { id: string; nome: string }
interface Equipe { id: string; nome: string; tipo: string; unidade_id: string }

const PERFIS = ['medico','enfermeiro','tecnico','acs','dentista','psicologo','nutricionista','fisioterapeuta','farmaceutico','assistente_social','coordenador']
const ROLES_GESTOR = ['profissional','coordenador'] // gestor nunca cria/edita admin nem gestor

export default function ProfissionaisPage() {
  const user = useUser()
  const [profs, setProfs] = useState<Prof[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [ubs, setUbs] = useState<Ubs[]>([])
  const [equipes, setEquipes] = useState<Equipe[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editando, setEditando] = useState<Prof | null>(null)
  const [form, setForm] = useState({ email:'', nome:'', perfil_id:'medico', role:'profissional', unidade_id:'', equipe_id:'', password:'mudar123' })

  const ehGestor = user.role === 'gestor'

  const carregar = async () => {
    if (!user.municipio_id) return
    setLoading(true)
    const [pr,un,eq] = await Promise.all([
      fetch(`/api/admin/usuarios?municipio_id=${user.municipio_id}`).then(r=>r.json()),
      fetch(`/api/admin/unidades?municipio_id=${user.municipio_id}`).then(r=>r.json()),
      fetch(`/api/admin/equipes?municipio_id=${user.municipio_id}`).then(r=>r.json()),
    ])
    setProfs(pr.data||[]); setUbs(un.data||[]); setEquipes(eq.data||[])
    setLoading(false)
  }

  useEffect(() => { carregar() }, [user.municipio_id])

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    if (editando) {
      // Editar
      const res = await fetch('/api/admin/usuarios', {
        method:'PUT', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ id:editando.id, nome:form.nome, email:form.email, perfil_id:form.perfil_id, role:form.role, unidade_id:form.unidade_id, equipe_id:form.equipe_id||null })
      })
      if (!res.ok) { alert((await res.json()).error); setSaving(false); return }
    } else {
      // Criar
      const res = await fetch('/api/admin/usuarios', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ ...form, municipio_id:user.municipio_id })
      })
      const j = await res.json()
      if (!res.ok) { alert(j.error||j.erro); setSaving(false); return }
      alert(`✅ Criado! Senha: ${j.senha}`)
    }
    setShowForm(false); setEditando(null)
    setForm({ email:'', nome:'', perfil_id:'medico', role:'profissional', unidade_id:'', equipe_id:'', password:'mudar123' })
    carregar()
    setSaving(false)
  }

  const editar = (p: Prof) => {
    setForm({ email:p.email, nome:p.nome, perfil_id:p.perfil_id, role:p.role, unidade_id:p.unidade_id||'', equipe_id:p.equipe_id||'', password:'' })
    setEditando(p); setShowForm(true)
  }

  const excluir = async (id: string) => {
    if (!confirm('Excluir profissional?')) return
    await fetch(`/api/admin/usuarios?id=${id}`, { method:'DELETE' })
    carregar()
  }

  const roleLabel = (r: string) => ({ admin:'Admin', gestor:'Gestor', coordenador:'Coordenador', profissional:'Profissional' } as Record<string,string>)[r] || r
  const perfilLabel = (p: string) => p ? p.charAt(0).toUpperCase() + p.slice(1) : '-'

  return (
    <AppShell active="profissionais">
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-on-background">👥 Profissionais</h2>
            <p className="text-sm text-on-surface-variant">{user.municipio_nome}</p>
          </div>
          <button onClick={() => { setEditando(null); setShowForm(true) }}
            className="bg-apex-gold text-white font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-amber-600 shadow-sm">+ Novo</button>
        </div>

        {showForm && (
          <form onSubmit={salvar} className="mb-6 rounded-xl border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">{editando ? 'Editar Profissional' : 'Novo Profissional'}</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm">Nome *<input value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})} className="rounded-md border px-3 py-2" required /></label>
              <label className="flex flex-col gap-1 text-sm">Email *<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="rounded-md border px-3 py-2" required /></label>
              <label className="flex flex-col gap-1 text-sm">Cargo
                <select value={form.perfil_id} onChange={e=>setForm({...form,perfil_id:e.target.value})} className="rounded-md border px-3 py-2">
                  {PERFIS.map(p=><option key={p} value={p}>{p}</option>)}
                </select>
              </label>
              {ehGestor && editando && (
                <label className="flex flex-col gap-1 text-sm">Nível
                  <select value={form.role} onChange={e=>setForm({...form,role:e.target.value})} className="rounded-md border px-3 py-2">
                    {ROLES_GESTOR.map(r=><option key={r} value={r}>{roleLabel(r)}</option>)}
                  </select>
                </label>
              )}
              <label className="flex flex-col gap-1 text-sm">UBS
                <select value={form.unidade_id} onChange={e=>setForm({...form,unidade_id:e.target.value,equipe_id:''})} className="rounded-md border px-3 py-2">
                  <option value="">Selecione...</option>
                  {ubs.map(u=><option key={u.id} value={u.id}>{u.nome}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm">Equipe
                <select value={form.equipe_id} onChange={e=>setForm({...form,equipe_id:e.target.value})} className="rounded-md border px-3 py-2">
                  <option value="">Nenhuma</option>
                  {equipes.filter(ee=>ee.unidade_id===form.unidade_id).map(ee=><option key={ee.id} value={ee.id}>{ee.nome} ({ee.tipo})</option>)}
                </select>
              </label>
              {!editando && <label className="flex flex-col gap-1 text-sm">Senha inicial<input value={form.password} onChange={e=>setForm({...form,password:e.target.value})} className="rounded-md border px-3 py-2" /></label>}
            </div>
            <div className="mt-4 flex gap-3">
              <button type="submit" disabled={saving} className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">{editando?'Atualizar':'Salvar'}</button>
              <button type="button" onClick={()=>{setShowForm(false);setEditando(null)}} className="rounded-lg border px-5 py-2 text-sm text-gray-500">Cancelar</button>
            </div>
          </form>
        )}

        {loading ? <p className="text-gray-500">Carregando...</p> : profs.length===0 ? (
          <div className="rounded-xl border bg-white p-8 text-center text-gray-400">Nenhum profissional cadastrado.</div>
        ) : (
          <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-surface-container text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold">Nome</th><th className="px-4 py-3 font-semibold hidden sm:table-cell">E-mail</th>
                  <th className="px-4 py-3 font-semibold">Perfil</th><th className="px-4 py-3 font-semibold hidden md:table-cell">Função</th>
                  <th className="px-4 py-3 font-semibold hidden md:table-cell">Unidade</th>
                  {ehGestor && <th className="px-4 py-3"></th>}
                </tr>
              </thead>
              <tbody>
                {profs.map(p => (
                  <tr key={p.id} className="border-t hover:bg-surface/30">
                    <td className="px-4 py-3 font-medium">{p.nome}</td>
                    <td className="px-4 py-3 text-on-surface-variant text-xs hidden sm:table-cell">{p.email}</td>
                    <td className="px-4 py-3 text-xs">{perfilLabel(p.perfil_id)}</td>
                    <td className="px-4 py-3 text-xs hidden md:table-cell"><span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{roleLabel(p.role)}</span></td>
                    <td className="px-4 py-3 text-on-surface-variant text-xs hidden md:table-cell">{p.unidade_nome||'-'}</td>
                    {ehGestor && (
                      <td className="px-4 py-3 flex gap-1">
                        <button onClick={()=>editar(p)} className="text-xs text-blue-500 hover:text-blue-700">✏️</button>
                        <button onClick={()=>excluir(p.id)} className="text-xs text-red-400 hover:text-red-600">🗑️</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  )
}
