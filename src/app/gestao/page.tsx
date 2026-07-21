'use client'

import { useEffect, useState } from 'react'
import { AppShell } from '@/components/app-shell'
import { useUser } from '@/lib/hooks/useUser'

export default function GestaoPage() {
  const user = useUser()
  const [stats, setStats] = useState({ equipes:0, ubs:0, profissionais:0 })

  useEffect(() => {
    if (!user.municipio_id) return
    Promise.all([
      fetch(`/api/admin/equipes?municipio_id=${user.municipio_id}`).then(r=>r.json()),
      fetch(`/api/admin/unidades?municipio_id=${user.municipio_id}`).then(r=>r.json()),
      fetch(`/api/admin/usuarios?municipio_id=${user.municipio_id}`).then(r=>r.json()),
    ]).then(([eq,un,pr]) => {
      setStats({ equipes: eq.data?.length||0, ubs: un.data?.length||0, profissionais: pr.data?.length||0 })
    }).catch(()=>{})
  }, [user.municipio_id])

  return (
    <AppShell active="gestao">
      <div className="max-w-4xl">
        <h2 className="text-2xl font-bold text-on-background mb-1">⚙️ Gestão</h2>
        <p className="text-sm text-on-surface-variant mb-6">Resumo de {user.municipio_nome}</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label:'Equipes', value:stats.equipes, icon:'groups', color:'bg-blue-50 text-blue-700' },
            { label:'UBS', value:stats.ubs, icon:'location_city', color:'bg-emerald-50 text-emerald-700' },
            { label:'Profissionais', value:stats.profissionais, icon:'badge', color:'bg-amber-50 text-amber-700' },
          ].map(s => (
            <div key={s.label} className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
                  <span className="material-symbols-outlined text-xl">{s.icon}</span>
                </div>
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-on-surface-variant">{s.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="font-semibold mb-4">Configuração PEC</h3>
          <p className="text-sm text-on-surface-variant">
            Status: <span className="text-amber-600 font-medium">Aguardando acesso do TI da prefeitura</span>
          </p>
          <p className="text-xs text-on-surface-variant mt-2">
            Os dados dos indicadores serão atualizados automaticamente quando a conexão com o PEC for configurada.
          </p>
        </div>
      </div>
    </AppShell>
  )
}
