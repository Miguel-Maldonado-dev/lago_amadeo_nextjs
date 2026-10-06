import { NextRequest } from 'next/server'
import { describe, expect, it, vi } from 'vitest'

const signOut = vi.fn().mockResolvedValue({ error: null })
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({ auth: { signOut } }),
}))

import { GET } from './route'

describe('GET /api/auth/signout', () => {
  it('cierra sesión y redirige a /login?error=inactive', async () => {
    const res = await GET(new NextRequest('http://localhost/api/auth/signout?reason=inactive'))
    expect(signOut).toHaveBeenCalledTimes(1)
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toMatch(/\/login\?error=inactive$/)
  })
})
