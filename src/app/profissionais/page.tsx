'use client'

import { useEffect, useState } from 'react'
import { AppShell } from '@/components/app-shell'
import { useUser } from '@/lib/hooks/useUser'

interface Prof {
  id: string
  nome: string
  email: string
  role: string
  perfil_id: string
  unidade_nome?: string
  equipe_nome?: string
}

export default function ProfissionaisPage() {
  const user = useUser()
  const [profs, setProfs] = useState<Prof[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!user.municipio_id) { setLoading(false); return }
      const params = new URLSearchParams({ municipio_id: user.municipio_id })
      if (user.unidade_id) params.set('unidade_id', user.unidade_id)
      try {
        const res = await fetch(`/api/admin/usuarios?${params}`)
        if (res.ok) setProfs((await res.json()).data || [])
      } catch {} 
      setLoading(false)
    }
    load()
  }, [user.municipio_id, user.unidade_id])

  const roleLabel = (r: string) => ({ admin:'Admin', gestor:'Gestor', coordenador:'Coordenador', profissional:'Profissional' } as Record<string,string>)[r] || r
  const perfilLabel = (p: string) => p ? p.charAt(0).toUpperCase() + p.slice(1) : '-'

  return (
    <AppShell active="profissionais">
      <div className="max-w-4xl">
        <h2 className="text-2xl font-bold text-on-background mb-1">👥 Profissionais</h2>
        <p className="text-sm text-on-surface-variant mb-6">
          {user.role === 'gestor' ? `Todos os profissionais de ${user.municipio_nome}` : 'Profissionais da sua unidade'}
        </p>

        {loading ? (
          <p className="text-gray-500">Carregando...</p>
        ) : profs.length === 0 ? (
          <div className="rounded-xl border bg-white p-8 text-center text-gray-400">
            Nenhum profissional cadastrado nesta cidade.
          </div>
        ) : (
          <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-surface-container text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold">Nome</th>
                  <th className="px-4 py-3 font-semibold hidden sm:table-cell">E-mail</th>
                  <th className="px-4 py-3 font-semibold">Perfil</th>
                  <th className="px-4 py-3 font-semibold hidden md:table-cell">Função</th>
                  {user.role !== 'coordenador' && <th className="px-4 py-3 font-semibold hidden md:table-cell">Unidade</th>}
                </tr>
              </thead>
              <tbody>
                {profs.map(p => (
                  <tr key={p.id} className="border-t hover:bg-surface/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{p.nome}</td>
                    <td className="px-4 py-3 text-on-surface-variant hidden sm:table-cell">{p.email}</td>
                    <td className="px-4 py-3">{perfilLabel(p.perfil_id)}</td>
                    <td className="px-4 py-3 text-xs hidden md:table-cell">
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{roleLabel(p.role)}</span>
                    </td>
                    {user.role !== 'coordenador' && <td className="px-4 py-3 text-on-surface-variant text-xs hidden md:table-cell">{p.unidade_nome || '-'}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-3 border-t bg-surface-container/50 text-xs text-on-surface-variant">
              Mostrando {profs.length} profissional{profs.length !== 1 ? 'is' : ''}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
