import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const getCurrentUser = vi.fn()
const invokeEdgeFunction = vi.fn()
vi.mock('@/lib/auth/current-user', () => ({ getCurrentUser: () => getCurrentUser() }))
vi.mock('@/lib/supabase/server', () => ({ createClient: async () => ({}) }))
vi.mock('@/lib/supabase/functions', () => ({
  invokeEdgeFunction: (...args: unknown[]) => invokeEdgeFunction(...args),
}))

import { GET } from './route'

const call = (qs: string) => GET(new NextRequest(`http://localhost/api/exports/zkteco?${qs}`))

describe('GET /api/exports/zkteco', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getCurrentUser.mockResolvedValue({ id: 'u', isActive: true })
  })

  it('400 con inicioID 0 y no llama a la función', async () => {
    expect((await call('mes=3&anio=2026&inicioID=0')).status).toBe(400)
    expect(invokeEdgeFunction).not.toHaveBeenCalled()
  })

  it('llama a create-zkteco-txt con el query esperado', async () => {
    invokeEdgeFunction.mockResolvedValue(new Response('x', { status: 200, headers: { 'Content-Type': 'text/plain' } }))
    const res = await call('mes=3&anio=2026&inicioID=100')
    expect(invokeEdgeFunction).toHaveBeenCalledWith(expect.anything(), 'create-zkteco-txt', {
      query: { mes: '3', anio: '2026', inicioID: '100' },
    })
    expect(res.status).toBe(200)
  })
})
