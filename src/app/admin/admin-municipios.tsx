'use client'

import { useEffect, useState, useCallback } from 'react'

interface M { id: string; nome: string; uf: string; codigo_ibge: number | null; populacao: number | null; unidades_count: number; unidades: U[] }
interface U { id: string; municipio_id: string; nome: string; tipo: string; ativa: boolean; equipes_count: number; cnes?: string; endereco?: string; bairro?: string }
interface E { id: string; municipio_id: string; unidade_id: string; codigo_ine: string; nome: string; tipo: string; ativa: boolean; unidades_saude?: { nome: string } | null }

const ESTADOS = [
  { sigla:'AC', nome:'Acre' },{ sigla:'AL', nome:'Alagoas' },{ sigla:'AP', nome:'Amapá' },{ sigla:'AM', nome:'Amazonas' },{ sigla:'BA', nome:'Bahia' },
  { sigla:'CE', nome:'Ceará' },{ sigla:'DF', nome:'Distrito Federal' },{ sigla:'ES', nome:'Espírito Santo' },{ sigla:'GO', nome:'Goiás' },
  { sigla:'MA', nome:'Maranhão' },{ sigla:'MT', nome:'Mato Grosso' },{ sigla:'MS', nome:'Mato Grosso do Sul' },{ sigla:'MG', nome:'Minas Gerais' },
  { sigla:'PA', nome:'Pará' },{ sigla:'PB', nome:'Paraíba' },{ sigla:'PR', nome:'Paraná' },{ sigla:'PE', nome:'Pernambuco' },
  { sigla:'PI', nome:'Piauí' },{ sigla:'RJ', nome:'Rio de Janeiro' },{ sigla:'RN', nome:'Rio Grande do Norte' },{ sigla:'RS', nome:'Rio Grande do Sul' },
  { sigla:'RO', nome:'Rondônia' },{ sigla:'RR', nome:'Roraima' },{ sigla:'SC', nome:'Santa Catarina' },{ sigla:'SP', nome:'São Paulo' },
  { sigla:'SE', nome:'Sergipe' },{ sigla:'TO', nome:'Tocantins' },
]

