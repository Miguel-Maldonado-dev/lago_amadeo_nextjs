import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth/current-user'
import { MSG_NO_PERMISO } from '@/lib/auth/run-action'
import { createClient } from '@/lib/supabase/server'
import { callsOf, fakeQuery, fakeSupabase } from '@/test/fake-query'
import { registrarMovimiento } from './actions'

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/auth/current-user', () => ({ getCurrentUser: vi.fn() }))

const userWith = (roleName: string) =>
  ({ id: 'u1', email: 'a@b.c', userName: 'Ana', roleName, roleId: 3, isActive: true }) as never

const input = { tipoId: 2, descripcion: 'Pago de luz', importe: '150.50', metodoPagoId: 1, fechaMovimiento: '2026-10-05' }

function setup(role = 'Tesorero', error?: { message: string }) {
  vi.mocked(getCurrentUser).mockResolvedValue(userWith(role))
  const movimientos = fakeQuery(error ? { error } : {})
  vi.mocked(createClient).mockResolvedValue(fakeSupabase({ movimientos_financieros: movimientos }) as never)
  return { movimientos }
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-10-05T18:00:00Z'))
})

afterEach(() => {
  vi.useRealTimers()
})

test('inserta el movimiento con el user_id del usuario y revalida', async () => {
  const { movimientos } = setup()

  const r = await registrarMovimiento(input)

  expect(r).toEqual({ ok: true, data: undefined })
  expect(callsOf(movimientos, 'insert')[0].args[0]).toEqual({
    tipo_id: 2,
    descripcion: 'Pago de luz',
    importe: 150.5,
    metodo_pago_id: 1,
    user_id: 'u1',
    fecha_movimiento: '2026-10-05',
  })
  expect(vi.mocked(revalidatePath).mock.calls.map(([p]) => p)).toEqual(['/movimientos', '/'])
})

test('rol Comite no puede registrar', async () => {
  const { movimientos } = setup('Comite')

  expect(await registrarMovimiento(input)).toEqual({ ok: false, error: MSG_NO_PERMISO })
  expect(callsOf(movimientos, 'insert')).toHaveLength(0)
})

test('entrada inválida no inserta', async () => {
  const { movimientos } = setup()

  const r = await registrarMovimiento({ ...input, importe: '0' })

  expect(r).toEqual({ ok: false, error: 'El importe debe ser mayor a 0' })
  expect(callsOf(movimientos, 'insert')).toHaveLength(0)
})
