'use client';

import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { useEffect, useState, useCallback } from 'react';

// -- types --
interface M { id: string; nome: string; uf: string; codigo_ibge: number | null; populacao: number | null; unidades_count: number; unidades: U[]; }
interface U { id: string; municipio_id: string; nome: string; tipo: string; ativa: boolean; equipes_count: number; }
interface E { id: string; municipio_id: string; unidade_id: string; codigo_ine: string; nome: string; tipo: string; ativa: boolean; unidades_saude?: { nome: string } | null; }
interface Ind { id: string; codigo: string; nome: string; grupo: string; peso: number; meta: number; invertido: boolean; escala10: boolean; }

const ESTADOS = [
  { sigla:'AC', nome:'Acre' },{ sigla:'AL', nome:'Alagoas' },{ sigla:'AP', nome:'Amapá' },{ sigla:'AM', nome:'Amazonas' },{ sigla:'BA', nome:'Bahia' },
  { sigla:'CE', nome:'Ceará' },{ sigla:'DF', nome:'Distrito Federal' },{ sigla:'ES', nome:'Espírito Santo' },{ sigla:'GO', nome:'Goiás' },
  { sigla:'MA', nome:'Maranhão' },{ sigla:'MT', nome:'Mato Grosso' },{ sigla:'MS', nome:'Mato Grosso do Sul' },{ sigla:'MG', nome:'Minas Gerais' },
  { sigla:'PA', nome:'Pará' },{ sigla:'PB', nome:'Paraíba' },{ sigla:'PR', nome:'Paraná' },{ sigla:'PE', nome:'Pernambuco' },
  { sigla:'PI', nome:'Piauí' },{ sigla:'RJ', nome:'Rio de Janeiro' },{ sigla:'RN', nome:'Rio Grande do Norte' },{ sigla:'RS', nome:'Rio Grande do Sul' },
  { sigla:'RO', nome:'Rondônia' },{ sigla:'RR', nome:'Roraima' },{ sigla:'SC', nome:'Santa Catarina' },{ sigla:'SP', nome:'São Paulo' },
  { sigla:'SE', nome:'Sergipe' },{ sigla:'TO', nome:'Tocantins' },
];

