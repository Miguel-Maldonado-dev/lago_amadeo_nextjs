import { beforeEach, describe, expect, test, vi } from 'vitest'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth/current-user'
import { MSG_NO_PERMISO } from '@/lib/auth/run-action'
import { invokeEdgeFunction } from '@/lib/supabase/functions'
import { createClient } from '@/lib/supabase/server'
import { callsOf, fakeQuery, fakeSupabase } from '@/test/fake-query'
import { actualizarUsuario, cambiarEstadoUsuario, crearUsuario } from './actions'
import { MSG_NO_AUTO_CAMBIAR_ROL, MSG_NO_AUTO_DESACTIVAR } from './messages'

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }))
vi.mock('@/lib/supabase/functions', () => ({ invokeEdgeFunction: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/auth/current-user', () => ({ getCurrentUser: vi.fn() }))

const userWith = (roleName: string) =>
  ({ id: 'u1', email: 'a@b.c', userName: 'Ana', roleName, roleId: 1, isActive: true }) as never

const input = { userName: 'ana lopez', email: 'ana@lago.mx', password: '123456', roleId: 2 }
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status })

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getCurrentUser).mockResolvedValue(userWith('Administrador'))
  vi.mocked(createClient).mockResolvedValue(fakeSupabase({}) as never)
})

describe('crearUsuario', () => {
  test('rechaza a quien no es Administrador sin llamar a la función', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(userWith('Tesorero'))
    const r = await crearUsuario(input)
    expect(r).toEqual({ ok: false, error: MSG_NO_PERMISO })
    expect(invokeEdgeFunction).not.toHaveBeenCalled()
  })

  test('llama a create-user con el cuerpo esperado', async () => {
    vi.mocked(invokeEdgeFunction).mockResolvedValue(json({ success: true }))
    const r = await crearUsuario(input)
    expect(r).toEqual({ ok: true, data: undefined })
    expect(invokeEdgeFunction).toHaveBeenCalledWith(expect.anything(), 'create-user', {
      method: 'POST',
      body: { email: 'ana@lago.mx', password: '123456', user_name: 'Ana Lopez', role_id: 2 },
    })
    expect(revalidatePath).toHaveBeenCalledWith('/usuarios')
  })

  test('propaga el error de la función', async () => {
    vi.mocked(invokeEdgeFunction).mockResolvedValue(json({ error: 'dup' }, 400))
    const r = await crearUsuario(input)
    expect(r).toEqual({ ok: false, error: 'No fue posible crear el usuario: dup' })
  })

  test('respuesta no JSON → error desconocido', async () => {
    vi.mocked(invokeEdgeFunction).mockResolvedValue(new Response('boom', { status: 500 }))
    const r = await crearUsuario(input)
    expect(r).toEqual({ ok: false, error: 'No fue posible crear el usuario: error desconocido' })
  })

  test('datos inválidos no llaman a la función', async () => {
    const r = await crearUsuario({ ...input, password: '123' })
    expect(r).toEqual({ ok: false, error: 'Mínimo 6 caracteres' })
    expect(invokeEdgeFunction).not.toHaveBeenCalled()
  })
})

describe('actualizarUsuario', () => {
  test('actualiza users y user_roles', async () => {
    const users = fakeQuery({})
    const roles = fakeQuery({})
    vi.mocked(createClient).mockResolvedValue(fakeSupabase({ users, user_roles: roles }) as never)
    const r = await actualizarUsuario('u9', { userName: 'ana lopez', roleId: 3 })
    expect(r).toEqual({ ok: true, data: undefined })
    expect(callsOf(users, 'update')[0].args).toEqual([{ user_name: 'Ana Lopez' }])
    expect(callsOf(users, 'eq')[0].args).toEqual(['id', 'u9'])
    expect(callsOf(roles, 'update')[0].args).toEqual([{ role_id: 3 }])
    expect(callsOf(roles, 'eq')[0].args).toEqual(['user_id', 'u9'])
    expect(revalidatePath).toHaveBeenCalledWith('/usuarios')
  })

  test('no administrador no escribe', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(userWith('Comite'))
    const users = fakeQuery({})
    vi.mocked(createClient).mockResolvedValue(fakeSupabase({ users }) as never)
    const r = await actualizarUsuario('u9', { userName: 'x', roleId: 3 })
    expect(r).toEqual({ ok: false, error: MSG_NO_PERMISO })
    expect(callsOf(users, 'update')).toHaveLength(0)
  })

  test('no permite cambiar su propio rol', async () => {
    const users = fakeQuery({})
    const roles = fakeQuery({})
    vi.mocked(createClient).mockResolvedValue(fakeSupabase({ users, user_roles: roles }) as never)
    const r = await actualizarUsuario('u1', { userName: 'x', roleId: 2 })
    expect(r).toEqual({ ok: false, error: MSG_NO_AUTO_CAMBIAR_ROL })
    expect(callsOf(users, 'update')).toHaveLength(0)
    expect(callsOf(roles, 'update')).toHaveLength(0)
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  test('permite editar su propio nombre conservando el rol', async () => {
    const users = fakeQuery({})
    const roles = fakeQuery({})
    vi.mocked(createClient).mockResolvedValue(fakeSupabase({ users, user_roles: roles }) as never)
    const r = await actualizarUsuario('u1', { userName: 'x', roleId: 1 })
    expect(r).toEqual({ ok: true, data: undefined })
    expect(callsOf(users, 'update')[0].args).toEqual([{ user_name: 'X' }])
    expect(callsOf(users, 'eq')[0].args).toEqual(['id', 'u1'])
  })
})

describe('cambiarEstadoUsuario', () => {
  test('no permite desactivarse a sí mismo', async () => {
    const users = fakeQuery({})
    vi.mocked(createClient).mockResolvedValue(fakeSupabase({ users }) as never)
    const r = await cambiarEstadoUsuario('u1', false)
    expect(r).toEqual({ ok: false, error: MSG_NO_AUTO_DESACTIVAR })
    expect(callsOf(users, 'update')).toHaveLength(0)
  })

  test('desactiva a otro usuario', async () => {
    const users = fakeQuery({})
    vi.mocked(createClient).mockResolvedValue(fakeSupabase({ users }) as never)
    const r = await cambiarEstadoUsuario('u2', false)
    expect(r).toEqual({ ok: true, data: undefined })
    expect(callsOf(users, 'update')[0].args).toEqual([{ is_active: false }])
    expect(callsOf(users, 'eq')[0].args).toEqual(['id', 'u2'])
    expect(revalidatePath).toHaveBeenCalledWith('/usuarios')
  })

  test('activa un usuario', async () => {
    const users = fakeQuery({})
    vi.mocked(createClient).mockResolvedValue(fakeSupabase({ users }) as never)
    await cambiarEstadoUsuario('u2', true)
    expect(callsOf(users, 'update')[0].args).toEqual([{ is_active: true }])
  })
})
