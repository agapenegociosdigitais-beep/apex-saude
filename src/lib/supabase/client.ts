import { createBrowserClient } from '@supabase/ssr'

/** True quando as envs publicas do Supabase estao definidas (build/runtime). */
export function supabaseConfigurado(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

/**
 * Cliente Supabase para Browser Components (login, forms).
 * Lanca erro claro se env nao configurada.
 */
export function criarClienteBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    throw new Error(
      'Supabase nao configurado: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local'
    )
  }
  return createBrowserClient(url, anonKey)
}
