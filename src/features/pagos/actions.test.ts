import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { revalidatePath } from 'next/cache'
import { getCuotaInfo } from '@/features/cuotas/queries'
import { getCurrentUser } from '@/lib/auth/current-user'
import { MSG_NO_PERMISO } from '@/lib/auth/run-action'
import { createClient } from '@/lib/supabase/server'
import { callsOf, fakeQuery, fakeSupabase } from '@/test/fake-query'
import { getDomicilioInfo } from '@/features/domicilios/queries'
import { registrarPagoCuota, registrarPagoExtra } from './actions'
import { MSG_CUOTA_YA_PAGADA, MSG_PAGO_SIN_MARCAR } from './messages'
import { getConceptoPago, getPagoIdPorCuota } from './queries'
import { generarReciboBase64 } from './recibo'

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/auth/current-user', () => ({ getCurrentUser: vi.fn() }))
vi.mock('@/features/pagos/recibo', () => ({ generarReciboBase64: vi.fn() }))
vi.mock('@/features/cuotas/queries', () => ({ getCuotaInfo: vi.fn() }))
vi.mock('@/features/domicilios/queries', () => ({ getDomicilioInfo: vi.fn() }))
vi.mock('@/features/pagos/queries', () => ({
  getPagoIdPorCuota: vi.fn().mockResolvedValue(null),
  getConceptoPago: vi.fn(),
}))

const userWith = (roleName: string) =>
  ({ id: 'u1', email: 'a@b.c', userName: 'Ana', roleName, roleId: 3, isActive: true }) as never

const cuotaPendiente = {
  id: 7,
  domicilio_id: 5,
  direccion: 'CALLE LAGO 12',
  residente_principal: 'Ana López',
  periodo: 'OCTUBRE 2026',
  anio: 2026,
  mes: 10,
  concepto_id: 2,
  concepto: 'Cuota Mensual',
  monto_recargo: 100,
  monto_descuento: null,
  importe_cuota: 350,
  importe_base: 250,
  fecha_vencimiento: '2026-10-31',
  fecha_vencimiento_formated: '31/10/2026',
  estatus: 'Pendiente',
  estatus_calculado: 'Pendiente',
  created_at: '2026-10-01T00:00:00Z',
}

const input = { cuotaId: 7, fechaPago: '2026-10-05', metodoPagoId: 1 }

type SetupOpts = {
  role?: string
  cuota?: unknown
  recibo?: string | null
  pagoExistente?: number
  fileDataError?: boolean
  cuotasError?: boolean
}

function setup(opts: SetupOpts = {}) {
  vi.mocked(getCurrentUser).mockResolvedValue(userWith(opts.role ?? 'Tesorero'))
  vi.mocked(getCuotaInfo).mockResolvedValue((opts.cuota ?? cuotaPendiente) as never)
  vi.mocked(getPagoIdPorCuota).mockResolvedValue(opts.pagoExistente ?? null)
  vi.mocked(generarReciboBase64).mockResolvedValue(opts.recibo === undefined ? 'PDF64' : opts.recibo)
  // El mismo fake de `pagos` atiende el insert…select…single y el update posterior de file_data.
  const pagos = fakeQuery({ data: { id: 11, referencia: 'ref-uuid' } })
  const cuotas = fakeQuery(opts.cuotasError ? { error: { message: 'cuotas caída' } } : {})
  const supabase = fakeSupabase({ pagos, cuotas })
  // Con `fileDataError`, la 2.ª llamada a from('pagos') (el update de file_data) devuelve error.
  const pagosUpdate = fakeQuery({ error: { message: 'file_data caída' } })
  if (opts.fileDataError) supabase.from.mockReturnValueOnce(pagos).mockReturnValueOnce(pagosUpdate)
  vi.mocked(createClient).mockResolvedValue(supabase as never)
  return { pagos, pagosUpdate, cuotas, supabase }
}

const REVALIDADAS = ['/domicilios/5', '/cuotas', '/pagos', '/movimientos', '/']

beforeEach(() => {
  vi.clearAllMocks()
  // "Hoy" fijo (mediodía en America/Mexico_City) para que '2026-10-05' nunca sea fecha futura.
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-10-05T18:00:00Z'))
})

afterEach(() => {
  vi.useRealTimers()
})

