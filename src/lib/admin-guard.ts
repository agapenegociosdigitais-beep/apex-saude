/**
 * Admin API guard — defesa em profundidade para rotas /api/admin/*
 *
 * O middleware já garante role='admin'|'gestor' para esta familia de
 * rotas, mas cada handler tambem verifica. Se alguem adicionar uma
 * rota nova e esquecer o matcher, ou se o middleware tiver um bug,
 * essa camada extra impede acesso nao autorizado a operacoes que
 * usam service_role (poder total sobre o banco).
 */
import { criarClienteSupabase } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function requireAdmin() {
  const client = await criarClienteSupabase()
  const { data: { user } } = await client.auth.getUser()
  if (!user) return NextResponse.json({ erro: 'Nao autorizado' }, { status: 401 })
  const { data: usuario } = await client.from('usuarios').select('role').eq('id', user.id).single()
  if (!usuario || !['admin', 'gestor'].includes(usuario.role)) {
    return NextResponse.json({ erro: 'Permissao negada' }, { status: 403 })
  }
  return null // ok, pode continuar
}
