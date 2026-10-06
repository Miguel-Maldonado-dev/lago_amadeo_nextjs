import { redirect } from 'next/navigation'
import { ok } from '@/lib/action-result'
import { getCurrentUser, type CurrentUser } from '@/lib/auth/current-user'

vi.mock('@/lib/auth/current-user', () => ({ getCurrentUser: vi.fn() }))

import { MSG_ERROR, MSG_NO_PERMISO, MSG_SESION, runAction } from '@/lib/auth/run-action'

const COMITE: CurrentUser = {
  id: 'u1',
  email: 'comite@lago.mx',
  userName: 'Comité',
  roleName: 'Comite',
  roleId: 3,
  isActive: true,
}

test('sin sesión devuelve MSG_SESION sin lanzar', async () => {
  vi.mocked(getCurrentUser).mockResolvedValue(null)
  const fn = vi.fn()

  const result = await runAction(null, fn)

  expect(result).toEqual({ ok: false, error: MSG_SESION })
  expect(fn).not.toHaveBeenCalled()
})

test('usuario inactivo devuelve MSG_SESION', async () => {
  vi.mocked(getCurrentUser).mockResolvedValue({ ...COMITE, isActive: false })
  const fn = vi.fn()

  const result = await runAction(['Comite'], fn)

  expect(result).toEqual({ ok: false, error: MSG_SESION })
  expect(fn).not.toHaveBeenCalled()
})

test('rol no permitido devuelve MSG_NO_PERMISO', async () => {
  vi.mocked(getCurrentUser).mockResolvedValue(COMITE)
  const fn = vi.fn()

  const result = await runAction(['Administrador'], fn)

  expect(result).toEqual({ ok: false, error: MSG_NO_PERMISO })
  expect(fn).not.toHaveBeenCalled()
})

test('rol permitido ejecuta fn con el usuario', async () => {
  vi.mocked(getCurrentUser).mockResolvedValue(COMITE)

  const result = await runAction(['Administrador', 'Comite'], async (user) => ok(user.id))

  expect(result).toEqual({ ok: true, data: 'u1' })
})

test('roles null solo exige sesión', async () => {
  vi.mocked(getCurrentUser).mockResolvedValue({ ...COMITE, roleName: null, roleId: null })

  const result = await runAction(null, async (user) => ok(user.email))

  expect(result).toEqual({ ok: true, data: 'comite@lago.mx' })
})

test('excepción inesperada devuelve MSG_ERROR', async () => {
  vi.mocked(getCurrentUser).mockResolvedValue(COMITE)
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
  const boom = new Error('boom')

  const result = await runAction(null, async () => {
    throw boom
  })

  expect(result).toEqual({ ok: false, error: MSG_ERROR })
  expect(consoleError).toHaveBeenCalledWith(boom)
  consoleError.mockRestore()
})

test('deja propagar redirect() de Next.js', async () => {
  vi.mocked(getCurrentUser).mockResolvedValue(COMITE)

  await expect(runAction(null, async () => redirect('/login'))).rejects.toThrow('NEXT_REDIRECT')
})