export default function AdminMunicipios() {
  const [municipios, setMunicipios] = useState<M[]>([])
  const [equipes, setEquipes] = useState<E[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingMun, setEditingMun] = useState<M | null>(null)
  const [form, setForm] = useState({ nome:'', uf:'', codigo_ibge:'', populacao:'' })
  const [cidades, setCidades] = useState<{ nome:string; ibge:number }[]>([])
  const [buscaCidade, setBuscaCidade] = useState('')
  const [ubsForm, setUbsForm] = useState({ nome:'', tipo:'ubs', cnes:'' })
  const [expandedMun, setExpandedMun] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const [mr, er] = await Promise.all([fetch('/api/admin/municipios'), fetch('/api/admin/equipes')])
      if (mr.ok) setMunicipios((await mr.json()).data || [])
      if (er.ok) setEquipes((await er.json()).data || [])
    } catch {} finally { setLoading(false) }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  useEffect(() => {
    if (!form.uf || form.uf.length !== 2) { setCidades([]); return }
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${form.uf}/municipios`)
      .then(r => r.json()).then((d: { nome:string; id:number }[]) => setCidades(d.map(c => ({ nome: c.nome, ibge: c.id })))).catch(() => {})
  }, [form.uf])

  const saveMun = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      const method = editingMun ? 'PUT' : 'POST'
      const body = editingMun ? { id: editingMun.id, ...form } : form
      const res = await fetch('/api/admin/municipios', { method, headers: {'Content-Type':'application/json'}, body: JSON.stringify({...body, codigo_ibge: form.codigo_ibge?parseInt(form.codigo_ibge):null, populacao: form.populacao?parseInt(form.populacao):null }) })
      if (!res.ok) throw new Error((await res.json()).error)
      setEditingMun(null); setForm({ nome:'', uf:'', codigo_ibge:'', populacao:'' }); setCidades([])
      carregar()
    } catch(e: unknown) { alert(e instanceof Error ? e.message : 'Erro') } finally { setSaving(false) }
  }

  const editMun = (m: M) => { setEditingMun(m); setForm({ nome:m.nome, uf:m.uf, codigo_ibge:String(m.codigo_ibge||''), populacao:String(m.populacao||'') }) }
  const deleteMun = async (id: string) => { if(!confirm('Excluir município e todos os dados?')) return; await fetch(`/api/admin/municipios?id=${id}`, { method:'DELETE' }); carregar() }

  const saveUbs = async (mid: string, e: React.FormEvent) => { e.preventDefault(); setSaving(true)
    await fetch('/api/admin/unidades', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ municipio_id:mid, nome:ubsForm.nome, tipo:ubsForm.tipo, cnes:ubsForm.cnes||null }) })
    setUbsForm({ nome:'', tipo:'ubs', cnes:'' }); carregar(); setSaving(false)
  }
  const deleteUbs = async (id: string) => { if(!confirm('Excluir UBS?')) return; await fetch(`/api/admin/unidades?id=${id}`, { method:'DELETE' }); carregar() }

  return (
    <section className="flex flex-col gap-stack-lg">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-surface-variant pb-6">
        <div className="flex flex-col gap-2">
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background">
            Municípios
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            Gerencie a rede de municípios cadastrados na plataforma.
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setEditingMun(null); setForm({ nome:'', uf:'', codigo_ibge:'', populacao:'' }); setCidades([]); setBuscaCidade('') }}
          className="bg-secondary text-on-secondary font-label-md text-label-md px-6 py-3 rounded-lg hover:bg-secondary/90 transition-colors shadow-sm flex items-center justify-center gap-2 w-full sm:w-auto self-start sm:self-end"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add</span>
          Novo Município
        </button>
      </div>

      {/* Form */}
      {editingMun !== null || (form.uf !== '' && form.nome === '') ? (
        <form onSubmit={saveMun} className="mb-6 rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">{editingMun ? 'Editar' : 'Cadastrar'} Município</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">Estado *
              <select value={form.uf} onChange={e => { setForm({...form, uf:e.target.value, nome:'', codigo_ibge:'', populacao:''}); setBuscaCidade('') }}
                className="rounded-md border px-3 py-2" required>
                <option value="">Selecione...</option>
                {ESTADOS.map(e => <option key={e.sigla} value={e.sigla}>{e.sigla} — {e.nome}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">Cidade *
              {form.uf ? <div className="relative">
                <input value={buscaCidade || form.nome} onChange={e => { setBuscaCidade(e.target.value); setForm({...form, nome:''}) }}
                  className="rounded-md border px-3 py-2 w-full" placeholder="Digite para buscar..." />
                {buscaCidade && cidades.filter(c => c.nome.toLowerCase().includes(buscaCidade.toLowerCase())).slice(0,8).map(c => (
                  <button key={c.ibge} type="button" onClick={() => { setForm({...form, nome:c.nome, codigo_ibge:String(c.ibge)}); setBuscaCidade('') }}
                    className="absolute z-10 block w-full bg-white border px-3 py-1 text-left text-sm hover:bg-apex-gold hover:text-white">{c.nome}</button>
                ))}
              </div> : <input disabled className="rounded-md border px-3 py-2 bg-gray-100" placeholder="Selecione o estado" />}
            </label>
            <label className="flex flex-col gap-1 text-sm">Código IBGE <input value={form.codigo_ibge} readOnly className="rounded-md border px-3 py-2 bg-gray-50 text-gray-600" /></label>
            <label className="flex flex-col gap-1 text-sm">População <input value={form.populacao} onChange={e => setForm({...form, populacao:e.target.value})} className="rounded-md border px-3 py-2" type="number" /></label>
          </div>
          <div className="mt-4 flex gap-3">
            <button type="submit" disabled={saving || !form.nome} className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">{saving?'Salvando...':'Salvar'}</button>
            <button type="button" onClick={() => { setEditingMun(null); setForm({ nome:'', uf:'', codigo_ibge:'', populacao:'' }); setCidades([]); setBuscaCidade('') }} className="rounded-lg border px-5 py-2 text-sm text-gray-500 hover:bg-gray-50">Cancelar</button>
          </div>
        </form>
      ) : null}

      {/* Cards */}
      {loading ? <p className="text-center text-on-surface-variant py-8">Carregando...</p> : municipios.length === 0 ? <p className="text-center text-on-surface-variant py-8">Nenhum município cadastrado.</p> :
        <div className="flex flex-col gap-stack-md">
          {municipios.map(mun => (
            <div key={mun.id} className="bg-surface rounded-xl p-5 sm:p-6 border border-outline-variant/40 shadow-ambient hover:bg-surface-container-low/50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-semibold text-on-surface">{mun.nome}</h3>
                    <span className="text-xs font-semibold text-on-surface-variant bg-surface-variant px-2 py-0.5 rounded-md">{mun.uf}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-on-surface-variant">
                    <span className="inline-flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">pin_drop</span>IBGE: {mun.codigo_ibge||'—'}</span>
                    <span className="inline-flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">group</span>Pop: {mun.populacao?.toLocaleString()||'—'}</span>
                    <span className="inline-flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">local_hospital</span>{mun.unidades_count} UBS</span>
                    <span className="inline-flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">medical_services</span>{equipes.filter(e=>e.municipio_id===mun.id).length} equipes</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button type="button" onClick={() => { setExpandedMun(expandedMun===mun.id?null:mun.id); if(expandedMun!==mun.id) setUbsForm({ nome:`UBS ${mun.nome}`, tipo:'ubs', cnes:'' }) }}
                    className="bg-[#2563eb] text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-[#1d4ed8] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">add</span>UBS
                  </button>
                  <button type="button" onClick={() => editMun(mun)} className="p-2 rounded-lg border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary">
                    <span className="material-symbols-outlined text-[20px]">edit</span>
                  </button>
                  <button type="button" onClick={() => deleteMun(mun.id)} className="p-2 rounded-lg border border-error/30 text-error hover:bg-error-container/20">
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
              </div>

              {expandedMun === mun.id && (
                <div className="border-t border-outline-variant/40 mt-4 pt-4 w-full">
                  <form onSubmit={e => saveUbs(mun.id, e)} className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-end gap-3 mb-4">
                    <label className="text-sm flex flex-col gap-1 flex-1 min-w-[200px]">Nome
                      <input value={ubsForm.nome} onChange={e => setUbsForm({...ubsForm, nome:e.target.value})} className="rounded-md border border-outline-variant px-3 py-2 w-full" required />
                    </label>
                    <label className="text-sm flex flex-col gap-1 min-w-[100px]">CNES
                      <input value={ubsForm.cnes||''} onChange={e => setUbsForm({...ubsForm, cnes:e.target.value})} className="rounded-md border border-outline-variant px-3 py-2" placeholder="7 dígitos" />
                    </label>
                    <label className="text-sm flex flex-col gap-1">Tipo
                      <select value={ubsForm.tipo} onChange={e => setUbsForm({...ubsForm, tipo:e.target.value})} className="rounded-md border border-outline-variant px-3 py-2">
                        <option value="ubs">UBS</option>
                        <option value="hospital">Hospital</option>
                        <option value="clinica">Clínica</option>
                        <option value="especializada">Especializada</option>
                      </select>
                    </label>
                    <button type="submit" disabled={saving} className="rounded-lg bg-primary text-on-primary px-4 py-2 text-sm font-semibold disabled:opacity-50">Adicionar</button>
                  </form>
                  {mun.unidades.length > 0 && (
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {mun.unidades.map(u => (
                        <div key={u.id} className="flex items-center justify-between rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 py-2">
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{u.nome}</p>
                            <p className="text-xs text-on-surface-variant">
                              {equipes.filter(e=>e.unidade_id===u.id).length} equipes
                              {u.cnes && <span className="ml-2">CNES: {u.cnes}</span>}
                              {u.endereco && <span className="block truncate">{u.endereco}{u.bairro ? ', '+u.bairro : ''}</span>}
                            </p>
                          </div>
                          <button type="button" onClick={() => deleteUbs(u.id)} className="text-error p-1 shrink-0" aria-label="Excluir UBS">
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      }
    </section>
  )
}
