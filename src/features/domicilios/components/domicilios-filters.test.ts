import { describe, expect, test } from 'vitest'
import type { DomicilioInfo } from '../queries'
import { domiciliosMetrics, filterDomicilios, shiftISO } from './domicilios-filters'

const row = (o: Partial<DomicilioInfo>): DomicilioInfo => ({
  id: 1,
  direccion: 'AMADEO 1',
  fecha_alta: '2026-01-05',
  observaciones: null,
  residente_principal: 'Ana',
  id_concepto: null,
  tipo_cuota: null,
  acceso_telefono: null,
  acceso_tarjeta: null,
  estatus: 'Al corriente',
  ...o,
})
const base = { query: '', estatus: null, fecha: 'todas' as const, today: '2026-10-05' }

describe('filterDomicilios', () => {
  test('estatus Moroso deja solo morosos', () => {
    const rows = [row({ id: 1 }), row({ id: 2, estatus: 'Moroso' })]
    expect(filterDomicilios(rows, { ...base, estatus: 'Moroso' }).map((r) => r.id)).toEqual([2])
  })
  test('busca residente sin acentos', () => {
    const rows = [row({ id: 1 }), row({ id: 2, residente_principal: 'Ever Hernandez' })]
    expect(filterDomicilios(rows, { ...base, query: 'hernández' }).map((r) => r.id)).toEqual([2])
  })
  test('último mes es inclusivo', () => {
    const rows = [row({ id: 1, fecha_alta: '2026-09-05' }), row({ id: 2, fecha_alta: '2026-09-04' })]
    expect(filterDomicilios(rows, { ...base, fecha: 'ultimo-mes' }).map((r) => r.id)).toEqual([1])
  })
  test('último año es inclusivo', () => {
    const rows = [row({ id: 1, fecha_alta: '2025-10-05' }), row({ id: 2, fecha_alta: '2025-10-04' })]
    expect(filterDomicilios(rows, { ...base, fecha: 'ultimo-anio' }).map((r) => r.id)).toEqual([1])
  })
})

describe('shiftISO', () => {
  test('recorta el día al fin de mes', () => {
    expect(shiftISO('2026-03-31', { months: -1 })).toBe('2026-02-28')
  })
})

describe('domiciliosMetrics', () => {
  test('vacío', () => {
    expect(domiciliosMetrics([])).toEqual({
      total: 0, alCorriente: 0, morosos: 0, pctAlCorriente: null, pctMorosos: null,
    })
  })
  test('porcentajes', () => {
    const rows = [
      ...Array.from({ length: 152 }, () => row({})),
      ...Array.from({ length: 6 }, () => row({ estatus: 'Moroso' })),
    ]
    const m = domiciliosMetrics(rows)
    expect(m.pctAlCorriente).toBe(96.2)
    expect(m.pctMorosos).toBe(3.8)
  })
})
