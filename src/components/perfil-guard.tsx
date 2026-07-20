'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUser } from '@/lib/hooks/useUser';

export function PerfilGuard({ children }: { children: React.ReactNode }) {
  const user = useUser();
  const router = useRouter();
  const params = useParams<{ perfil: string }>();

  useEffect(() => {
    if (user.loading) return;
    if (!user.id) { router.replace('/login'); return; }

    // Admin/gestor podem ver qualquer perfil
    if (user.role === 'admin' || user.role === 'gestor') return;

    // Profissional/coordenador só veem o próprio perfil
    if (user.perfil_id && params?.perfil && user.perfil_id !== params.perfil) {
      router.replace(`/dashboard/${user.perfil_id}`);
    }
  }, [user.loading, user.id, user.role, user.perfil_id, params?.perfil, router]);

  if (user.loading) return <div className="p-8 text-center text-gray-500">Carregando...</div>;
  return <>{children}</>;
}
