import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fakeQuery, fakeSupabase } from '@/test/fake-query'

const getCurrentUser = vi.fn()
const createClient = vi.fn()
vi.mock('@/lib/auth/current-user', () => ({ getCurrentUser: () => getCurrentUser() }))
vi.mock('@/lib/supabase/server', () => ({ createClient: () => createClient() }))

import { GET } from './route'

const call = (id: string) =>
  GET(new NextRequest(`http://localhost/api/recibos/${id}`), { params: Promise.resolve({ pagoId: id }) })

describe('GET /api/recibos/[pagoId]', () => {
  beforeEach(() => {
    getCurrentUser.mockResolvedValue({ id: 'u', isActive: true })
  })

  it('401 sin usuario', async () => {
    getCurrentUser.mockResolvedValue(null)
    expect((await call('1')).status).toBe(401)
  })

  it('404 con id inválido', async () => {
    expect((await call('x')).status).toBe(404)
  })

  it('404 con file_data nulo', async () => {
    createClient.mockResolvedValue(
      fakeSupabase({ pagos: fakeQuery({ data: { referencia: 'abc-123', file_data: null } }) }),
    )
    expect((await call('1')).status).toBe(404)
  })

  it('200 con el PDF decodificado', async () => {
    createClient.mockResolvedValue(
      fakeSupabase({ pagos: fakeQuery({ data: { referencia: 'abc-123', file_data: btoa('%PDF-1.4') } }) }),
    )
    const res = await call('1')
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe('application/pdf')
    expect(res.headers.get('content-disposition')).toContain('filename="abc-123.pdf"')
    expect((await res.text()).startsWith('%PDF')).toBe(true)
  })
})
