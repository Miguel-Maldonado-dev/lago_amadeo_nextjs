import { beforeEach, describe, expect, test, vi } from 'vitest'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth/current-user'
import { createClient } from '@/lib/supabase/server'
import { callsOf, fakeQuery, fakeSupabase } from '@/test/fake-query'
import { guardarCatalogo, guardarTipoCuota } from './actions'
import { MSG_NO_ENCONTRADO, MSG_NOMBRE_DUPLICADO } from './messages'

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/auth/current-user', () => ({ getCurrentUser: vi.fn() }))

const admin = { id: 'u1', email: 'a@b.c', userName: 'Ana', roleName: 'Administrador', roleId: 1, isActive: true }
const usar = (tables: Parameters<typeof fakeSupabase>[0]) => {
  const sb = fakeSupabase(tables)
  vi.mocked(createClient).mockResolvedValue(sb as never)
  return sb
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getCurrentUser).mockResolvedValue(admin as never)
})

describe('guardarCatalogo', () => {
  test('rechaza a quien no es administrador', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ ...admin, roleName: 'Tesorero' } as never)
    const sb = usar({})
    const r = await guardarCatalogo('descuentos', null, { nombre: 'X', importe: '1' })
    expect(r).toEqual({ ok: false, error: 'No tienes permiso para realizar esta acción.' })
    expect(sb.from).not.toHaveBeenCalled()
  })

  test('datos inválidos no escriben', async () => {
    const sb = usar({})
    const r = await guardarCatalogo('descuentos', null, { nombre: 'X', importe: '0' })
    expect(r).toEqual({ ok: false, error: 'El importe debe ser mayor a 0' })
    expect(sb.from).not.toHaveBeenCalled()
  })

  test('crea un descuento y revalida las pantallas que lo usan', async () => {
    const dup = fakeQuery({ data: [{ id: 1, nombre: 'Pago Anticipado' }] })
    const insert = fakeQuery()
    usar({ conceptos_descuento: [dup, insert] })
    const r = await guardarCatalogo('descuentos', null, { nombre: ' Comité ', importe: '250' })
    expect(r).toEqual({ ok: true, data: undefined })
    expect(callsOf(dup, 'select')[0].args).toEqual(['id, nombre'])
    expect(callsOf(insert, 'insert')[0].args).toEqual([{ nombre: 'Comité', monto_descuento: 250 }])
    expect(revalidatePath).toHaveBeenCalledWith('/configuracion')
    expect(revalidatePath).toHaveBeenCalledWith('/domicilios', 'layout')
    expect(revalidatePath).toHaveBeenCalledWith('/cuotas')
    expect(revalidatePath).toHaveBeenCalledWith('/pagos')
  })

  test('rechaza un nombre repetido sin distinguir mayúsculas ni espacios guardados', async () => {
    const insert = fakeQuery()
    usar({ conceptos_descuento: [fakeQuery({ data: [{ id: 9, nombre: 'Comité ' }] }), insert] })
    const r = await guardarCatalogo('descuentos', null, { nombre: 'comité', importe: '250' })
    expect(r).toEqual({ ok: false, error: MSG_NOMBRE_DUPLICADO })
    expect(insert.calls).toHaveLength(0)
  })

  test('los comodines no provocan falsos duplicados', async () => {
    const insert = fakeQuery()
    usar({ conceptos_recargo: [fakeQuery({ data: [{ id: 1, nombre: 'Cuota Especial' }, { id: 2, nombre: '50 pesos' }] }), insert] })
    expect((await guardarCatalogo('recargos', null, { nombre: 'Cuota*', importe: '1' })).ok).toBe(true)
    usar({ conceptos_recargo: [fakeQuery({ data: [{ id: 2, nombre: '50 pesos' }] }), fakeQuery()] })
    expect((await guardarCatalogo('recargos', null, { nombre: '50%_', importe: '1' })).ok).toBe(true)
  })

  test('al editar no se cuenta a sí mismo como duplicado y actualiza por id', async () => {
    const dup = fakeQuery({ data: [{ id: 4, nombre: 'pago tardío' }] })
    const update = fakeQuery({ data: [{ id: 4 }] })
    usar({ conceptos_recargo: [dup, update] })
    const r = await guardarCatalogo('recargos', 4, { nombre: 'Pago tardío', importe: '60' })
    expect(r.ok).toBe(true)
    expect(callsOf(update, 'update')[0].args).toEqual([{ nombre: 'Pago tardío', monto_recargo: 60 }])
    expect(callsOf(update, 'eq')[0].args).toEqual(['id', 4])
    expect(callsOf(update, 'select')[0].args).toEqual(['id'])
  })

  test('conceptos extra fijan y filtran tipo_pago_id 2', async () => {
    const dup = fakeQuery({ data: [] })
    const insert = fakeQuery()
    usar({ conceptos_pago: [dup, insert] })
    await guardarCatalogo('extras', null, { nombre: 'Tarjeta', importe: '100' })
    expect(callsOf(dup, 'eq')).toContainEqual({ method: 'eq', args: ['tipo_pago_id', 2] })
    expect(callsOf(insert, 'insert')[0].args).toEqual([{ nombre: 'Tarjeta', importe: 100, tipo_pago_id: 2 }])

    const update = fakeQuery({ data: [{ id: 3 }] })
    usar({ conceptos_pago: [fakeQuery({ data: [] }), update] })
    await guardarCatalogo('extras', 3, { nombre: 'Tarjeta', importe: '120' })
    expect(callsOf(update, 'eq')).toEqual([
      { method: 'eq', args: ['id', 3] },
      { method: 'eq', args: ['tipo_pago_id', 2] },
    ])
  })

  test('si el elemento ya no existe no reporta éxito', async () => {
    usar({ conceptos_descuento: [fakeQuery({ data: [] }), fakeQuery({ data: [] })] })
    const r = await guardarCatalogo('descuentos', 99, { nombre: 'X', importe: '1' })
    expect(r).toEqual({ ok: false, error: MSG_NO_ENCONTRADO })
    expect(revalidatePath).not.toHaveBeenCalled()
  })
})

