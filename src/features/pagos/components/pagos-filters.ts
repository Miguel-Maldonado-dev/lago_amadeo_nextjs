import { TIPO_PAGO } from '@/lib/constants'
import { matches } from '@/lib/search'
import type { PagoInfo } from '../queries'

export type PeriodoFiltro = { anio: number | null; mes: number | null }

export function aniosDisponibles(rows: PagoInfo[]): number[] {
  const set = new Set<number>()
  for (const r of rows) if (r.fecha_pago) set.add(Number(r.fecha_pago.slice(0, 4)))
  return [...set].sort((a, b) => b - a)
}

export function conceptosDisponibles(rows: PagoInfo[]): string[] {
  const set = new Set<string>()
  for (const r of rows) if (r.concepto) set.add(r.concepto)
  return [...set].sort((a, b) => a.localeCompare(b, 'es'))
}

export function filterPagos(
  rows: PagoInfo[],
  f: { query: string; anio: number | null; mes: number | null; concepto: string | null },
): PagoInfo[] {
  return rows.filter((r) => {
    if (!matches([r.referencia, r.concepto, r.direccion], f.query)) return false
    if (f.concepto !== null && r.concepto !== f.concepto) return false
    if (f.anio !== null || f.mes !== null) {
      if (!r.fecha_pago) return false
      if (f.anio !== null && Number(r.fecha_pago.slice(0, 4)) !== f.anio) return false
      if (f.mes !== null && Number(r.fecha_pago.slice(5, 7)) !== f.mes) return false
    }
    return true
  })
}

export function pagosMetrics(rows: PagoInfo[]): { total: number; importe: number; extras: number } {
  return {
    total: rows.length,
    importe: rows.reduce((s, r) => s + (r.importe ?? 0), 0),
    extras: rows.filter((r) => r.tipo_pago_id === TIPO_PAGO.EXTRA).length,
  }
}
