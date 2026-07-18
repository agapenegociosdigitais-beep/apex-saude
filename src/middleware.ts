import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  matcher: [
    // Protege app inteiro exceto assets e api publica
    '/((?!_next/static|_next/image|brand|icon.png|favicon.ico).*)',
  ],
}
