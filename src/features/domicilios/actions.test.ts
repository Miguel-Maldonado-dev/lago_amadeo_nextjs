import { beforeEach, describe, expect, test, vi } from 'vitest'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth/current-user'
import { createClient } from '@/lib/supabase/server'
import { callsOf, fakeQuery, fakeSupabase } from '@/test/fake-query'
import { actualizarDomicilio, crearDomicilio } from './actions'

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/auth/current-user', () => ({ getCurrentUser: vi.fn() }))

const user = { id: 'u1', email: 'a@b.c', userName: 'Ana', roleName: 'Vigilancia', roleId: 4, isActive: true }
const input = { direccion: 'lago 1', fechaAlta: '2026-01-01', observaciones: '' }

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getCurrentUser).mockResolvedValue(user as never)
})

describe('crearDomicilio', () => {
  test('rechaza duplicado', async () => {
    const info = fakeQuery({ data: [{ id: 1 }] })
    const domicilios = fakeQuery()
    vi.mocked(createClient).mockResolvedValue(
      fakeSupabase({ domicilios_info: info, domicilios }) as never,
    )
    const r = await crearDomicilio(input)
    expect(r).toEqual({ ok: false, error: 'Este domicilio ya se encuentra registrado.' })
    expect(callsOf(domicilios, 'insert')).toHaveLength(0)
    expect(callsOf(info, 'eq')[0].args).toEqual(['direccion', 'LAGO 1'])
  })

  test('inserta con created_by y concepto', async () => {
    const domicilios = fakeQuery({ data: { id: 7 } })
    const concepto = fakeQuery()
    vi.mocked(createClient).mockResolvedValue(
      fakeSupabase({ domicilios_info: fakeQuery({ data: [] }), domicilios, domicilio_concepto: concepto }) as never,
    )
    const r = await crearDomicilio({ ...input, conceptoId: '2' })
    expect(r).toEqual({ ok: true, data: { id: 7 } })
    expect(callsOf(domicilios, 'insert')[0].args).toEqual([
      { direccion: 'LAGO 1', fecha_alta: '2026-01-01', observaciones: null, created_by: 'u1' },
    ])
    expect(callsOf(concepto, 'insert')[0].args).toEqual([{ domicilio_id: 7, concepto_id: 2 }])
    expect(revalidatePath).toHaveBeenCalledWith('/domicilios')
  })

  test('sin concepto no toca domicilio_concepto', async () => {
    const concepto = fakeQuery()
    vi.mocked(createClient).mockResolvedValue(
      fakeSupabase({
        domicilios_info: fakeQuery({ data: [] }),
        domicilios: fakeQuery({ data: { id: 7 } }),
        domicilio_concepto: concepto,
      }) as never,
    )
    const r = await crearDomicilio(input)
    expect(r.ok).toBe(true)
    expect(concepto.calls).toHaveLength(0)
  })

  test('cualquier rol autenticado puede crear', async () => {
    vi.mocked(createClient).mockResolvedValue(
      fakeSupabase({ domicilios_info: fakeQuery({ data: [] }), domicilios: fakeQuery({ data: { id: 1 } }) }) as never,
    )
    expect((await crearDomicilio(input)).ok).toBe(true)
  })

  test('devuelve el primer error de validación', async () => {
    const r = await crearDomicilio({ ...input, direccion: ' ' })
    expect(r).toEqual({ ok: false, error: 'La dirección es obligatoria' })
  })
})

describe('actualizarDomicilio', () => {
  test('hace update y crea domicilio_concepto si no existe', async () => {
    const domicilios = fakeQuery()
    const concepto = fakeQuery({ data: null })
    vi.mocked(createClient).mockResolvedValue(
      fakeSupabase({ domicilios, domicilio_concepto: concepto }) as never,
    )
    const r = await actualizarDomicilio(5, { ...input, conceptoId: 3 })
    expect(r.ok).toBe(true)
    expect(callsOf(domicilios, 'update')[0].args).toEqual([
      { direccion: 'LAGO 1', fecha_alta: '2026-01-01', observaciones: null },
    ])
    expect(callsOf(domicilios, 'eq')[0].args).toEqual(['id', 5])
    expect(callsOf(concepto, 'insert')[0].args).toEqual([{ domicilio_id: 5, concepto_id: 3 }])
    expect(revalidatePath).toHaveBeenCalledWith('/domicilios')
    expect(revalidatePath).toHaveBeenCalledWith('/domicilios/5')
  })

  test('actualiza domicilio_concepto existente', async () => {
    const concepto = fakeQuery({ data: { id: 9, domicilio_id: 5, concepto_id: 1 } })
    vi.mocked(createClient).mockResolvedValue(
      fakeSupabase({ domicilios: fakeQuery(), domicilio_concepto: concepto }) as never,
    )
    const r = await actualizarDomicilio(5, { ...input, conceptoId: 3 })
    expect(r.ok).toBe(true)
    expect(callsOf(concepto, 'update')[0].args).toEqual([{ concepto_id: 3 }])
    expect(callsOf(concepto, 'eq').at(-1)!.args).toEqual(['id', 9])
    expect(callsOf(concepto, 'insert')).toHaveLength(0)
  })
})