export default function AdminPage() {
  const [tab, setTab] = useState<'municipios'|'equipes'|'indicadores'|'integracao'|'usuarios'|'gestao'>('municipios');
  const [municipios, setMunicipios] = useState<M[]>([]);
  const [equipes, setEquipes] = useState<E[]>([]);
  const [indicadores, setIndicadores] = useState<Ind[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [editingMun, setEditingMun] = useState<M | null>(null);
  const [form, setForm] = useState({ nome:'', uf:'', codigo_ibge:'', populacao:'' });
  const [cidades, setCidades] = useState<{ nome:string; ibge:number }[]>([]);
  const [buscaCidade, setBuscaCidade] = useState('');
  const [ubsForm, setUbsForm] = useState({ nome:'', tipo:'ubs' });
  const [expandedMun, setExpandedMun] = useState<string | null>(null);

  // Equipe form
  const [showEquipeForm, setShowEquipeForm] = useState(false);
  const [equipeForm, setEquipeForm] = useState({ municipio_id:'', unidade_id:'', nome:'', tipo:'esf', codigo_ine:'' });
  const [unidadesPorMun, setUnidadesPorMun] = useState<U[]>([]);

  // Indicador form
  const [editingInd, setEditingInd] = useState<Ind | null>(null);
  const [indForm, setIndForm] = useState({ peso:0, meta:0 });
  const [filtroMunicipio, setFiltroMunicipio] = useState('');
  const [pecForms, setPecForms] = useState<Record<string, any>>({});
  const [pecStatus, setPecStatus] = useState<Record<string, string>>({});
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [showUserForm, setShowUserForm] = useState(false);
  const [userForm, setUserForm] = useState({ email:'', nome:'', role:'profissional', municipio_id:'', unidade_id:'', equipe_id:'', perfil_id:'medico', password:'mudar123' });
  const [filtroUbs, setFiltroUbs] = useState('');

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const [mr, er, ir, ur] = await Promise.all([
        fetch('/api/admin/municipios'),
        fetch('/api/admin/equipes'),
        fetch('/api/admin/indicadores'),
        fetch('/api/admin/usuarios'),
      ]);
      if (mr.ok) setMunicipios((await mr.json()).data || []);
      if (er.ok) setEquipes((await er.json()).data || []);
      if (ir.ok) setIndicadores((await ir.json()).data || []);
      if (ur.ok) setUsuarios((await ur.json()).data || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  // IBGE cidades
  useEffect(() => {
    if (!form.uf || form.uf.length !== 2) { setCidades([]); return; }
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${form.uf}/municipios`)
      .then(r => r.json()).then((d: any[]) => setCidades(d.map(c => ({ nome: c.nome, ibge: c.id })))).catch(() => {});
  }, [form.uf]);

  useEffect(() => {
    if (equipeForm.municipio_id) {
      setUnidadesPorMun(municipios.find(m => m.id === equipeForm.municipio_id)?.unidades || []);
    }
  }, [equipeForm.municipio_id, municipios]);

  // -- municipio CRUD --
  const saveMun = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const method = editingMun ? 'PUT' : 'POST';
      const body = editingMun ? { id: editingMun.id, ...form } : form;
      const res = await fetch('/api/admin/municipios', { method, headers: {'Content-Type':'application/json'}, body: JSON.stringify({...body, codigo_ibge: form.codigo_ibge?parseInt(form.codigo_ibge):null, populacao: form.populacao?parseInt(form.populacao):null }) });
      if (!res.ok) throw new Error((await res.json()).error);
      setEditingMun(null); setForm({ nome:'', uf:'', codigo_ibge:'', populacao:'' }); setCidades([]);
      carregar();
    } catch(e: any) { alert(e.message); } finally { setSaving(false); }
  };
  const editMun = (m: M) => { setEditingMun(m); setForm({ nome:m.nome, uf:m.uf, codigo_ibge:String(m.codigo_ibge||''), populacao:String(m.populacao||'') }); };
  const deleteMun = async (id: string) => { if(!confirm('Excluir município e todos os dados?')) return; await fetch(`/api/admin/municipios?id=${id}`, { method:'DELETE' }); carregar(); };

  // -- UBS CRUD --
  const saveUbs = async (mid: string, e: React.FormEvent) => { e.preventDefault(); setSaving(true);
    await fetch('/api/admin/unidades', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ municipio_id:mid, nome:ubsForm.nome, tipo:ubsForm.tipo }) });
    setUbsForm({ nome:'', tipo:'ubs' }); carregar(); setSaving(false);
  };
  const deleteUbs = async (id: string) => { if(!confirm('Excluir UBS?')) return; await fetch(`/api/admin/unidades?id=${id}`, { method:'DELETE' }); carregar(); };

  // -- equipe CRUD --
  const saveEquipe = async (e: React.FormEvent) => { e.preventDefault(); setSaving(true);
    await fetch('/api/admin/equipes', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(equipeForm) });
    setShowEquipeForm(false); setEquipeForm({ municipio_id:'', unidade_id:'', nome:'', tipo:'esf', codigo_ine:'' }); carregar(); setSaving(false);
  };
  const deleteEquipe = async (id: string) => { if(!confirm('Excluir equipe?')) return; await fetch(`/api/admin/equipes?id=${id}`, { method:'DELETE' }); carregar(); };

  // -- indicador --
  const saveInd = async (e: React.FormEvent) => { e.preventDefault(); setSaving(true);
    await fetch('/api/admin/indicadores', { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ id:editingInd!.id, ...indForm }) });
    setEditingInd(null); carregar(); setSaving(false);
  };

  const editInd = (ind: Ind) => { setEditingInd(ind); setIndForm({ peso:ind.peso, meta:ind.meta }); };

  return (
    <div className="min-h-screen bg-apex-bg">
      <DashboardHeader />
      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-1 rounded-xl bg-gray-100 p-1 mb-6 w-fit">
          {(['municipios','equipes','indicadores','integracao','usuarios','gestao'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${tab===t?'bg-white shadow text-apex-ink':'text-gray-500 hover:text-apex-ink'}`}>
              {{municipios:'🏙️ Municípios', equipes:'👥 Equipes', indicadores:'📊 Indicadores', integracao:'🔌 PEC', usuarios:'🩺 Profissionais', gestao:'📊 Gestão'}[t]}
            </button>
          ))}
        </div>

        {/* ========== MUNICIPIOS TAB ========== */}
        {tab === 'municipios' && <>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-semibold">Municípios</h1>
            <button onClick={() => { setEditingMun(null); setForm({ nome:'', uf:'', codigo_ibge:'', populacao:'' }); }}
              className="rounded-lg bg-apex-gold px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600">+ Novo</button>
          </div>

          {(editingMun !== null || (!editingMun && form.nome === '' && municipios.length === 0)) && form.uf !== '' || editingMun !== null ? null : null}
          {editingMun !== null || (form.nome === '' && !editingMun && form.uf !== '') ? (
            <form onSubmit={saveMun} className="mb-6 rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">{editingMun ? 'Editar' : 'Cadastrar'} Município</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm">Estado *
                  <select value={form.uf} onChange={e => { setForm({...form, uf:e.target.value, nome:'', codigo_ibge:'', populacao:''}); setBuscaCidade(''); }}
                    className="rounded-md border px-3 py-2" required>
                    <option value="">Selecione...</option>
                    {ESTADOS.map(e => <option key={e.sigla} value={e.sigla}>{e.sigla} — {e.nome}</option>)}
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-sm">Cidade *
                  {form.uf ? <div className="relative">
                    <input value={buscaCidade || form.nome} onChange={e => { setBuscaCidade(e.target.value); setForm({...form, nome:''}); }}
                      className="rounded-md border px-3 py-2 w-full" placeholder="Digite para buscar..." />
                    {buscaCidade && cidades.filter(c => c.nome.toLowerCase().includes(buscaCidade.toLowerCase())).slice(0,8).map(c => (
                      <button key={c.ibge} type="button" onClick={() => { setForm({...form, nome:c.nome, codigo_ibge:String(c.ibge)}); setBuscaCidade(''); }}
                        className="absolute z-10 block w-full bg-white border px-3 py-1 text-left text-sm hover:bg-apex-gold hover:text-white">{c.nome}</button>
                    ))}
                  </div> : <input disabled className="rounded-md border px-3 py-2 bg-gray-100" placeholder="Selecione o estado" />}
                </label>
                <label className="flex flex-col gap-1 text-sm">Código IBGE <input value={form.codigo_ibge} readOnly className="rounded-md border px-3 py-2 bg-gray-50 text-gray-600" /></label>
                <label className="flex flex-col gap-1 text-sm">População <input value={form.populacao} onChange={e => setForm({...form, populacao:e.target.value})} className="rounded-md border px-3 py-2" type="number" /></label>
              </div>
              <div className="mt-4 flex gap-3">
                <button type="submit" disabled={saving || !form.nome} className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">{saving?'Salvando...':'Salvar'}</button>
                <button type="button" onClick={() => { setEditingMun(null); setForm({ nome:'', uf:'', codigo_ibge:'', populacao:'' }); }} className="rounded-lg border px-5 py-2 text-sm text-gray-500 hover:bg-gray-50">Cancelar</button>
              </div>
            </form>
          ) : (
            <button onClick={() => setEditingMun(null)} className="mb-6 hidden">novo</button>
          )}

          {loading ? <p className="text-center text-gray-500">Carregando...</p> : municipios.length === 0 ? <p className="text-center text-gray-400">Nenhum município.</p> :
            municipios.map(mun => (
              <div key={mun.id} className="mb-4 rounded-xl border bg-white shadow-sm">
                <div className="flex justify-between items-center p-5">
                  <div>
                    <h3 className="text-lg font-semibold">{mun.nome} <span className="text-sm text-gray-400">{mun.uf}</span></h3>
                    <p className="text-sm text-gray-500">IBGE: {mun.codigo_ibge||'—'} · Pop: {mun.populacao?.toLocaleString()||'—'} · {mun.unidades_count} UBS · {equipes.filter(e=>e.municipio_id===mun.id).length} equipes</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setExpandedMun(expandedMun===mun.id?null:mun.id); if(expandedMun!==mun.id) setUbsForm({ nome:`UBS ${mun.nome}${mun.unidades.filter(u=>u.nome.startsWith('UBS ')).length>0?' '+(mun.unidades.filter(u=>u.nome.startsWith('UBS ')).length+1):''}`, tipo:'ubs' }); }} className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700">+ UBS</button>
                    <button onClick={() => editMun(mun)} className="rounded-lg border px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100">✏️</button>
                    <button onClick={() => deleteMun(mun.id)} className="rounded-lg border px-3 py-1.5 text-xs text-red-500 hover:bg-red-50">🗑️</button>
                  </div>
                </div>
                {expandedMun === mun.id && (
                  <div className="border-t bg-gray-50 p-4">
                    <form onSubmit={e => saveUbs(mun.id, e)} className="flex flex-wrap items-end gap-3 mb-4">
                      <label className="text-sm">Nome *<input value={ubsForm.nome} onChange={e => setUbsForm({...ubsForm, nome:e.target.value})} className="rounded-md border px-3 py-2 w-56 ml-1" required /></label>
                      <label className="text-sm">Tipo<select value={ubsForm.tipo} onChange={e => setUbsForm({...ubsForm, tipo:e.target.value})} className="rounded-md border px-3 py-2 ml-1"><option value="ubs">UBS</option><option value="hospital">Hospital</option><option value="clinica">Clínica</option><option value="especializada">Especializada</option></select></label>
                      <button type="submit" disabled={saving} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Adicionar</button>
                    </form>
                    {mun.unidades.length > 0 && (
                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {mun.unidades.map(u => (
                          <div key={u.id} className="flex items-center justify-between rounded-lg border bg-white px-3 py-2">
                            <div className="flex items-center gap-2">
                              <span>🏥</span>
                              <div><p className="text-sm font-medium">{u.nome}</p><p className="text-xs text-gray-500">{equipes.filter(e=>e.unidade_id===u.id).length} equipes</p></div>
                            </div>
                            <button onClick={() => deleteUbs(u.id)} className="text-xs text-red-400 hover:text-red-600">🗑️</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          }
        </>}

        {/* ========== EQUIPES TAB ========== */}
        {tab === 'equipes' && <>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-semibold">Equipes</h1>
              <select value={filtroMunicipio} onChange={e => setFiltroMunicipio(e.target.value)}
                className="rounded-lg border px-3 py-2 text-sm">
                <option value="">Todos os municípios</option>
                {municipios.map(m => <option key={m.id} value={m.id}>{m.nome} — {m.uf}</option>)}
              </select>
            </div>
            <button onClick={() => setShowEquipeForm(true)} className="rounded-lg bg-apex-gold px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600">+ Nova</button>
          </div>
          {showEquipeForm && (
            <form onSubmit={saveEquipe} className="mb-6 rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Nova Equipe</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
                <label className="flex flex-col gap-1 text-sm">Nome da Equipe *<input value={equipeForm.nome} onChange={e => setEquipeForm({...equipeForm, nome:e.target.value})} className="rounded-md border px-3 py-2" placeholder="eSF Centro" required /></label>
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
          {loading ? <p className="text-center text-gray-500">Carregando...</p> : equipes.filter(e => !filtroMunicipio || e.municipio_id === filtroMunicipio).length === 0 ? <p className="text-center text-gray-400">Nenhuma equipe.</p> :
            <div className="space-y-2">
              {equipes.filter(e => !filtroMunicipio || e.municipio_id === filtroMunicipio).map(eq => (
                <div key={eq.id} className="flex justify-between items-center rounded-lg border bg-white p-4">
                  <div>
                    <span className="font-semibold">{eq.nome}</span>
                    <span className="ml-2 text-xs rounded bg-gray-100 px-2 py-0.5">{eq.tipo.toUpperCase()}</span>
                    {eq.unidades_saude?.nome && <span className="ml-2 text-sm text-gray-500">· {eq.unidades_saude.nome}</span>}
                  </div>
                  <button onClick={() => deleteEquipe(eq.id)} className="text-xs text-red-400 hover:text-red-600">🗑️</button>
                </div>
              ))}
            </div>
          }
        </>}

        {/* ========== INDICADORES TAB ========== */}
        {tab === 'indicadores' && <>
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-2xl font-semibold">Indicadores</h1>
            <select value={filtroMunicipio} onChange={e => setFiltroMunicipio(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm">
              <option value="">Todas as cidades</option>
              {municipios.map(m => <option key={m.id} value={m.id}>{m.nome} — {m.uf}</option>)}
            </select>
          </div>
          {editingInd && (
            <form onSubmit={saveInd} className="mb-6 rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Editar: {editingInd.codigo} — {editingInd.nome}</h2>
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
          {loading ? <p className="text-center text-gray-500">Carregando...</p> :
            <div className="overflow-x-auto rounded-xl border bg-white">
              <table className="w-full text-sm">
                <thead className="bg-gray-50"><tr>
                  <th className="p-3 text-left">Código</th><th className="p-3 text-left">Nome</th><th className="p-3 text-left">Grupo</th><th className="p-3 text-center">Peso</th><th className="p-3 text-center">Meta</th><th className="p-3 text-center">Inv.</th><th className="p-3"></th>
                </tr></thead>
                <tbody>
                  {indicadores.map(ind => (
                    <tr key={ind.id} className="border-t hover:bg-gray-50">
                      <td className="p-3 font-mono font-semibold">{ind.codigo}</td><td className="p-3">{ind.nome}</td>
                      <td className="p-3 text-xs text-gray-500">{ind.grupo}</td>
                      <td className="p-3 text-center">{ind.peso}</td>
                      <td className="p-3 text-center">{ind.meta}{ind.escala10?'':'%'}</td>
                      <td className="p-3 text-center">{ind.invertido?'↓':'↑'}</td>
                      <td className="p-3"><button onClick={() => editInd(ind)} className="text-xs text-blue-600 hover:underline">✏️</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          }
        </>}

        {/* ========== INTEGRACAO PEC TAB ========== */}
        {tab === 'integracao' && <>
          <h1 className="text-2xl font-semibold mb-4">🔌 Integração PEC</h1>
          <p className="text-sm text-gray-500 mb-6">Configure a conexão com o banco do Prontuário Eletrônico para sincronizar dados.</p>

          {municipios.map(mun => {
            const pf = pecForms[mun.id] || { host:'', porta:'5432', database:'esus', usuario:'', senha:'', ativo:false };
            const st = pecStatus[mun.id] || '';
            return (
              <div key={mun.id} className="mb-4 rounded-xl border bg-white shadow-sm p-5">
                <h3 className="text-lg font-semibold">{mun.nome} — {mun.uf}</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  {['host','porta','database','usuario','senha'].map((campo, i) => (
                    <label key={i} className="flex flex-col gap-1 text-sm">{campo==='host'?'Host/IP':campo==='porta'?'Porta':campo==='database'?'Database':campo==='usuario'?'Usuário':'Senha'}
                      <input type={campo==='senha'?'password':'text'} value={pf[campo]||''}
                        onChange={e => setPecForms(f => ({...f, [mun.id]: {...pf, [campo]:e.target.value}}))}
                        className="rounded-md border px-3 py-2" placeholder={campo==='host'?'192.168.1.100':campo==='porta'?'5432':campo==='database'?'esus':''} />
                    </label>
                  ))}
                </div>
                <div className="mt-4 flex gap-3 items-center flex-wrap">
                  <button onClick={async () => {
                    setPecStatus(s => ({...s, [mun.id]: 'Testando...'}));
                    try {
                      const res = await fetch('/api/integracao/pec/config', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ municipio_id:mun.id, ...pf }) });
                      const j = await res.json();
                      setPecStatus(s => ({...s, [mun.id]: j.ok?'✅ Conectado!': '❌ '+j.error}));
                    } catch { setPecStatus(s => ({...s, [mun.id]: '❌ Falha'})); }
                  }} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">🔍 Testar Conexão</button>
                  <button onClick={async () => {
                    setPecStatus(s => ({...s, [mun.id]: 'Salvando...'}));
                    await fetch('/api/integracao/pec/config', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ municipio_id:mun.id, ...pf }) });
                    setPecStatus(s => ({...s, [mun.id]: '✅ Salvo!'}));
                  }} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">💾 Salvar Configuração</button>
                  <button onClick={async () => {
                    setPecStatus(s => ({...s, [mun.id]: 'Sincronizando...'}));
                    const res = await fetch('/api/integracao/pec/sincronizar', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ municipio_id:mun.id }) });
                    const j = await res.json();
                    setPecStatus(s => ({...s, [mun.id]: j.ok?`✅ ${j.total||0} registros`:'❌ '+j.error}));
                  }} className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700">🔄 Sincronizar Agora</button>
                  {st && <span className="text-sm font-medium">{st}</span>}
                </div>
              </div>
            );
          })}
        </>}
        {/* ========== USUARIOS TAB ========== */}
        {tab === 'usuarios' && <>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-semibold">Profissionais</h1>
              <select value={filtroUbs} onChange={e => setFiltroUbs(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
                <option value="">Todas as UBS</option>
                {municipios.flatMap(m => m.unidades).map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
              </select>
            </div>
            <button onClick={() => setShowUserForm(true)} className="rounded-lg bg-apex-gold px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600">+ Novo</button>
          </div>

          {showUserForm && (
            <form onSubmit={async e => {
              e.preventDefault(); setSaving(true);
              const res = await fetch('/api/admin/usuarios', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(userForm) });
              const j = await res.json();
              if (!res.ok) { alert(j.error); setSaving(false); return; }
              alert(`✅ Criado! Senha: ${j.senha}`);
              setShowUserForm(false); setUserForm({ email:'', nome:'', role:'profissional', municipio_id:'', unidade_id:'', equipe_id:'', perfil_id:'medico', password:'mudar123' });
              carregar(); setSaving(false);
            }} className="mb-6 rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Novo Profissional</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm">Nome *<input value={userForm.nome} onChange={e => setUserForm({...userForm, nome:e.target.value})} className="rounded-md border px-3 py-2" required /></label>
                <label className="flex flex-col gap-1 text-sm">Email *<input type="email" value={userForm.email} onChange={e => setUserForm({...userForm, email:e.target.value})} className="rounded-md border px-3 py-2" required /></label>
                <label className="flex flex-col gap-1 text-sm">Cargo
                  <select value={userForm.perfil_id} onChange={e => setUserForm({...userForm, perfil_id:e.target.value})} className="rounded-md border px-3 py-2">
                    {['medico','enfermeiro','tecnico','acs','dentista','asb','asco','psicologo','nutricionista','fisioterapeuta','farmaceutico','assistente_social','coordenador','gestor'].map(p => <option key={p} value={p}>{p}</option>)}
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
                <label className="flex flex-col gap-1 text-sm">Senha inicial<input value={userForm.password} onChange={e => setUserForm({...userForm, password:e.target.value})} className="rounded-md border px-3 py-2" /></label>
              </div>
              <div className="mt-4 flex gap-3">
                <button type="submit" disabled={saving} className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">Salvar</button>
                <button type="button" onClick={() => setShowUserForm(false)} className="rounded-lg border px-5 py-2 text-sm text-gray-500">Cancelar</button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto rounded-xl border bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-50"><tr>
                <th className="p-3 text-left">Nome</th><th className="p-3 text-left">Email</th><th className="p-3 text-left">Cargo</th><th className="p-3 text-left">Nível</th><th className="p-3 text-left">UBS</th><th className="p-3 text-left">Equipe</th><th className="p-3"></th>
              </tr></thead>
              <tbody>
                {usuarios.filter((u:any) => !filtroUbs || u.unidade_id === filtroUbs).map((u:any) => {
                  const ubs = municipios.flatMap(m => m.unidades).find(ub => ub.id === u.unidade_id);
                  const eq = equipes.find(e => e.id === u.equipe_id);
                  return (
                    <tr key={u.id} className="border-t hover:bg-gray-50">
                      <td className="p-3 font-medium">{u.nome}</td><td className="p-3 text-xs">{u.email}</td>
                      <td className="p-3 text-xs">{u.perfil_id}</td><td className="p-3"><span className="text-xs rounded bg-gray-100 px-2 py-0.5">{u.role}</span></td>
                      <td className="p-3 text-xs">{ubs?.nome||'—'}</td><td className="p-3 text-xs">{eq?.nome||'—'}</td>
                      <td className="p-3"><button onClick={async () => { if(!confirm('Excluir?')) return; await fetch(`/api/admin/usuarios?id=${u.id}`,{method:'DELETE'}); carregar(); }} className="text-xs text-red-400 hover:text-red-600">🗑️</button></td>
                    </tr>
                  );
                })}
                {usuarios.filter((u:any) => !filtroUbs || u.unidade_id === filtroUbs).length === 0 && (
                  <tr><td colSpan={7} className="p-6 text-center text-gray-400">Nenhum profissional cadastrado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>}
        {/* ========== GESTAO TAB ========== */}
        {tab === 'gestao' && <>
          <div className="flex items-center gap-4 mb-6">
            <h1 className="text-2xl font-semibold">📊 Gestão Geral de Indicadores</h1>
            <select value={filtroMunicipio} onChange={e => setFiltroMunicipio(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm">
              <option value="">Todos os municípios</option>
              {municipios.map(m => <option key={m.id} value={m.id}>{m.nome} — {m.uf}</option>)}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            {[{ id:'medico', icon:'👨‍⚕️', nome:'Médico', grupo:'eSF', ind:4 },{ id:'enfermeiro', icon:'👩‍⚕️', nome:'Enfermeiro', grupo:'eSF', ind:3 },{ id:'tecnico', icon:'🩺', nome:'Técnico Enfermagem', grupo:'eSF', ind:3 },{ id:'acs', icon:'🏘️', nome:'ACS', grupo:'eSF', ind:3 },{ id:'dentista', icon:'🦷', nome:'Dentista', grupo:'eSB', ind:6 },{ id:'psicologo', icon:'🧠', nome:'Psicólogo', grupo:'eMulti', ind:2 },{ id:'fisio', icon:'🏃', nome:'Fisioterapeuta', grupo:'eMulti', ind:2 },{ id:'nutricionista', icon:'🥗', nome:'Nutricionista', grupo:'eMulti', ind:2 },{ id:'assistente', icon:'🤝', nome:'Assistente Social', grupo:'eMulti', ind:2 },{ id:'farmaceutico', icon:'💊', nome:'Farmacêutico', grupo:'eMulti', ind:2 },{ id:'coordenador', icon:'📋', nome:'Coordenador', grupo:'Gestão', ind:2 },{ id:'gestor', icon:'🏛️', nome:'Gestor', grupo:'Gestão', ind:2 }].map(p => (
              <a key={p.id} href={`/dashboard/${p.id}`} target="_blank" className="rounded-xl border bg-white p-5 shadow-sm hover:shadow-md hover:border-apex-gold transition-all group">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{p.icon}</span>
                  <div><h3 className="font-semibold">{p.nome}</h3><p className="text-xs text-gray-500">{p.grupo} · {p.ind} indicadores</p></div>
                </div>
                <div className="mt-3 text-xs text-apex-gold opacity-0 group-hover:opacity-100 transition-opacity">Ver dashboard →</div>
              </a>
            ))}
          </div>
          <h2 className="text-lg font-semibold mt-4 mb-3">🚀 Acesso por município</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(filtroMunicipio ? municipios.filter(m => m.id === filtroMunicipio) : municipios).map(mun => (
              <div key={mun.id} className="rounded-xl border bg-white p-4 shadow-sm">
                <h3 className="font-semibold">{mun.nome} — {mun.uf}</h3>
                <p className="text-xs text-gray-500 mb-3">{mun.unidades_count} UBS · {equipes.filter(e=>e.municipio_id===mun.id).length} equipes</p>
                <div className="flex flex-wrap gap-1.5">
                  <a href="/gerencial" className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">📊 Gerencial</a>
                  <a href="/paineis/esf" className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded hover:bg-emerald-200">🏥 eSF</a>
                  <a href="/paineis/esb" className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded hover:bg-amber-200">🦷 eSB</a>
                  <a href="/paineis/emulti" className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200">🤝 eMulti</a>
                  <a href="/guias/esf" className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200">📖 Guia</a>
                </div>
              </div>
            ))}
          </div>
        </>}
      </main>
    </div>
  );
}
