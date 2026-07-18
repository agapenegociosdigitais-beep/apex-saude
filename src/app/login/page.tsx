'use client'

import { useState } from 'react'
import Image from 'next/image'
import { criarClienteBrowser, supabaseConfigurado } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'enviando' | 'enviado' | 'erro'>('idle')
  const [mensagemErro, setMensagemErro] = useState('')

  async function enviarMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setStatus('enviando')
    setMensagemErro('')
    try {
      const supabase = criarClienteBrowser()
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/` },
      })
      if (error) throw error
      setStatus('enviado')
    } catch (err: unknown) {
      setMensagemErro(err instanceof Error ? err.message : 'Falha ao enviar link')
      setStatus('erro')
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 py-16">
      <Image
        src="/brand/logo-full.png"
        alt="ÁPEX Saúde"
        width={180}
        height={66}
        className="h-auto w-44"
        priority
      />
      <h1 className="mt-6 font-display text-3xl font-semibold text-apex-ink">Entrar</h1>
      <p className="mt-2 text-center text-sm text-apex-muted">
        Acesso via link mágico — sem senha. Informe seu e-mail institucional.
      </p>

      {!supabaseConfigurado() ? (
        <div className="mt-8 w-full rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          Modo demonstração: Supabase ainda não configurado. Defina as variáveis em
          <code className="mx-1 font-mono">.env.local</code> para ativar o login real.
        </div>
      ) : status === 'enviado' ? (
        <div className="mt-8 w-full rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-800">
          Link enviado para <strong>{email}</strong>. Verifique sua caixa de entrada.
        </div>
      ) : (
        <form onSubmit={enviarMagicLink} className="mt-8 w-full space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu.email@prefeitura.gov.br"
            className="w-full rounded-lg border border-apex-border bg-white px-4 py-2.5 text-apex-ink outline-none focus:border-apex-gold"
          />
          <button
            type="submit"
            disabled={status === 'enviando'}
            className="w-full rounded-lg bg-apex-gold px-4 py-2.5 font-medium text-white transition hover:bg-apex-gold-light disabled:opacity-60"
          >
            {status === 'enviando' ? 'Enviando…' : 'Enviar link mágico'}
          </button>
          {status === 'erro' && (
            <p className="text-sm text-red-600">{mensagemErro}</p>
          )}
        </form>
      )}
    </main>
  )
}
