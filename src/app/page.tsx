import Image from 'next/image';
import Link from 'next/link';
import { PERFIS, PERFIL_IDS } from '@/lib/mock/perfis';
import { EQUIPES, EQUIPE_IDS } from '@/lib/mock/equipes';

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="flex flex-col items-center text-center">
        <Image
          src="/brand/logo-full.png"
          alt="ÁPEX Saúde"
          width={220}
          height={80}
          className="h-auto w-56"
          priority
        />
        <h1 className="mt-6 font-display text-4xl font-semibold text-apex-ink">
          Gestão de Indicadores da APS
        </h1>
        <p className="mt-3 max-w-xl text-apex-muted">
          Acompanhe os 15 indicadores oficiais da NT 6/2025 por perfil profissional.
          Selecione seu perfil para abrir o dashboard.
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PERFIL_IDS.map((id) => {
          const perfil = PERFIS[id];
          return (
            <Link
              key={id}
              href={`/dashboard/${id}`}
              className="group rounded-xl border border-apex-border bg-white p-5 shadow-sm transition hover:border-apex-gold hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{perfil.icon}</span>
                <div>
                  <h2 className="font-semibold text-apex-ink group-hover:text-apex-gold">
                    {perfil.nome}
                  </h2>
                  <p className="text-sm text-apex-muted">{perfil.equipe}</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-apex-muted">
                {perfil.indicadores.length} indicadores monitorados
              </p>
            </Link>
          );
        })}
      </div>
      <section className="mt-14">
        <h2 className="text-center font-display text-2xl font-semibold text-apex-ink">
          Painéis de equipe
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {EQUIPE_IDS.map((id) => {
            const equipe = EQUIPES[id];
            return (
              <Link
                key={id}
                href={`/paineis/${id}`}
                className="group rounded-xl border border-apex-border bg-white p-5 text-center shadow-sm transition hover:border-apex-gold hover:shadow-md"
              >
                <span className="text-3xl">{equipe.icon}</span>
                <h3 className="mt-2 font-semibold text-apex-ink group-hover:text-apex-gold">
                  {equipe.nome}
                </h3>
                <p className="mt-1 text-xs text-apex-muted">{equipe.descricao}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