test('rechaza cuota pagada', async () => {
  const { pagos, cuotas } = setup({ cuota: { ...cuotaPendiente, estatus: 'Pagado' } })

  const r = await registrarPagoCuota(input)

  expect(r).toEqual({ ok: false, error: 'Esta cuota ya fue pagada.' })
  expect(MSG_CUOTA_YA_PAGADA).toBe('Esta cuota ya fue pagada.')
  expect(callsOf(pagos, 'insert')).toHaveLength(0)
  expect(generarReciboBase64).not.toHaveBeenCalled()
  expect(callsOf(cuotas, 'update')).toHaveLength(0)
})

test('rechaza fecha futura', async () => {
  const { pagos } = setup()

  const r = await registrarPagoCuota({ ...input, fechaPago: '2999-01-01' })

  expect(r).toEqual({ ok: false, error: 'La fecha no puede ser futura' })
  expect(getCuotaInfo).not.toHaveBeenCalled()
  expect(callsOf(pagos, 'insert')).toHaveLength(0)
})

test('flujo completo con recibo', async () => {
  const { pagos, cuotas, supabase } = setup()

  const r = await registrarPagoCuota(input)

  expect(r).toEqual({ ok: true, data: { pagoId: 11, reciboGenerado: true } })
  expect(getCuotaInfo).toHaveBeenCalledWith(supabase, 7)

  // (3) insert del pago con importe_cuota y el usuario de la sesión
  expect(callsOf(pagos, 'insert')[0].args[0]).toEqual({
    domicilio_id: 5,
    cuota_id: 7,
    concepto_id: 2,
    fecha_pago: '2026-10-05',
    metodo_pago_id: 1,
    user_id: 'u1',
    importe: 350,
  })
  expect(callsOf(pagos, 'select')[0].args).toEqual(['id, referencia'])

  // (4) recibo con importe_base, descuento nulo → 0 y fecha dd/MM/yyyy
  expect(generarReciboBase64).toHaveBeenCalledWith(supabase, {
    direccion: 'CALLE LAGO 12',
    residente: 'Ana López',
    periodo: 'OCTUBRE 2026',
    concepto: 'Cuota Mensual',
    fecha_vencimiento: '31/10/2026',
    importe: 250,
    descuento: 0,
    recargo: 100,
    fecha_pago: '05/10/2026',
    referencia: 'ref-uuid',
  })

  // (5) file_data del pago recién creado
  expect(callsOf(pagos, 'update').map((c) => c.args)).toEqual([[{ file_data: 'PDF64' }]])
  expect(callsOf(pagos, 'eq').map((c) => c.args)).toEqual([['id', 11]])

  // (6) la cuota queda Pagado
  expect(callsOf(cuotas, 'update').map((c) => c.args)).toEqual([[{ estatus_id: 2 }]])
  expect(callsOf(cuotas, 'eq').map((c) => c.args)).toEqual([['id', 7]])

  // Orden: getCuotaInfo → pago existente → insert pagos → recibo → update file_data → update cuotas
  // (sin movimientos_financieros: los crea el trigger)
  expect(pagos.calls.map((c) => c.method)).toEqual(['insert', 'select', 'single', 'update', 'eq'])
  expect(supabase.from.mock.calls.map(([table]) => table)).toEqual(['pagos', 'pagos', 'cuotas'])
  const [insertAt, fileDataAt, cuotaAt] = supabase.from.mock.invocationCallOrder
  const cuotaInfoAt = vi.mocked(getCuotaInfo).mock.invocationCallOrder[0]
  const existenteAt = vi.mocked(getPagoIdPorCuota).mock.invocationCallOrder[0]
  const reciboAt = vi.mocked(generarReciboBase64).mock.invocationCallOrder[0]
  expect(getPagoIdPorCuota).toHaveBeenCalledWith(supabase, 7)
  expect(cuotaInfoAt).toBeLessThan(existenteAt)
  expect(existenteAt).toBeLessThan(insertAt)
  expect(insertAt).toBeLessThan(reciboAt)
  expect(reciboAt).toBeLessThan(fileDataAt)
  expect(fileDataAt).toBeLessThan(cuotaAt)

  // (7) revalidaciones
  expect(vi.mocked(revalidatePath).mock.calls.map(([path]) => path)).toEqual(REVALIDADAS)
})

