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

const call = (qs: string) => GET(new NextRequest(`http://localhost/api/exports/eldesgate?${qs}`))

describe('GET /api/exports/eldesgate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getCurrentUser.mockResolvedValue({ id: 'u', isActive: true })
  })

  it('401 sin usuario', async () => {
    getCurrentUser.mockResolvedValue(null)
    expect((await call('mes=3&anio=2026&salida=1')).status).toBe(401)
    expect(invokeEdgeFunction).not.toHaveBeenCalled()
  })

  it('400 con mes inválido y no llama a la función', async () => {
    const res = await call('mes=13&anio=2026&salida=1')
    expect(res.status).toBe(400)
    expect(await res.json()).toHaveProperty('error')
    expect(invokeEdgeFunction).not.toHaveBeenCalled()
  })

  it('200 conserva body y Content-Disposition', async () => {
    const disposition = 'attachment; filename="accesos_telefonicos_2026_03.csv"'
    invokeEdgeFunction.mockResolvedValue(
      new Response('a;b', { status: 200, headers: { 'Content-Type': 'text/csv', 'Content-Disposition': disposition } }),
    )
    const res = await call('mes=3&anio=2026&salida=BOTH')
    expect(invokeEdgeFunction).toHaveBeenCalledWith(expect.anything(), 'create-eldesgate-csv', {
      query: { mes: '3', anio: '2026', salida: 'BOTH' },
    })
    expect(res.status).toBe(200)
    expect(res.headers.get('content-disposition')).toBe(disposition)
    expect(res.headers.get('content-type')).toBe('text/csv')
    expect(await res.text()).toBe('a;b')
  })

  it('502 cuando la función responde con error', async () => {
    invokeEdgeFunction.mockResolvedValue(new Response('No existen accesos', { status: 404 }))
    const res = await call('mes=3&anio=2026&salida=1')
    expect(res.status).toBe(502)
    expect(await res.text()).toBe('No existen accesos')
  })

  it('502 cuando la llamada a la función lanza (red caída)', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const failure = new TypeError('fetch failed')
    invokeEdgeFunction.mockRejectedValue(failure)
    const res = await call('mes=3&anio=2026&salida=1')
    expect(res.status).toBe(502)
    expect(await res.text()).toBe('No fue posible generar el archivo.')
    expect(consoleError).toHaveBeenCalledWith(failure)
    consoleError.mockRestore()
  })
})