describe('guardarTipoCuota', () => {
  const input = { nombre: 'Acceso Vehicular', importe: '180', accesoTelefono: true, accesoTarjeta: false }

  test('crea el concepto recurrente y su fila de accesos', async () => {
    const dup = fakeQuery({ data: [] })
    const insert = fakeQuery({ data: { id: 5 } })
    const acceso = fakeQuery()
    usar({ conceptos_pago: [dup, insert], concepto_pago_acceso: acceso })
    const r = await guardarTipoCuota(null, input)
    expect(r).toEqual({ ok: true, data: undefined })
    expect(callsOf(dup, 'eq')).toContainEqual({ method: 'eq', args: ['tipo_pago_id', 1] })
    expect(callsOf(insert, 'insert')[0].args).toEqual([{ nombre: 'Acceso Vehicular', importe: 180, tipo_pago_id: 1 }])
    expect(callsOf(acceso, 'insert')[0].args).toEqual([
      { concepto_pago_id: 5, acceso_telefono: true, acceso_tarjeta: false },
    ])
  })

  test('si falla la fila de accesos borra el concepto creado', async () => {
    const borrar = fakeQuery()
    usar({
      conceptos_pago: [fakeQuery({ data: [] }), fakeQuery({ data: { id: 5 } }), borrar],
      concepto_pago_acceso: fakeQuery({ error: { message: 'boom' } }),
    })
    const r = await guardarTipoCuota(null, input)
    expect(r).toEqual({ ok: false, error: 'Ocurrió un error inesperado. Intenta de nuevo.' })
    expect(callsOf(borrar, 'delete')).toHaveLength(1)
    expect(callsOf(borrar, 'eq')[0].args).toEqual(['id', 5])
  })

  test('al editar actualiza la fila de accesos por concepto, sin buscarla antes', async () => {
    const update = fakeQuery({ data: [{ id: 1 }] })
    const actualizar = fakeQuery({ data: [{ id: 7 }] })
    usar({ conceptos_pago: [fakeQuery({ data: [] }), update], concepto_pago_acceso: actualizar })
    const r = await guardarTipoCuota(1, input)
    expect(r.ok).toBe(true)
    expect(callsOf(update, 'eq')).toEqual([
      { method: 'eq', args: ['id', 1] },
      { method: 'eq', args: ['tipo_pago_id', 1] },
    ])
    expect(callsOf(actualizar, 'update')[0].args).toEqual([{ acceso_telefono: true, acceso_tarjeta: false }])
    expect(callsOf(actualizar, 'eq')[0].args).toEqual(['concepto_pago_id', 1])
    expect(callsOf(actualizar, 'maybeSingle')).toHaveLength(0)
    expect(callsOf(actualizar, 'insert')).toHaveLength(0)
  })

  test('al editar sin fila de accesos la crea', async () => {
    const crear = fakeQuery()
    usar({
      conceptos_pago: [fakeQuery({ data: [] }), fakeQuery({ data: [{ id: 2 }] })],
      concepto_pago_acceso: [fakeQuery({ data: [] }), crear],
    })
    await guardarTipoCuota(2, input)
    expect(callsOf(crear, 'insert')[0].args).toEqual([
      { concepto_pago_id: 2, acceso_telefono: true, acceso_tarjeta: false },
    ])
  })

  test('si fallan los accesos al editar, refresca las pantallas porque nombre e importe ya se guardaron', async () => {
    usar({
      conceptos_pago: [fakeQuery({ data: [] }), fakeQuery({ data: [{ id: 2 }] })],
      concepto_pago_acceso: fakeQuery({ error: { message: 'boom' } }),
    })
    const r = await guardarTipoCuota(2, input)
    expect(r.ok).toBe(false)
    expect(revalidatePath).toHaveBeenCalledWith('/configuracion')
  })
})