test('si el recibo falla igual marca pagada', async () => {
  const { pagos, cuotas } = setup({ recibo: null })

  const r = await registrarPagoCuota(input)

  expect(r).toEqual({ ok: true, data: { pagoId: 11, reciboGenerado: false } })
  expect(callsOf(pagos, 'insert')).toHaveLength(1)
  expect(callsOf(pagos, 'update')).toHaveLength(0)
  expect(callsOf(cuotas, 'update').map((c) => c.args)).toEqual([[{ estatus_id: 2 }]])
  expect(callsOf(cuotas, 'eq').map((c) => c.args)).toEqual([['id', 7]])
  expect(revalidatePath).toHaveBeenCalledWith('/domicilios/5')
})

test('rol Vigilancia no puede pagar', async () => {
  const { pagos, cuotas } = setup({ role: 'Vigilancia' })

  const r = await registrarPagoCuota(input)

  expect(r).toEqual({ ok: false, error: MSG_NO_PERMISO })
  expect(getCuotaInfo).not.toHaveBeenCalled()
  expect(callsOf(pagos, 'insert')).toHaveLength(0)
  expect(callsOf(cuotas, 'update')).toHaveLength(0)
})

test('si falla guardar file_data igual marca pagada', async () => {
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
  const { pagos, pagosUpdate, cuotas } = setup({ fileDataError: true })

  const r = await registrarPagoCuota(input)

  expect(r).toEqual({ ok: true, data: { pagoId: 11, reciboGenerado: false } })
  expect(callsOf(pagos, 'insert')).toHaveLength(1)
  expect(callsOf(pagosUpdate, 'update').map((c) => c.args)).toEqual([[{ file_data: 'PDF64' }]])
  expect(callsOf(cuotas, 'update').map((c) => c.args)).toEqual([[{ estatus_id: 2 }]])
  expect(consoleError).toHaveBeenCalled()
  consoleError.mockRestore()
})

test('pago ya existente: no duplica y marca pagada', async () => {
  const { pagos, cuotas } = setup({ pagoExistente: 7 })

  const r = await registrarPagoCuota(input)

  expect(r).toEqual({ ok: true, data: { pagoId: 7, reciboGenerado: true, yaExistia: true } })
  expect(callsOf(pagos, 'insert')).toHaveLength(0)
  expect(generarReciboBase64).not.toHaveBeenCalled()
  expect(callsOf(cuotas, 'update').map((c) => c.args)).toEqual([[{ estatus_id: 2 }]])
  expect(callsOf(cuotas, 'eq').map((c) => c.args)).toEqual([['id', 7]])
  expect(vi.mocked(revalidatePath).mock.calls.map(([path]) => path)).toEqual(REVALIDADAS)
})

test('si falla marcar la cuota no lanza: avisa y revalida', async () => {
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
  const { pagos, cuotas } = setup({ cuotasError: true })

  const r = await registrarPagoCuota(input)

  expect(r).toEqual({ ok: false, error: MSG_PAGO_SIN_MARCAR })
  expect(callsOf(pagos, 'insert')).toHaveLength(1)
  expect(callsOf(cuotas, 'update')).toHaveLength(1)
  expect(vi.mocked(revalidatePath).mock.calls.map(([path]) => path)).toEqual(REVALIDADAS)
  expect(consoleError).toHaveBeenCalled()
  consoleError.mockRestore()
})

test('cuota sin importe base se trata como inexistente', async () => {
  const { pagos } = setup({ cuota: { ...cuotaPendiente, importe_base: null } })

  const r = await registrarPagoCuota(input)

  expect(r).toEqual({ ok: false, error: 'La cuota no existe.' })
  expect(callsOf(pagos, 'insert')).toHaveLength(0)
  expect(generarReciboBase64).not.toHaveBeenCalled()
})

const conceptoExtra = { id: 4, nombre: 'Tarjeta de acceso', importe: 200, tipo_pago_id: 2, created_at: '' }
const inputExtra = { domicilioId: 5, conceptoId: 4, fechaPago: '2026-10-05', metodoPagoId: 1 }

