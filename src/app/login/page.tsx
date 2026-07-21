'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BrandLogo } from '@/components/brand-logo'
import { criarClienteBrowser, supabaseConfigurado } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [msg, setMsg] = useState('')
  const router = useRouter()
  const hasSupabase = supabaseConfigurado()

  async function login(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErro('')
    setMsg('')

    if (!hasSupabase) {
      setMsg('Modo demonstração — abrindo o painel…')
      router.push('/painel')
      setLoading(false)
      return
    }

    try {
      const supabase = criarClienteBrowser()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      })
      if (error) throw error
      const role = data.user?.user_metadata?.role || 'profissional'
      const destino =
        role === 'admin' ? '/admin' : role === 'gestor' ? '/gerencial' : '/painel'
      router.push(destino)
      router.refresh()
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : 'Falha no login')
    } finally {
      setLoading(false)
    }
  }

  async function forgotPassword(e: React.MouseEvent) {
    e.preventDefault()
    if (!email) {
      setErro('Informe o e-mail para recuperar a senha.')
      return
    }
    if (!hasSupabase) {
      setMsg('Recuperação disponível com Supabase configurado.')
      return
    }
    setLoading(true)
    setErro('')
    try {
      const supabase = criarClienteBrowser()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      })
      if (error) throw error
      setMsg('Enviamos um link de recuperação para o seu e-mail.')
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : 'Não foi possível enviar o link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center px-4 py-10">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 35%, #1a4d2e 0%, #0b2b17 50%, #00361a 100%)',
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,transparent_20%,rgba(0,0,0,0.4)_100%)]" />

      <div className="login-card relative z-10 w-full max-w-[400px] rounded-2xl px-7 py-9 sm:px-9 sm:py-10 text-center">
        <div className="flex justify-center">
          <BrandLogo size="xl" href={null} onDark priority />
        </div>

        <h1 className="mt-5 text-[28px] font-bold text-white tracking-tight">Entrar</h1>
        <p className="mt-1.5 text-sm text-white/70">
          Acesso restrito a profissionais cadastrados.
        </p>

        {!hasSupabase && (
          <p className="mt-4 text-xs text-secondary-fixed bg-black/25 rounded-lg px-3 py-2 border border-white/10">
            Demo: use qualquer e-mail e senha para entrar.
          </p>
        )}

        <form onSubmit={login} className="mt-7 space-y-3.5 text-left">
          <label className="block">
            <span className="block text-xs font-semibold text-white/85 mb-1.5">E-mail</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu.email@prefeitura.gov.br"
              className="login-input w-full rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none"
            />
          </label>

          <label className="block">
            <span className="block text-xs font-semibold text-white/85 mb-1.5">Senha</span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              className="login-input w-full rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#fed977] text-[#241a00] font-semibold text-[15px] py-3 mt-1
              hover:bg-[#ffe08f] transition-colors shadow-md disabled:opacity-60"
          >
            {loading ? 'Entrando…' : 'Entrar'}
          </button>

          {erro && (
            <p className="text-sm text-red-200 text-center bg-red-950/50 rounded-lg px-3 py-2 border border-red-400/30">
              {erro}
            </p>
          )}
          {msg && (
            <p className="text-sm text-primary-fixed text-center bg-black/25 rounded-lg px-3 py-2 border border-white/10">
              {msg}
            </p>
          )}
        </form>

        <button
          type="button"
          onClick={forgotPassword}
          className="mt-5 text-sm text-[#fed977] hover:text-[#ffe08f] underline-offset-2 hover:underline"
        >
          Esqueci minha senha
        </button>

        <div className="mt-6 pt-4 border-t border-white/10">
          <Link href="/" className="text-xs text-white/55 hover:text-white/90">
            ← Voltar ao site
          </Link>
        </div>
      </div>
    </main>
  )
}
