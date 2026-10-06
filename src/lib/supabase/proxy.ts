import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { SUPABASE_KEY, SUPABASE_URL } from '@/lib/supabase/env'
import type { Database } from '@/lib/supabase/types'

function isPublicPath(pathname: string): boolean {
  return pathname === '/login' || pathname.startsWith('/api/auth')
}

/** Redirige sin perder las cookies de sesión que Supabase haya renovado en esta petición. */
function redirectWithSession(url: URL, sessionResponse: NextResponse): NextResponse {
  const response = NextResponse.redirect(url)
  sessionResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie))
  const cacheControl = sessionResponse.headers.get('cache-control')
  if (cacheControl) response.headers.set('Cache-Control', cacheControl)
  return response
}

/** Refresca la sesión de Supabase y protege las rutas privadas (patrón oficial de @supabase/ssr). */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet, headers) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        Object.entries(headers).forEach(([key, value]) => supabaseResponse.headers.set(key, value))
      },
    },
  })

  // No ejecutar nada entre createServerClient y getClaims: getClaims refresca y valida el token.
  const { data } = await supabase.auth.getClaims()
  const hasUser = Boolean(data?.claims)
  const { pathname } = request.nextUrl

  if (!hasUser && !isPublicPath(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.search = `?next=${encodeURIComponent(pathname + request.nextUrl.search)}`
    return redirectWithSession(url, supabaseResponse)
  }

  if (hasUser && pathname === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    url.search = ''
    return redirectWithSession(url, supabaseResponse)
  }

  return supabaseResponse
}