function setupExtra(opts: { role?: string; concepto?: unknown; domicilio?: unknown; recibo?: string | null } = {}) {
  vi.mocked(getCurrentUser).mockResolvedValue(userWith(opts.role ?? 'Tesorero'))
  vi.mocked(getConceptoPago).mockResolvedValue((opts.concepto === undefined ? conceptoExtra : opts.concepto) as never)
  vi.mocked(getDomicilioInfo).mockResolvedValue(
    (opts.domicilio === undefined
      ? { id: 5, direccion: 'CALLE LAGO 12', residente_principal: 'Ana López' }
      : opts.domicilio) as never,
  )
  vi.mocked(generarReciboBase64).mockResolvedValue(opts.recibo === undefined ? 'PDF64' : opts.recibo)
  const pagos = fakeQuery({ data: { id: 11, referencia: 'ref-uuid' } })
  const supabase = fakeSupabase({ pagos })
  vi.mocked(createClient).mockResolvedValue(supabase as never)
  return { pagos, supabase }
}

test('pago extra: concepto de otro tipo es inválido', async () => {
  const { pagos } = setupExtra({ concepto: { ...conceptoExtra, tipo_pago_id: 1 } })

  const r = await registrarPagoExtra(inputExtra)

  expect(r).toEqual({ ok: false, error: 'Concepto inválido.' })
  expect(callsOf(pagos, 'insert')).toHaveLength(0)
  expect(generarReciboBase64).not.toHaveBeenCalled()
})

test('pago extra: concepto inexistente es inválido', async () => {
  const { pagos } = setupExtra({ concepto: null })

  expect(await registrarPagoExtra(inputExtra)).toEqual({ ok: false, error: 'Concepto inválido.' })
  expect(callsOf(pagos, 'insert')).toHaveLength(0)
})

test('pago extra: domicilio inexistente', async () => {
  const { pagos } = setupExtra({ domicilio: null })

  expect(await registrarPagoExtra(inputExtra)).toEqual({ ok: false, error: 'El domicilio no existe.' })
  expect(callsOf(pagos, 'insert')).toHaveLength(0)
})

test('pago extra: flujo completo con importe del concepto y sin cuota', async () => {
  const { pagos, supabase } = setupExtra()

  const r = await registrarPagoExtra(inputExtra)

  expect(r).toEqual({ ok: true, data: { pagoId: 11, reciboGenerado: true } })
  expect(getConceptoPago).toHaveBeenCalledWith(supabase, 4)
  expect(getDomicilioInfo).toHaveBeenCalledWith(supabase, 5)
  const inserted = callsOf(pagos, 'insert')[0].args[0] as Record<string, unknown>
  expect(inserted).toEqual({
    domicilio_id: 5,
    concepto_id: 4,
    fecha_pago: '2026-10-05',
    metodo_pago_id: 1,
    user_id: 'u1',
    importe: 200,
  })
  expect('cuota_id' in inserted).toBe(false)
  expect(callsOf(pagos, 'select')[0].args).toEqual(['id, referencia'])

  const payload = vi.mocked(generarReciboBase64).mock.calls[0][1]
  expect(payload).toEqual({
    direccion: 'CALLE LAGO 12',
    residente: 'Ana López',
    concepto: 'Tarjeta de acceso',
    importe: 200,
    fecha_pago: '05/10/2026',
    referencia: 'ref-uuid',
  })
  expect('periodo' in payload).toBe(false)
  expect('fecha_vencimiento' in payload).toBe(false)

  expect(callsOf(pagos, 'update').map((c) => c.args)).toEqual([[{ file_data: 'PDF64' }]])
  expect(callsOf(pagos, 'eq').map((c) => c.args)).toEqual([['id', 11]])
  expect(vi.mocked(revalidatePath).mock.calls.map(([path]) => path)).toEqual([
    '/pagos',
    '/domicilios/5',
    '/movimientos',
    '/',
  ])
})

test('pago extra: sin recibo reciboGenerado es false y no actualiza file_data', async () => {
  const { pagos } = setupExtra({ recibo: null })

  const r = await registrarPagoExtra(inputExtra)

  expect(r).toEqual({ ok: true, data: { pagoId: 11, reciboGenerado: false } })
  expect(callsOf(pagos, 'update')).toHaveLength(0)
})

test('pago extra: rol Comite no puede registrar', async () => {
  const { pagos } = setupExtra({ role: 'Comite' })

  expect(await registrarPagoExtra(inputExtra)).toEqual({ ok: false, error: MSG_NO_PERMISO })
  expect(getConceptoPago).not.toHaveBeenCalled()
  expect(callsOf(pagos, 'insert')).toHaveLength(0)
})
