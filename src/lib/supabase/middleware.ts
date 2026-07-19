import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const ROTAS_PUBLICAS = ['/login', '/admin', '/api/admin']

function urlEpublica(pathname: string): boolean {
  return ROTAS_PUBLICAS.some((r) => pathname.startsWith(r))
}

/**
 * Renova a sessao do Supabase a cada request e protege rotas autenticadas.
 * Sem env configurada (modo demonstracao local), passa direto sem bloquear.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Modo demonstracao: sem Supabase configurado, nao ha auth para enforce
  if (!url || !anonKey) return NextResponse.next({ request })

  let response = NextResponse.next({ request })

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user && !urlEpublica(request.nextUrl.pathname)) {
    const redirect = request.nextUrl.clone()
    redirect.pathname = '/login'
    redirect.searchParams.set('next', request.nextUrl.pathname)
    return NextResponse.redirect(redirect)
  }

  return response
}
