import { NextRequest } from 'next/server'

import type { CookieMethodsServer } from '@supabase/ssr'

const { getClaims, ssr } = vi.hoisted(() => ({
  getClaims: vi.fn(),
  ssr: { cookies: null as CookieMethodsServer | null },
}))

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn((_url: string, _key: string, options: { cookies: CookieMethodsServer }) => {
    ssr.cookies = options.cookies
    return { auth: { getClaims } }
  }),
}))

vi.mock('@/lib/supabase/env', () => ({
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_KEY: 'publishable-key',
}))

import { updateSession } from '@/lib/supabase/proxy'

const SESSION = { data: { claims: { sub: 'u1' } }, error: null }

/** Simula que getClaims renovó el token y Supabase escribió cookies nuevas. */
function refreshTokenDuringGetClaims() {
  getClaims.mockImplementation(async () => {
    await ssr.cookies?.setAll?.(
      [{ name: 'sb-auth-token', value: 'nuevo', options: { path: '/', httpOnly: true } }],
      { 'Cache-Control': 'private, no-cache, no-store, must-revalidate, max-age=0' },
    )
    return SESSION
  })
}

beforeEach(() => {
  getClaims.mockReset()
})

test('sin sesión redirige a /login con next', async () => {
  getClaims.mockResolvedValue({ data: null })

  const res = await updateSession(new NextRequest('http://localhost/domicilios/5'))

  expect(res.status).toBe(307)
  expect(res.headers.get('location')).toBe('http://localhost/login?next=%2Fdomicilios%2F5')
})

test('sin sesión conserva el query string en next', async () => {
  getClaims.mockResolvedValue({ data: null })

  const res = await updateSession(new NextRequest('http://localhost/cuotas?anio=2025'))

  expect(res.status).toBe(307)
  expect(res.headers.get('location')).toBe('http://localhost/login?next=%2Fcuotas%3Fanio%3D2025')
})

test('con sesión en /login redirige a /', async () => {
  getClaims.mockResolvedValue(SESSION)

  const res = await updateSession(new NextRequest('http://localhost/login?next=%2Fpagos'))

  expect(res.status).toBe(307)
  expect(res.headers.get('location')).toBe('http://localhost/')
})

test('sin sesión deja pasar /api/auth/signout', async () => {
  getClaims.mockResolvedValue({ data: null })

  const res = await updateSession(new NextRequest('http://localhost/api/auth/signout'))

  expect(res.status).toBe(200)
  expect(res.headers.get('location')).toBeNull()
})

test('sin sesión deja pasar /login', async () => {
  getClaims.mockResolvedValue({ data: null })

  const res = await updateSession(new NextRequest('http://localhost/login'))

  expect(res.status).toBe(200)
})

test('con sesión deja pasar la ruta', async () => {
  getClaims.mockResolvedValue(SESSION)

  const res = await updateSession(new NextRequest('http://localhost/domicilios/5'))

  expect(res.status).toBe(200)
  expect(res.headers.get('location')).toBeNull()
})

test('las cookies renovadas viajan en la respuesta junto con los headers de no-cache', async () => {
  refreshTokenDuringGetClaims()

  const res = await updateSession(new NextRequest('http://localhost/pagos'))

  expect(res.status).toBe(200)
  expect(res.cookies.get('sb-auth-token')?.value).toBe('nuevo')
  expect(res.headers.get('cache-control')).toBe('private, no-cache, no-store, must-revalidate, max-age=0')
})

test('la redirección desde /login conserva las cookies renovadas', async () => {
  refreshTokenDuringGetClaims()

  const res = await updateSession(new NextRequest('http://localhost/login'))

  expect(res.headers.get('location')).toBe('http://localhost/')
  expect(res.cookies.get('sb-auth-token')).toMatchObject({ value: 'nuevo', path: '/', httpOnly: true })
  expect(res.headers.get('cache-control')).toBe('private, no-cache, no-store, must-revalidate, max-age=0')
})
