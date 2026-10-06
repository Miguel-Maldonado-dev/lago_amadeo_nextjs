import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { movimientoSchema } from './schemas'

const base = { tipoId: 1, descripcion: 'Pago de luz', importe: '150.50', metodoPagoId: 1, fechaMovimiento: '2026-10-05' }

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-10-05T18:00:00Z'))
})

afterEach(() => {
  vi.useRealTimers()
})

test('importe 0 falla', () => {
  const r = movimientoSchema.safeParse({ ...base, importe: '0' })
  expect(r.success).toBe(false)
  expect(r.error?.issues[0].message).toBe('El importe debe ser mayor a 0')
})

test('importe "150.50" se convierte a 150.5', () => {
  const r = movimientoSchema.safeParse(base)
  expect(r.success && r.data.importe).toBe(150.5)
})

test('descripción vacía falla', () => {
  const r = movimientoSchema.safeParse({ ...base, descripcion: '   ' })
  expect(r.success).toBe(false)
  expect(r.error?.issues[0].message).toBe('La descripción es obligatoria')
})
