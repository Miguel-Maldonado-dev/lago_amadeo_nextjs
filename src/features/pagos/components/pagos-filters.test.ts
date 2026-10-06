import { describe, expect, it } from 'vitest'
import type { PagoInfo } from '../queries'
import { aniosDisponibles, conceptosDisponibles, filterPagos, pagosMetrics } from './pagos-filters'

const p = (over: Partial<PagoInfo>): PagoInfo =>
  ({
    id: 1,
    referencia: 'abc',
    concepto: 'Mantenimiento',
    direccion: 'Amadeo 1068',
    importe: 100,
    fecha_pago: '2026-09-10',
    tipo_pago_id: 1,
    ...over,
  }) as PagoInfo

const rows = [
  p({ id: 1 }),
  p({ id: 2, fecha_pago: '2025-01-05', direccion: 'Otra 5' }),
  p({ id: 3, concepto: 'Tarjeta de Acceso', tipo_pago_id: 2, importe: 50, fecha_pago: '2026-08-01' }),
  p({ id: 4, fecha_pago: '2026-09-20' }),
]
const base = { query: '', anio: null, mes: null, concepto: null }

describe('pagos-filters', () => {
  it('aniosDisponibles desc sin duplicados', () => {
    expect(aniosDisponibles(rows)).toEqual([2026, 2025])
  })
  it('conceptosDisponibles alfabético', () => {
    expect(conceptosDisponibles(rows)).toEqual(['Mantenimiento', 'Tarjeta de Acceso'])
  })
  it('filtra por año y mes', () => {
    expect(filterPagos(rows, { ...base, anio: 2026, mes: 9 }).map((r) => r.id)).toEqual([1, 4])
  })
  it('filtra por concepto', () => {
    expect(filterPagos(rows, { ...base, concepto: 'Tarjeta de Acceso' }).map((r) => r.id)).toEqual([3])
  })
  it('busca por dirección', () => {
    expect(filterPagos(rows, { ...base, query: 'amadeo 1068' }).map((r) => r.id)).toEqual([1, 3, 4])
  })
  it('metrics', () => {
    expect(pagosMetrics(rows)).toEqual({ total: 4, importe: 350, extras: 1 })
    expect(pagosMetrics([])).toEqual({ total: 0, importe: 0, extras: 0 })
  })
})
