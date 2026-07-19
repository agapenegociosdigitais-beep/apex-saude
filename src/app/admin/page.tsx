import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { MUNICIPIO_MOCK } from '@/lib/mock/municipio';

const CHECKLIST_FASE2 = [
  { item: 'Criar projeto Supabase "apex-saude"', feito: false },
  { item: 'Rodar schema SQL (partes 1-3 + RPC + migration)', feito: false },
  { item: 'Configurar NEXT_PUBLIC_SUPABASE_URL e ANON_KEY no .env.local e na Vercel', feito: false },
  { item: 'Ativar magic link (SMTP) no Supabase Auth', feito: false },
  { item: 'Receber credenciais do banco PEC (TI Belterra)', feito: false },
  { item: 'Enviar pec-sync.py para a VPS com cron 6h', feito: false },
];

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-apex-bg">
      <DashboardHeader nomePerfil="Administração" equipe="Configuração do sistema" icon="⚙️" />
      <main className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="font-display text-3xl font-semibold text-apex-ink">Administração</h1>
        <p className="mt-1 text-apex-muted">Estado da plataforma e próximos passos de implantação</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-5 shadow-sm">
            <p className="font-semibold text-amber-800">Supabase</p>
            <p className="mt-1 text-sm text-amber-700">Não configurado — modo demonstração</p>
          </div>
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-5 shadow-sm">
            <p className="font-semibold text-amber-800">Integração PEC</p>
            <p className="mt-1 text-sm text-amber-700">Aguardando credenciais do TI municipal</p>
          </div>
          <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-5 shadow-sm">
            <p className="font-semibold text-emerald-800">Deploy</p>
            <p className="mt-1 text-sm text-emerald-700">Vercel em produção · {MUNICIPIO_MOCK.equipes.length} equipes mock</p>
          </div>
        </div>

        <section className="mt-8 rounded-xl border border-apex-border bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-semibold text-apex-ink">
            Checklist de implantação (Fase 2)
          </h2>
          <ul className="mt-4 space-y-2.5">
            {CHECKLIST_FASE2.map((c) => (
              <li key={c.item} className="flex items-start gap-2.5 text-sm text-apex-text">
                <span
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                    c.feito ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-apex-border'
                  }`}
                >
                  {c.feito ? '✓' : ''}
                </span>
                {c.item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-6 rounded-xl border border-apex-border bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-semibold text-apex-ink">Integração PEC — API</h2>
          <p className="mt-2 text-sm text-apex-muted">
            Rotas disponíveis quando o Supabase estiver configurado:
          </p>
          <ul className="mt-3 space-y-1.5 font-mono text-sm text-apex-text">
            <li>GET/POST /api/integracao/pec/config</li>
            <li>POST /api/integracao/pec/sincronizar</li>
            <li>GET /api/integracao/pec/status</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
