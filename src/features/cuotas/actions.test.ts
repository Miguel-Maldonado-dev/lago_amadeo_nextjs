import { beforeEach, describe, expect, test, vi } from 'vitest'
import { revalidatePath } from 'next/cache'
import { MSG_NO_PERMISO } from '@/lib/auth/run-action'
import { getCurrentUser } from '@/lib/auth/current-user'
import { createClient } from '@/lib/supabase/server'
import { callsOf, fakeQuery, fakeSupabase } from '@/test/fake-query'
import { editarCuota, eliminarDescuento, eliminarRecargo, generarCuotaDomicilio, generarCuotas } from './actions'
import {
  MSG_CUOTA_DUPLICADA,
  MSG_CUOTA_EDITADA,
  MSG_CUOTA_GENERADA,
  MSG_SIN_CONCEPTO,
  MSG_SOLO_PENDIENTES,
} from './messages'

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/auth/current-user', () => ({ getCurrentUser: vi.fn() }))

const userWith = (roleName: string) =>
  ({ id: 'u1', email: 'a@b.c', userName: 'Ana', roleName, roleId: 3, isActive: true }) as never

beforeEach(() => {
  vi.clearAllMocks()
})

describe('generarCuotas', () => {
  test('rol Comite: sin permiso y no llama al rpc', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(userWith('Comite'))
    const rpc = vi.fn().mockResolvedValue({ data: null, error: null })
    vi.mocked(createClient).mockResolvedValue(fakeSupabase({}, { rpc }) as never)
    const r = await generarCuotas({ anio: 2026, mes: 3 })
    expect(r).toEqual({ ok: false, error: MSG_NO_PERMISO })
    expect(rpc).not.toHaveBeenCalled()
  })

  test('Tesorero: llama al rpc y revalida', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(userWith('Tesorero'))
    const rpc = vi.fn().mockResolvedValue({ data: null, error: null })
    vi.mocked(createClient).mockResolvedValue(fakeSupabase({}, { rpc }) as never)
    const r = await generarCuotas({ anio: 2026, mes: 3 })
    expect(r).toEqual({ ok: true, data: undefined })
    expect(rpc).toHaveBeenCalledWith('generar_cuotas', { p_anio: 2026, p_mes: 3 })
    expect(revalidatePath).toHaveBeenCalledWith('/cuotas')
  })

  test('error del rpc se devuelve como fail', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(userWith('Tesorero'))
    const rpc = vi.fn().mockResolvedValue({ data: null, error: { message: 'x' } })
    vi.mocked(createClient).mockResolvedValue(fakeSupabase({}, { rpc }) as never)
    const r = await generarCuotas({ anio: 2026, mes: 3 })
    expect(r).toEqual({ ok: false, error: 'No fue posible generar las cuotas: x' })
    expect(revalidatePath).not.toHaveBeenCalled()
  })
})

describe('generarCuotaDomicilio', () => {
  const concepto = { id: 1, domicilio_id: 5, concepto_id: 2, importe: 900 }

  function setup(opts: { count: number; concepto: unknown; role?: string }) {
    vi.mocked(getCurrentUser).mockResolvedValue(userWith(opts.role ?? 'Tesorero'))
    const cuotas = fakeQuery({ count: opts.count })
    const info = fakeQuery({ data: opts.concepto })
    vi.mocked(createClient).mockResolvedValue(
      fakeSupabase({ cuotas, domicilio_concepto_info: info }) as never,
    )
    return cuotas
  }

  test('rol Comite: sin permiso', async () => {
    const cuotas = setup({ count: 0, concepto, role: 'Comite' })
    const r = await generarCuotaDomicilio(5, { anio: 2026, mes: 2 })
    expect(r).toEqual({ ok: false, error: MSG_NO_PERMISO })
    expect(callsOf(cuotas, 'insert')).toHaveLength(0)
  })

  test('cuota duplicada: mensaje y sin insert', async () => {
    const cuotas = setup({ count: 1, concepto })
    const r = await generarCuotaDomicilio(5, { anio: 2026, mes: 2 })
    expect(r).toEqual({ ok: false, error: MSG_CUOTA_DUPLICADA })
    expect(callsOf(cuotas, 'insert')).toHaveLength(0)
  })

  test('sin concepto: mensaje y sin insert', async () => {
    const cuotas = setup({ count: 0, concepto: null })
    const r = await generarCuotaDomicilio(5, { anio: 2026, mes: 2 })
    expect(r).toEqual({ ok: false, error: MSG_SIN_CONCEPTO })
    expect(callsOf(cuotas, 'insert')).toHaveLength(0)
  })

  test('concepto con importe nulo: mensaje y sin insert', async () => {
    const cuotas = setup({ count: 0, concepto: { ...concepto, importe: null } })
    const r = await generarCuotaDomicilio(5, { anio: 2026, mes: 2 })
    expect(r).toEqual({ ok: false, error: MSG_SIN_CONCEPTO })
    expect(callsOf(cuotas, 'insert')).toHaveLength(0)
  })

  test('válida: inserta con vencimiento fin de mes y revalida', async () => {
    const cuotas = setup({ count: 0, concepto })
    const r = await generarCuotaDomicilio(5, { anio: 2026, mes: 2 })
    expect(r).toEqual({ ok: true, data: undefined })
    expect(callsOf(cuotas, 'insert')[0].args[0]).toEqual({
      domicilio_id: 5,
      anio: 2026,
      mes: 2,
      fecha_vencimiento: '2026-02-28',
      estatus_id: 1,
      concepto_id: 2,
      importe: 900,
    })
    expect(revalidatePath).toHaveBeenCalledWith('/domicilios/5')
    expect(revalidatePath).toHaveBeenCalledWith('/cuotas')
    expect(MSG_CUOTA_GENERADA).toBe('Cuota generada correctamente.')
  })
})

