'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { criarClienteBrowser, supabaseConfigurado } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'enviado' | 'erro'>('idle')
  const [mensagemErro, setMensagemErro] = useState('')
  const router = useRouter()

  async function loginComSenha(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setMensagemErro('')
    try {
      const supabase = criarClienteBrowser()
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha })
      if (error) throw error
      router.push('/admin')
      router.refresh()
    } catch (err: unknown) {
      setMensagemErro(err instanceof Error ? err.message : 'Falha no login')
      setStatus('erro')
    }
  }

  async function enviarMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setMensagemErro('')
    try {
      const supabase = criarClienteBrowser()
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/admin` },
      })
      if (error) throw error
      setStatus('enviado')
    } catch (err: unknown) {
      setMensagemErro(err instanceof Error ? err.message : 'Falha ao enviar link')
      setStatus('erro')
    }
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

      {status === 'enviado' ? (
        <div className="mt-8 w-full rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-800">
          Link enviado para <strong>{email}</strong>. Verifique sua caixa de entrada.
        </div>
      ) : (
        <>
          {/* Email + Senha */}
          <form onSubmit={loginComSenha} className="mt-8 w-full space-y-3">
            <input
              type="email" required value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="agapenegociosdigitais@gmail.com"
              className="w-full rounded-lg border px-4 py-2.5 outline-none focus:border-apex-gold"
            />
            <input
              type="password" required value={senha}
              onChange={e => setSenha(e.target.value)}
              placeholder="Senha"
              className="w-full rounded-lg border px-4 py-2.5 outline-none focus:border-apex-gold"
            />
            <button type="submit" disabled={status === 'loading'}
              className="w-full rounded-lg bg-apex-gold px-4 py-2.5 font-medium text-white hover:bg-amber-600 disabled:opacity-60">
              {status === 'loading' ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          {/* Divisor */}
          <div className="mt-6 flex w-full items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-400">ou</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          {/* Magic Link */}
          <form onSubmit={enviarMagicLink} className="mt-4 w-full space-y-3">
            <button type="submit" disabled={status === 'loading' || !email}
              className="w-full rounded-lg border px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50">
              Enviar link mágico por email
            </button>
          </form>
        </>
      )}

      {status === 'erro' && (
        <p className="mt-4 text-sm text-red-600">{mensagemErro}</p>
      )}
    </main>
  )
}
