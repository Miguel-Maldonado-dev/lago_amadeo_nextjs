import { describe, expect, it } from 'vitest'
import type { Views } from '@/lib/supabase/types'
import { aniosDisponibles, filterMovimientos, movimientosMetrics } from './movimientos-filters'

type Mov = Views<'movimientos_info'>
const m = (over: Partial<Mov>): Mov =>
  ({ id: 1, tipo_id: 1, descripcion: 'Cuota', referencia: 'r1', importe: 100, fecha_movimiento: '2026-09-10', ...over }) as Mov

const rows = [
  m({ id: 1 }),
  m({ id: 2, tipo_id: 2, importe: 30, fecha_movimiento: '2025-02-01', descripcion: 'Jardinería' }),
]
const base = { query: '', anio: null, mes: null, tipo: null }

describe('movimientos-filters', () => {
  it('anios', () => expect(aniosDisponibles(rows)).toEqual([2026, 2025]))
  it('tipo 2 deja egresos', () => {
    expect(filterMovimientos(rows, { ...base, tipo: 2 }).map((r) => r.id)).toEqual([2])
  })
  it('query y periodo', () => {
    expect(filterMovimientos(rows, { ...base, query: 'jardin' }).map((r) => r.id)).toEqual([2])
    expect(filterMovimientos(rows, { ...base, anio: 2026, mes: 9 }).map((r) => r.id)).toEqual([1])
  })
  it('metrics', () => {
    expect(movimientosMetrics(rows)).toEqual({ ingresos: 100, egresos: 30, total: 2 })
  })
})
