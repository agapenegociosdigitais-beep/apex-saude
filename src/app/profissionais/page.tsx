'use client'

import { useEffect, useState } from 'react'
import { AppShell } from '@/components/app-shell'
import { useUser } from '@/lib/hooks/useUser'

interface Prof {
  id: string; nome: string; email: string; role: string; perfil_id: string
  unidade_nome?: string; equipe_id?: string; unidade_id?: string; municipio_id?: string
}
interface Ubs { id: string; nome: string }
interface Equipe { id: string; nome: string; tipo: string; unidade_id: string }

export default function ProfissionaisPage() {
  const user = useUser()
  const [profs, setProfs] = useState<Prof[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [ubs, setUbs] = useState<Ubs[]>([])
  const [equipes, setEquipes] = useState<Equipe[]>([])
  const [form, setForm] = useState({ email:'', nome:'', perfil_id:'medico', unidade_id:'', equipe_id:'', password:'mudar123' })

  useEffect(() => {
    if (!user.municipio_id) { setLoading(false); return }
    Promise.all([
      fetch(`/api/admin/usuarios?municipio_id=${user.municipio_id}`).then(r=>r.json()),
      fetch(`/api/admin/unidades?municipio_id=${user.municipio_id}`).then(r=>r.json()),
      fetch(`/api/admin/equipes?municipio_id=${user.municipio_id}`).then(r=>r.json()),
    ]).then(([pr,un,eq]) => {
      setProfs(pr.data||[]); setUbs(un.data||[]); setEquipes(eq.data||[])
    }).catch(()=>{}).finally(()=>setLoading(false))
  }, [user.municipio_id])

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    const res = await fetch('/api/admin/usuarios', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({...form, role:'profissional', municipio_id:user.municipio_id})
    })
    const j = await res.json()
    if (!res.ok) { alert(j.error||j.erro); setSaving(false); return }
    alert(`✅ Criado! Senha: ${j.senha}`)
    setShowForm(false); setForm({ email:'', nome:'', perfil_id:'medico', unidade_id:'', equipe_id:'', password:'mudar123' })
    // Recarregar
    const pr = await fetch(`/api/admin/usuarios?municipio_id=${user.municipio_id}`).then(r=>r.json())
    setProfs(pr.data||[])
    setSaving(false)
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
          <button onClick={()=>setShowForm(true)} className="bg-apex-gold text-white font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-amber-600 shadow-sm">+ Novo</button>
        </div>

        {showForm && (
          <form onSubmit={salvar} className="mb-6 rounded-xl border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Novo Profissional</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm">Nome *<input value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})} className="rounded-md border px-3 py-2" required /></label>
              <label className="flex flex-col gap-1 text-sm">Email *<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="rounded-md border px-3 py-2" required /></label>
              <label className="flex flex-col gap-1 text-sm">Cargo
                <select value={form.perfil_id} onChange={e=>setForm({...form,perfil_id:e.target.value})} className="rounded-md border px-3 py-2">
                  {['medico','enfermeiro','tecnico','acs','dentista','psicologo','nutricionista','fisioterapeuta','farmaceutico','assistente_social','coordenador'].map(p=><option key={p} value={p}>{p}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm">UBS
                <select value={form.unidade_id} onChange={e=>setForm({...form,unidade_id:e.target.value,equipe_id:''})} className="rounded-md border px-3 py-2">
                  <option value="">Selecione...</option>
                  {ubs.map(u=><option key={u.id} value={u.id}>{u.nome}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm">Equipe
                <select value={form.equipe_id} onChange={e=>setForm({...form,equipe_id:e.target.value})} className="rounded-md border px-3 py-2">
                  <option value="">Nenhuma</option>
                  {equipes.filter(e=>e.unidade_id===form.unidade_id).map(e=><option key={e.id} value={e.id}>{e.nome} ({e.tipo})</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm">Senha inicial<input value={form.password} onChange={e=>setForm({...form,password:e.target.value})} className="rounded-md border px-3 py-2" /></label>
            </div>
            <div className="mt-4 flex gap-3">
              <button type="submit" disabled={saving} className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">Salvar</button>
              <button type="button" onClick={()=>setShowForm(false)} className="rounded-lg border px-5 py-2 text-sm text-gray-500">Cancelar</button>
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
                  <th className="px-4 py-3 font-semibold">Nome</th>
                  <th className="px-4 py-3 font-semibold hidden sm:table-cell">E-mail</th>
                  <th className="px-4 py-3 font-semibold">Perfil</th>
                  <th className="px-4 py-3 font-semibold hidden md:table-cell">Função</th>
                  {user.role!=='coordenador' && <th className="px-4 py-3 font-semibold hidden md:table-cell">Unidade</th>}
                </tr>
              </thead>
              <tbody>
                {profs.map(p => (
                  <tr key={p.id} className="border-t hover:bg-surface/30">
                    <td className="px-4 py-3 font-medium">{p.nome}</td>
                    <td className="px-4 py-3 text-on-surface-variant hidden sm:table-cell">{p.email}</td>
                    <td className="px-4 py-3">{perfilLabel(p.perfil_id)}</td>
                    <td className="px-4 py-3 text-xs hidden md:table-cell"><span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{roleLabel(p.role)}</span></td>
                    {user.role!=='coordenador' && <td className="px-4 py-3 text-on-surface-variant text-xs hidden md:table-cell">{p.unidade_nome||'-'}</td>}
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
