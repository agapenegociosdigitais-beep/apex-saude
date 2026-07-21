import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  matcher: [
    // Rotas protegidas (exige login)
    '/painel/:path*',
    '/dashboard/:path*',
    '/gerencial/:path*',
    '/simulador/:path*',
    '/ia/:path*',
    '/admin/:path*',
    '/paineis/:path*',
    '/guias/:path*',
    '/profissionais/:path*',
    '/equipes/:path*',
    '/gestao/:path*',
    '/api/admin/:path*',
  ],
}
