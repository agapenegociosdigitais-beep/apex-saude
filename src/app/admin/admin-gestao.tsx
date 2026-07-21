'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'

interface M { id: string; nome: string; uf: string; unidades_count: number }
interface E { id: string; municipio_id: string; unidade_id: string; nome: string; tipo: string }

export default function AdminGestao() {
  const [municipios, setMunicipios] = useState<M[]>([])
  const [equipes, setEquipes] = useState<E[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroMunicipio, setFiltroMunicipio] = useState('')

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const [mr, er] = await Promise.all([fetch('/api/admin/municipios'), fetch('/api/admin/equipes')])
      if (mr.ok) setMunicipios((await mr.json()).data || [])
      if (er.ok) setEquipes((await er.json()).data || [])
    } catch {} finally { setLoading(false) }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const perfis = [
    { id:'medico', icon:'👨‍⚕️', nome:'Médico', grupo:'eSF', ind:4 },
    { id:'enfermeiro', icon:'👩‍⚕️', nome:'Enfermeiro', grupo:'eSF', ind:3 },
    { id:'tecnico', icon:'🩺', nome:'Técnico Enfermagem', grupo:'eSF', ind:3 },
    { id:'acs', icon:'🏘️', nome:'ACS', grupo:'eSF', ind:3 },
    { id:'dentista', icon:'🦷', nome:'Dentista', grupo:'eSB', ind:6 },
    { id:'psicologo', icon:'🧠', nome:'Psicólogo', grupo:'eMulti', ind:2 },
    { id:'fisio', icon:'🏃', nome:'Fisioterapeuta', grupo:'eMulti', ind:2 },
    { id:'nutricionista', icon:'🥗', nome:'Nutricionista', grupo:'eMulti', ind:2 },
    { id:'assistente', icon:'🤝', nome:'Assistente Social', grupo:'eMulti', ind:2 },
    { id:'farmaceutico', icon:'💊', nome:'Farmacêutico', grupo:'eMulti', ind:2 },
    { id:'coordenador', icon:'📋', nome:'Coordenador', grupo:'Gestão', ind:2 },
    { id:'gestor', icon:'🏛️', nome:'Gestor', grupo:'Gestão', ind:2 },
  ]

  const munFiltrados = filtroMunicipio ? municipios.filter(m => m.id === filtroMunicipio) : municipios

  return (
    <section>
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-3xl font-bold text-apex-ink">📈 Gestão Geral de Indicadores</h2>
        <select value={filtroMunicipio} onChange={e => setFiltroMunicipio(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm">
          <option value="">Todos os municípios</option>
          {municipios.map(m => <option key={m.id} value={m.id}>{m.nome} — {m.uf}</option>)}
        </select>
      </div>

      {/* Grid de perfis */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {perfis.map(p => (
          <a key={p.id} href={`/dashboard/${p.id}`} target="_blank"
            className="rounded-xl border bg-white p-5 shadow-sm hover:shadow-md hover:border-apex-gold transition-all group">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{p.icon}</span>
              <div><h3 className="font-semibold text-apex-ink">{p.nome}</h3><p className="text-xs text-apex-muted">{p.grupo} · {p.ind} indicadores</p></div>
            </div>
            <div className="mt-3 text-xs text-apex-gold opacity-0 group-hover:opacity-100 transition-opacity">Ver dashboard →</div>
          </a>
        ))}
      </div>

      {/* Acesso por município */}
      <h3 className="text-lg font-semibold mt-4 mb-3 text-apex-ink">🚀 Acesso por município</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {munFiltrados.map(mun => (
          <div key={mun.id} className="rounded-xl border bg-white p-4 shadow-sm">
            <h4 className="font-semibold text-apex-ink">{mun.nome} — {mun.uf}</h4>
            <p className="text-xs text-apex-muted mb-3">{mun.unidades_count} UBS · {equipes.filter(e=>e.municipio_id===mun.id).length} equipes</p>
            <div className="flex flex-wrap gap-1.5">
              <Link href="/gerencial" className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">📊 Gerencial</Link>
              <Link href="/paineis/esf" className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded hover:bg-emerald-200">🏥 eSF</Link>
              <Link href="/paineis/esb" className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded hover:bg-amber-200">🦷 eSB</Link>
              <Link href="/paineis/emulti" className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200">🤝 eMulti</Link>
              <Link href="/guias/esf" className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200">📖 Guia</Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
