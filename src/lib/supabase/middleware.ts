import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLICAS = ['/login']

function isPublica(pathname: string) {
  return PUBLICAS.some(r => pathname.startsWith(r))
}

export async function updateSession(request: NextRequest): Promise<NextResponse> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return NextResponse.next({ request })

  let response = NextResponse.next({ request })
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() { return request.cookies.getAll() },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  if (!user && !isPublica(pathname)) {
    const redirect = request.nextUrl.clone()
    redirect.pathname = '/login'
    redirect.searchParams.set('next', pathname)
    return NextResponse.redirect(redirect)
  }

  // Bloquear /admin para quem não é admin/gestor
  if (user && pathname.startsWith('/admin')) {
    const role = user.user_metadata?.role || 'profissional'
    if (role !== 'admin' && role !== 'gestor') {
      const redirect = request.nextUrl.clone()
      redirect.pathname = '/'
      return NextResponse.redirect(redirect)
    }
  }

  // Bloquear /api/admin para quem não é admin/gestor
  if (user && pathname.startsWith('/api/admin')) {
    const role = user.user_metadata?.role || 'profissional'
    if (role !== 'admin' && role !== 'gestor') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|brand|icon.png|favicon.ico).*)'],
}
