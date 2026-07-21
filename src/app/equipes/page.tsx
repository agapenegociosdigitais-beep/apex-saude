'use client'

import { useEffect, useState } from 'react'
import { AppShell } from '@/components/app-shell'
import { useUser } from '@/lib/hooks/useUser'

interface Equipe {
  id: string; nome: string; tipo: string; codigo_ine: string
  ativa: boolean; unidade_nome?: string
}

export default function EquipesPage() {
  const user = useUser()
  const [equipes, setEquipes] = useState<Equipe[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user.municipio_id) { setLoading(false); return }
    fetch(`/api/admin/equipes?municipio_id=${user.municipio_id}`)
      .then(r => r.json()).then(d => setEquipes(d.data || [])).catch(()=>{})
      .finally(() => setLoading(false))
  }, [user.municipio_id])

  const tipoLabel = (t: string) => ({ esf:'eSF', esb:'eSB', emulti:'eMulti' } as Record<string,string>)[t] || t

  return (
    <AppShell active="equipes">
      <div className="max-w-4xl">
        <h2 className="text-2xl font-bold text-on-background mb-1">👥 Equipes</h2>
        <p className="text-sm text-on-surface-variant mb-6">Equipes de saúde de {user.municipio_nome}</p>
        {loading ? <p className="text-gray-500">Carregando...</p> : equipes.length === 0 ? (
          <div className="rounded-xl border bg-white p-8 text-center text-gray-400">Nenhuma equipe cadastrada.</div>
        ) : (
          <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-surface-container text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold">Nome</th>
                  <th className="px-4 py-3 font-semibold">Tipo</th>
                  <th className="px-4 py-3 font-semibold hidden sm:table-cell">INE</th>
                  <th className="px-4 py-3 font-semibold hidden md:table-cell">Unidade</th>
                </tr>
              </thead>
              <tbody>
                {equipes.map(e => (
                  <tr key={e.id} className="border-t hover:bg-surface/30">
                    <td className="px-4 py-3 font-medium">{e.nome}</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium text-xs">{tipoLabel(e.tipo)}</span></td>
                    <td className="px-4 py-3 text-on-surface-variant text-xs hidden sm:table-cell">{e.codigo_ine}</td>
                    <td className="px-4 py-3 text-on-surface-variant text-xs hidden md:table-cell">{e.unidade_nome || '-'}</td>
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
