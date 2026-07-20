'use client';

import { useEffect, useState } from 'react';
import { criarClienteBrowser } from '@/lib/supabase/client';

interface UserData {
  id: string; email: string; nome: string;
  role: 'admin' | 'gestor' | 'coordenador' | 'profissional';
  perfil_id: string;
  municipio_id: string | null; unidade_id: string | null; equipe_id: string | null;
  municipio_nome: string; unidade_nome: string;
  loading: boolean;
}

export function useUser(): UserData {
  const [user, setUser] = useState<UserData>({
    id: '', email: '', nome: '', role: 'profissional', perfil_id: '',
    municipio_id: null, unidade_id: null, equipe_id: null,
    municipio_nome: '', unidade_nome: '', loading: true,
  });

  useEffect(() => {
    async function load() {
      const supabase = criarClienteBrowser();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { setUser(u => ({ ...u, loading: false })); return; }

      const meta = session.user.user_metadata || {};
      const email = session.user.email || '';

      // Busca da tabela usuarios + join municipios + unidades_saude
      const { data, error } = await supabase
        .from('usuarios')
        .select('*, municipios!inner(nome), unidades_saude!left(nome)')
        .eq('id', session.user.id)
        .single();

      if (data && !error) {
        setUser({
          id: data.id, email: data.email || email, nome: data.nome || meta.nome || email,
          role: data.role || meta.role || 'profissional',
          perfil_id: data.perfil_id || meta.perfil || 'medico',
          municipio_id: data.municipio_id, unidade_id: data.unidade_id, equipe_id: data.equipe_id,
          municipio_nome: data.municipios?.nome || '',
          unidade_nome: data.unidades_saude?.nome || '',
          loading: false,
        });
      } else {
        setUser({
          id: session.user.id, email,
          nome: meta.nome || email, role: meta.role || 'profissional',
          perfil_id: meta.perfil || 'medico',
          municipio_id: null, unidade_id: null, equipe_id: null,
          municipio_nome: '', unidade_nome: '', loading: false,
        });
      }
    }
    load();
  }, []);

  return user;
}
