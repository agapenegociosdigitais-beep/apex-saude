import Link from 'next/link';
import { BrandLogo } from '@/components/brand-logo';

const PLANOS = [
  {
    nome: 'Pequeno',
    porte: '1 a 3 equipes',
    mensal: 1997,
    implantacao: 8000,
    consultoria: 2500,
    destaque: false,
  },
  {
    nome: 'Médio',
    porte: '4 a 10 equipes',
    mensal: 3497,
    implantacao: 15000,
    consultoria: 5000,
    destaque: true,
  },
  {
    nome: 'Grande',
    porte: '11 a 25 equipes',
    mensal: 4997,
    implantacao: 25000,
    consultoria: 8000,
    destaque: false,
  },
];

const INCLUSO = [
  'Dashboard dos 15 indicadores (NT 6/2025) por perfil e equipe',
  'Sincronização automática com o PEC/e-SUS a cada 6h',
  'Alertas de prazo Siaps e planos de ação PDCA',
  'Guias de indicadores e treinamento da equipe',
  'Simulador financeiro do repasse federal',
  'Suporte e atualizações contínuas',
];

export default function PropostaPage() {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-outline-variant/40 bg-surface">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <BrandLogo size="md" href="/" priority />
          <Link href="/login" className="text-sm font-semibold text-primary hover:underline">
            Entrar
          </Link>
        </div>
      </header>
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-12">
      <div className="flex flex-col items-center text-center">
        <BrandLogo size="xl" href={null} priority />
        <h1 className="mt-6 max-w-2xl text-3xl sm:text-4xl font-bold text-on-surface">
          Gestão de indicadores que protege o repasse do seu município
        </h1>
        <p className="mt-4 max-w-xl text-on-surface-variant">
          O único sistema focado exclusivamente nos 15 indicadores oficiais da APS
          (NT 6/2025), com IA para planos de ação e integração automática com o PEC.
        </p>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {PLANOS.map((p) => (
          <section
            key={p.nome}
            className={`rounded-xl border p-6 shadow-sm ${
              p.destaque
                ? 'border-apex-gold bg-white ring-1 ring-apex-gold'
                : 'border-apex-border bg-white'
            }`}
          >
            {p.destaque && (
              <span className="rounded-full bg-apex-gold px-3 py-0.5 text-xs font-medium text-white">
                Mais contratado
              </span>
            )}
            <h2 className="mt-3 font-display text-2xl font-semibold text-apex-ink">{p.nome}</h2>
            <p className="text-sm text-apex-muted">{p.porte}</p>
            <p className="mt-4">
              <span className="font-mono text-3xl text-apex-ink">
                R$ {p.mensal.toLocaleString('pt-BR')}
              </span>
              <span className="text-sm text-apex-muted">/mês</span>
            </p>
            <ul className="mt-4 space-y-2 text-sm text-apex-text">
              <li>Implantação: R$ {p.implantacao.toLocaleString('pt-BR')} (única)</li>
              <li>Consultoria opcional: R$ {p.consultoria.toLocaleString('pt-BR')}/mês</li>
            </ul>
            <a
              href="mailto:contato@apextitan.app?subject=Proposta%20ÁPEX%20Saúde"
              className={`mt-6 block rounded-lg px-4 py-2.5 text-center font-medium transition ${
                p.destaque
                  ? 'bg-apex-gold text-white hover:bg-apex-gold-light'
                  : 'border border-apex-border text-apex-ink hover:border-apex-gold'
              }`}
            >
              Solicitar proposta
            </a>
          </section>
        ))}
      </div>

      <section className="mt-12 rounded-xl border border-apex-border bg-white p-8 shadow-sm">
        <h2 className="font-display text-xl font-semibold text-apex-ink">Tudo incluso</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {INCLUSO.map((item) => (
            <p key={item} className="flex items-start gap-2.5 text-sm text-apex-text">
              <span className="mt-0.5 text-emerald-600">✓</span>
              {item}
            </p>
          ))}
        </div>
        <p className="mt-6 text-sm text-apex-muted">
          Contratação por <strong>inexigibilidade de licitação</strong> (Art. 74, III, Lei
          14.133/2021) — fornecedor exclusivo especializado. Documentação de apoio disponível.
        </p>
      </section>

      <p className="mt-8 text-center text-sm text-on-surface-variant">
        Prefeitura de Belterra-PA: piloto com condições especiais ·{' '}
        <Link href="/painel" className="text-primary underline">ver demonstração do sistema</Link>
      </p>
      </div>
    </main>
  );
}
