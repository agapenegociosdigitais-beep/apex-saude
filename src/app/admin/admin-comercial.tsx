import Link from 'next/link'

export default function AdminComercial() {
  const planos = [
    { nome:'Essencial', preco:'R$ 197/mês', cor:'bg-gray-100',
      itens:['Até 3 perfis profissionais','1 painel de equipe','Dashboard individual','Suporte por email','Atualizações mensais'] },
    { nome:'Profissional', preco:'R$ 497/mês', cor:'bg-apex-gold text-white', destaque:true,
      itens:['Até 12 perfis profissionais','3 painéis de equipe','Dashboard gerencial','Simulador financeiro','Suporte prioritário','Integração PEC'] },
    { nome:'Municipal', preco:'Sob consulta', cor:'bg-apex-ink text-white',
      itens:['Ilimitado profissionais','Todos os painéis','PDCA por indicador','API de integração','Suporte 24/7','Treinamento da equipe','Personalização de indicadores'] },
  ]

  return (
    <section>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-apex-ink">💼 Proposta Comercial</h2>
        <p className="text-apex-muted mt-1">Planos, contratação e inexigibilidade de licitação (Art. 74, III, Lei 14.133/2021).</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-10">
        {planos.map(p => (
          <div key={p.nome} className={`rounded-xl border shadow-sm overflow-hidden ${p.destaque ? 'border-apex-gold ring-2 ring-apex-gold/20' : 'border-gray-200'}`}>
            <div className={`p-6 ${p.cor}`}>
              <h3 className="text-xl font-bold">{p.nome}</h3>
              <p className="text-3xl font-bold mt-2">{p.preco}</p>
              {p.destaque && <span className="text-xs bg-white/20 px-2 py-0.5 rounded mt-2 inline-block">Mais popular</span>}
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                {p.itens.map(item => (
                  <li key={item} className="flex items-start gap-2 text-sm text-apex-ink">
                    <span className="text-apex-gold mt-0.5">✓</span> {item}
                  </li>
                ))}
              </ul>
              <button className={`mt-6 w-full rounded-lg py-2.5 text-sm font-semibold transition-colors ${
                p.destaque ? 'bg-apex-gold text-white hover:bg-amber-600' : 'bg-apex-ink text-white hover:bg-gray-800'
              }`}>
                {p.preco === 'Sob consulta' ? 'Falar com consultor' : 'Contratar'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Fundamentação legal */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-apex-ink mb-3">📜 Fundamentação Legal — Inexigibilidade de Licitação</h3>
        <div className="text-sm text-apex-muted space-y-2">
          <p><strong>Base legal:</strong> Art. 74, III da Lei 14.133/2021 — é inexigível a licitação quando inviável a competição, especialmente para serviços técnicos especializados de natureza singular.</p>
          <p><strong>Natureza singular:</strong> O ÁPEX Saúde é a única plataforma que implementa integralmente os 15 indicadores da NT 6/2025 com motor PDCA por perfil profissional e simulador de repasse alinhado à Nova PNAB.</p>
          <p><strong>Documentação:</strong> Dispomos de atestados de capacidade técnica, justificativa de preço, e parecer jurídico modelo para instrução do processo.</p>
        </div>
        <div className="mt-4 flex gap-3">
          <Link href="/proposta" className="text-sm text-apex-gold hover:underline">Ver página completa →</Link>
        </div>
      </div>
    </section>
  )
}
