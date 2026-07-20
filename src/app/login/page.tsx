'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { criarClienteBrowser, supabaseConfigurado } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const router = useRouter()

  async function login(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErro('')
    try {
      const supabase = criarClienteBrowser()
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha })
      if (error) throw error
      const role = data.user?.user_metadata?.role || 'profissional'
      const destino = role === 'admin' ? '/admin' : role === 'gestor' ? '/gerencial' : '/'
      router.push(destino)
      router.refresh()
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : 'Falha no login')
    } finally { setLoading(false) }
  }

  if (!supabaseConfigurado()) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 py-16">
        <Image src="/brand/logo-full.png" alt="ÁPEX Saúde" width={180} height={66} className="h-auto w-44" priority />
        <h1 className="mt-6 text-3xl font-semibold">Entrar</h1>
        <div className="mt-8 w-full rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          Modo demonstração. Configure o Supabase para login real.
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 py-16">
      <Image src="/brand/logo-full.png" alt="ÁPEX Saúde" width={180} height={66} className="h-auto w-44" priority />
      <h1 className="mt-6 text-3xl font-semibold">Entrar</h1>
      <p className="mt-2 text-sm text-gray-500">Acesso restrito a profissionais cadastrados.</p>
      <form onSubmit={login} className="mt-8 w-full space-y-3">
        <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
          placeholder="seu.email@prefeitura.gov.br"
          className="w-full rounded-lg border px-4 py-2.5 outline-none focus:border-apex-gold" />
        <input type="password" required value={senha} onChange={e => setSenha(e.target.value)}
          placeholder="Senha"
          className="w-full rounded-lg border px-4 py-2.5 outline-none focus:border-apex-gold" />
        <button type="submit" disabled={loading}
          className="w-full rounded-lg bg-apex-gold px-4 py-2.5 font-medium text-white hover:bg-amber-600 disabled:opacity-60">
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
        {erro && <p className="text-sm text-red-600">{erro}</p>}
      </form>
    </main>
  )
}
