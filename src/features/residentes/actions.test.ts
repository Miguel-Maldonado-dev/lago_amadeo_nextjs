import { beforeEach, describe, expect, test, vi } from 'vitest'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth/current-user'
import { createClient } from '@/lib/supabase/server'
import { callsOf, fakeQuery, fakeSupabase } from '@/test/fake-query'
import { actualizarResidente, crearResidente, eliminarResidente } from './actions'

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/auth/current-user', () => ({ getCurrentUser: vi.fn() }))

const user = { id: 'u1', email: 'a@b.c', userName: 'Ana', roleName: 'Comite', roleId: 3, isActive: true }

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getCurrentUser).mockResolvedValue(user as never)
})

describe('crearResidente', () => {
  test('inserta sin es_principal y con nombre en title case', async () => {
    const q = fakeQuery({})
    vi.mocked(createClient).mockResolvedValue(fakeSupabase({ residentes: q }) as never)
    const r = await crearResidente(9, { nombre: 'juan pérez', telefono: '' })
    expect(r).toEqual({ ok: true, data: undefined })
    const payload = callsOf(q, 'insert')[0].args[0] as Record<string, unknown>
    expect(payload).toEqual({ nombre: 'Juan Pérez', telefono: null, domicilio_id: 9 })
    expect(payload).not.toHaveProperty('es_principal')
    expect(revalidatePath).toHaveBeenCalledWith('/domicilios/9')
    expect(revalidatePath).toHaveBeenCalledWith('/residentes')
  })

  test('rechaza datos inválidos sin insertar', async () => {
    const q = fakeQuery({})
    vi.mocked(createClient).mockResolvedValue(fakeSupabase({ residentes: q }) as never)
    const r = await crearResidente(9, { nombre: '', telefono: '12' })
    expect(r).toEqual({ ok: false, error: 'El nombre es obligatorio' })
    expect(callsOf(q, 'insert')).toHaveLength(0)
  })
})

describe('actualizarResidente', () => {
  test('envía es_principal true', async () => {
    const q = fakeQuery({})
    vi.mocked(createClient).mockResolvedValue(fakeSupabase({ residentes: q }) as never)
    const r = await actualizarResidente(3, 9, { nombre: 'ana', telefono: '5512345678', esPrincipal: true })
    expect(r).toEqual({ ok: true, data: undefined })
    expect(callsOf(q, 'update')[0].args).toEqual([
      { nombre: 'Ana', telefono: '5512345678', es_principal: true },
    ])
    expect(callsOf(q, 'eq')[0].args).toEqual(['id', 3])
  })

  test('es_principal false por defecto', async () => {
    const q = fakeQuery({})
    vi.mocked(createClient).mockResolvedValue(fakeSupabase({ residentes: q }) as never)
    await actualizarResidente(3, 9, { nombre: 'ana' })
    expect(callsOf(q, 'update')[0].args).toEqual([{ nombre: 'Ana', telefono: null, es_principal: false }])
  })
})

describe('eliminarResidente', () => {
  test('elimina y revalida ambas rutas', async () => {
    const q = fakeQuery({})
    vi.mocked(createClient).mockResolvedValue(fakeSupabase({ residentes: q }) as never)
    const r = await eliminarResidente(3, 9)
    expect(r).toEqual({ ok: true, data: undefined })
    expect(callsOf(q, 'eq')[0].args).toEqual(['id', 3])
    expect(revalidatePath).toHaveBeenCalledWith('/domicilios/9')
    expect(revalidatePath).toHaveBeenCalledWith('/residentes')
  })
})
