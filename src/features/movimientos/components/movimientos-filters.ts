import { TIPO_MOVIMIENTO } from '@/lib/constants'
import { matches } from '@/lib/search'
import type { Views } from '@/lib/supabase/types'

type Mov = Views<'movimientos_info'>

export function aniosDisponibles(rows: Mov[]): number[] {
  const set = new Set<number>()
  for (const r of rows) if (r.fecha_movimiento) set.add(Number(r.fecha_movimiento.slice(0, 4)))
  return [...set].sort((a, b) => b - a)
}

export function filterMovimientos(
  rows: Mov[],
  f: { query: string; anio: number | null; mes: number | null; tipo: number | null },
): Mov[] {
  return rows.filter((r) => {
    if (!matches([r.referencia, r.descripcion], f.query)) return false
    if (f.tipo !== null && r.tipo_id !== f.tipo) return false
    if (f.anio !== null || f.mes !== null) {
      if (!r.fecha_movimiento) return false
      if (f.anio !== null && Number(r.fecha_movimiento.slice(0, 4)) !== f.anio) return false
      if (f.mes !== null && Number(r.fecha_movimiento.slice(5, 7)) !== f.mes) return false
    }
    return true
  })
}

export function movimientosMetrics(rows: Mov[]): { ingresos: number; egresos: number; total: number } {
  let ingresos = 0
  let egresos = 0
  for (const r of rows) {
    if (r.tipo_id === TIPO_MOVIMIENTO.INGRESO) ingresos += r.importe ?? 0
    else if (r.tipo_id === TIPO_MOVIMIENTO.EGRESO) egresos += r.importe ?? 0
  }
  return { ingresos, egresos, total: rows.length }
}
