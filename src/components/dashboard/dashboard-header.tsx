'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { criarClienteBrowser } from '@/lib/supabase/client';
import { useUser } from '@/lib/hooks/useUser';

const ROLE_LABEL: Record<string, string> = {
  admin: 'Admin', gestor: 'Gestor', coordenador: 'Coordenador', profissional: 'Profissional',
};

const PERFIL_ICON: Record<string, string> = {
  medico:'👨‍⚕️', enfermeiro:'👩‍⚕️', tecnico:'🩺', acs:'🏘️', dentista:'🦷', asb:'🦷', asco:'🦷',
  psicologo:'🧠', fisioterapeuta:'🏃', nutricionista:'🥗', farmaceutico:'💊',
  assistente_social:'🤝', coordenador:'📋', gestor:'🏛️', admin:'⚙️',
};

export function DashboardHeader() {
  const user = useUser();
  const router = useRouter();

  async function logout() {
    const supabase = criarClienteBrowser();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  const icon = PERFIL_ICON[user.perfil_id] || '👤';
  const nome = user.nome || user.email || 'Usuário';
  const cargo = user.perfil_id || '';
  const role = ROLE_LABEL[user.role] || user.role;
  const local = user.municipio_nome && user.unidade_nome
    ? `${user.municipio_nome} · ${user.unidade_nome}`
    : user.municipio_nome || user.unidade_nome || '';

  return (
    <header className="border-b border-apex-border bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href={user.role === 'admin' ? '/admin' : '/'} className="flex items-center gap-3">
          <Image src="/brand/logo-icon.png" alt="ÁPEX Saúde" width={36} height={36} className="rounded" />
          <span className="font-display text-xl font-semibold text-apex-ink">ÁPEX Saúde</span>
        </Link>
        <div className="flex items-center gap-4">
          {!user.loading && (
            <div className="text-right">
              <p className="text-sm font-medium text-apex-ink">{icon} {nome}</p>
              <p className="text-xs text-apex-muted">{cargo} · {role}{local && <span className="text-gray-300 mx-1">|</span>}{local}</p>
            </div>
          )}
          <button onClick={logout}
            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors">
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
