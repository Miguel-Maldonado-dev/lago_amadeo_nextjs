import { createClient } from '@/lib/supabase/server'
import { callsOf, fakeQuery, fakeSupabase } from '@/test/fake-query'

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }))

import { getCurrentUser } from '@/lib/auth/current-user'

function mockSupabase(claims: Record<string, unknown> | null, usersInfo: ReturnType<typeof fakeQuery>) {
  const getClaims = vi.fn().mockResolvedValue({ data: claims ? { claims } : null, error: null })
  const supabase = fakeSupabase({ users_info: usersInfo }, { auth: { getClaims } })
  vi.mocked(createClient).mockResolvedValue(supabase as never)
  return supabase
}

test('mapea users_info', async () => {
  const usersInfo = fakeQuery({
    data: { id: 'u1', email: 'ana@lago.mx', user_name: 'Ana', role_id: 2, role_name: 'Tesorero', is_active: true },
  })
  mockSupabase({ sub: 'u1', email: 'ana@lago.mx' }, usersInfo)

  const user = await getCurrentUser()

  expect(user).toEqual({
    id: 'u1',
    email: 'ana@lago.mx',
    userName: 'Ana',
    roleName: 'Tesorero',
    roleId: 2,
    isActive: true,
  })
  expect(callsOf(usersInfo, 'eq')).toEqual([{ method: 'eq', args: ['id', 'u1'] }])
})

test('sin fila en users_info devuelve inactivo', async () => {
  mockSupabase({ sub: 'u2', email: 'beto@lago.mx' }, fakeQuery({ data: null }))

  const user = await getCurrentUser()

  expect(user).toEqual({
    id: 'u2',
    email: 'beto@lago.mx',
    userName: '',
    roleName: null,
    roleId: null,
    isActive: false,
  })
})

test('un rol desconocido se mapea a null', async () => {
  mockSupabase(
    { sub: 'u3', email: 'c@lago.mx' },
    fakeQuery({ data: { id: 'u3', user_name: 'Caro', role_id: 9, role_name: 'Invitado', is_active: true } }),
  )

  const user = await getCurrentUser()

  expect(user?.roleName).toBeNull()
})

test('sin claims devuelve null', async () => {
  const usersInfo = fakeQuery({ data: null })
  const supabase = mockSupabase(null, usersInfo)

  const user = await getCurrentUser()

  expect(user).toBeNull()
  expect(supabase.from).not.toHaveBeenCalled()
})

test('un error al consultar users_info se propaga', async () => {
  mockSupabase({ sub: 'u1', email: 'ana@lago.mx' }, fakeQuery({ error: { message: 'timeout' } }))

  await expect(getCurrentUser()).rejects.toThrow('timeout')
})
