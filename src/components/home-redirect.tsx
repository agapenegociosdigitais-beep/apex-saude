'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/lib/hooks/useUser';

export default function HomeRedirect() {
  const user = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next');

  useEffect(() => {
    // Só redireciona se veio do login (tem ?next=) ou se é profissional (vai pro dashboard)
    if (user.loading || !user.id) return;
    if (!next) return; // acesso direto à home — deixa ver

    if (user.role === 'admin') router.replace('/admin');
    else if (user.role === 'gestor' || user.role === 'coordenador') router.replace('/gerencial');
    else router.replace(`/dashboard/${user.perfil_id}`);
  }, [user.loading, user.role, user.perfil_id, user.id, next, router]);

  return null;
}