describe('editarCuota', () => {
  function setup(opts: { estatus: string | null; descuento?: unknown; recargo?: unknown; role?: string }) {
    vi.mocked(getCurrentUser).mockResolvedValue(userWith(opts.role ?? 'Administrador'))
    const info = fakeQuery({ data: opts.estatus === null ? null : { id: 9, estatus: opts.estatus } })
    const descuento = fakeQuery({ data: opts.descuento ?? null })
    const recargo = fakeQuery({ data: opts.recargo ?? null })
    vi.mocked(createClient).mockResolvedValue(
      fakeSupabase({ cuotas_info: info, descuento_cuota: descuento, recargo_cuota: recargo }) as never,
    )
    return { descuento, recargo }
  }

  test('rol Comite: sin permiso', async () => {
    const { descuento } = setup({ estatus: 'Pendiente', role: 'Comite' })
    const r = await editarCuota(9, 5, { conceptoDescuentoId: 1 })
    expect(r).toEqual({ ok: false, error: MSG_NO_PERMISO })
    expect(callsOf(descuento, 'insert')).toHaveLength(0)
  })

  test('cuota inexistente', async () => {
    setup({ estatus: null })
    const r = await editarCuota(9, 5, { conceptoDescuentoId: 1 })
    expect(r).toEqual({ ok: false, error: 'La cuota no existe.' })
  })

  test('cuota Pagado: solo pendientes', async () => {
    const { descuento } = setup({ estatus: 'Pagado' })
    const r = await editarCuota(9, 5, { conceptoDescuentoId: 1 })
    expect(r).toEqual({ ok: false, error: MSG_SOLO_PENDIENTES })
    expect(callsOf(descuento, 'insert')).toHaveLength(0)
  })

  test('descuento existente: no inserta descuento pero sí recargo', async () => {
    const { descuento, recargo } = setup({ estatus: 'Vencido', descuento: { id: 3, cuota_id: 9 } })
    const r = await editarCuota(9, 5, { conceptoDescuentoId: 1, conceptoRecargoId: 4 })
    expect(r).toEqual({ ok: true, data: undefined })
    expect(callsOf(descuento, 'insert')).toHaveLength(0)
    expect(callsOf(recargo, 'insert')[0].args[0]).toEqual({ cuota_id: 9, concepto_recargo_id: 4 })
    expect(revalidatePath).toHaveBeenCalledWith('/domicilios/5')
    expect(revalidatePath).toHaveBeenCalledWith('/cuotas')
    expect(MSG_CUOTA_EDITADA).toBe('Cuota editada correctamente.')
  })

  test('sin descuento existente: inserta descuento', async () => {
    const { descuento, recargo } = setup({ estatus: 'Pendiente' })
    const r = await editarCuota(9, 5, { conceptoDescuentoId: 1 })
    expect(r.ok).toBe(true)
    expect(callsOf(descuento, 'insert')[0].args[0]).toEqual({ cuota_id: 9, concepto_descuento_id: 1 })
    expect(callsOf(recargo, 'insert')).toHaveLength(0)
  })
})

describe.each([
  { nombre: 'eliminarDescuento', eliminar: eliminarDescuento, tabla: 'descuento_cuota' },
  { nombre: 'eliminarRecargo', eliminar: eliminarRecargo, tabla: 'recargo_cuota' },
])('$nombre', ({ eliminar, tabla }) => {
  function setup(estatus: string) {
    vi.mocked(getCurrentUser).mockResolvedValue(userWith('Tesorero'))
    const ajuste = fakeQuery({ data: { cuota_id: 9 } })
    const info = fakeQuery({ data: { id: 9, estatus } })
    vi.mocked(createClient).mockResolvedValue(fakeSupabase({ [tabla]: ajuste, cuotas_info: info }) as never)
    return { ajuste, info }
  }

  test('cuota Pagado: solo pendientes y no borra', async () => {
    const { ajuste } = setup('Pagado')
    const r = await eliminar(3, 5)
    expect(r).toEqual({ ok: false, error: MSG_SOLO_PENDIENTES })
    expect(callsOf(ajuste, 'delete')).toHaveLength(0)
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  test('cuota Vencido: borra por id y revalida', async () => {
    const { ajuste, info } = setup('Vencido')
    const r = await eliminar(3, 5)
    expect(r).toEqual({ ok: true, data: undefined })
    expect(callsOf(info, 'eq')[0].args).toEqual(['id', 9])
    expect(callsOf(ajuste, 'delete')).toHaveLength(1)
    expect(ajuste.calls.slice(-2)).toEqual([
      { method: 'delete', args: [] },
      { method: 'eq', args: ['id', 3] },
    ])
    expect(revalidatePath).toHaveBeenCalledWith('/domicilios/5')
    expect(revalidatePath).toHaveBeenCalledWith('/cuotas')
  })
})
