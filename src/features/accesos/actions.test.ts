import { beforeEach, describe, expect, test, vi } from 'vitest'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth/current-user'
import { createClient } from '@/lib/supabase/server'
import { callsOf, fakeQuery, fakeSupabase } from '@/test/fake-query'
import {
  actualizarTarjeta,
  crearTarjeta,
  crearTelefono,
  eliminarTelefono,
} from './actions'
import { MSG_MAX_TARJETAS, MSG_MAX_TELEFONOS } from './messages'

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/auth/current-user', () => ({ getCurrentUser: vi.fn() }))

const user = { id: 'u1', email: 'a@b.c', userName: 'Ana', roleName: 'Comite', roleId: 3, isActive: true }

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getCurrentUser).mockResolvedValue(user as never)
})

describe('crearTelefono', () => {
  test('falla sin insertar si ya hay 2', async () => {
    const q = fakeQuery({ count: 2 })
    vi.mocked(createClient).mockResolvedValue(fakeSupabase({ telefonos_acceso: q }) as never)
    const r = await crearTelefono(9, '5512345678')
    expect(r).toEqual({ ok: false, error: MSG_MAX_TELEFONOS })
    expect(callsOf(q, 'insert')).toHaveLength(0)
  })

  test('inserta si hay menos del límite', async () => {
    const q = fakeQuery({ count: 1 })
    vi.mocked(createClient).mockResolvedValue(fakeSupabase({ telefonos_acceso: q }) as never)
    const r = await crearTelefono(9, '5512345678')
    expect(r).toEqual({ ok: true, data: undefined })
    expect(callsOf(q, 'insert')[0].args).toEqual([{ domicilio_id: 9, telefono: '5512345678' }])
    expect(revalidatePath).toHaveBeenCalledWith('/domicilios/9')
  })

  test('rechaza valor inválido', async () => {
    const q = fakeQuery({ count: 0 })
    vi.mocked(createClient).mockResolvedValue(fakeSupabase({ telefonos_acceso: q }) as never)
    const r = await crearTelefono(9, '55-12')
    expect(r).toEqual({ ok: false, error: 'Solo dígitos, máximo 10' })
    expect(callsOf(q, 'insert')).toHaveLength(0)
  })
})

describe('crearTarjeta', () => {
  test('falla sin insertar si ya hay 3', async () => {
    const q = fakeQuery({ count: 3 })
    vi.mocked(createClient).mockResolvedValue(fakeSupabase({ tarjetas_acceso: q }) as never)
    const r = await crearTarjeta(9, '123')
    expect(r).toEqual({ ok: false, error: MSG_MAX_TARJETAS })
    expect(callsOf(q, 'insert')).toHaveLength(0)
  })
})

describe('eliminarTelefono', () => {
  test('elimina por id y revalida', async () => {
    const q = fakeQuery()
    vi.mocked(createClient).mockResolvedValue(fakeSupabase({ telefonos_acceso: q }) as never)
    const r = await eliminarTelefono(4, 9)
    expect(r.ok).toBe(true)
    expect(callsOf(q, 'delete')).toHaveLength(1)
    expect(callsOf(q, 'eq')[0].args).toEqual(['id', 4])
    expect(revalidatePath).toHaveBeenCalledWith('/domicilios/9')
  })
})

describe('actualizarTarjeta', () => {
  test('actualiza numero', async () => {
    const q = fakeQuery()
    vi.mocked(createClient).mockResolvedValue(fakeSupabase({ tarjetas_acceso: q }) as never)
    const r = await actualizarTarjeta(5, 9, '777')
    expect(r.ok).toBe(true)
    expect(callsOf(q, 'update')[0].args).toEqual([{ numero: '777' }])
    expect(callsOf(q, 'eq')[0].args).toEqual(['id', 5])
    expect(revalidatePath).toHaveBeenCalledWith('/domicilios/9')
  })
})
