import { percentOf } from '@/lib/percent'
import type { CuotaInfo } from '../queries'

const PENDIENTES = ['Pendiente', 'Vencido']

export function cuotasMetrics(rows: CuotaInfo[]): {
  total: number
  importeTotal: number
  pendientes: number
  pctPendientes: number | null
} {
  const total = rows.length
  const importeTotal = rows.reduce((acc, r) => acc + (r.importe_cuota ?? 0), 0)
  const pendientes = rows.filter((r) => r.estatus !== null && PENDIENTES.includes(r.estatus)).length
  return { total, importeTotal, pendientes, pctPendientes: percentOf(pendientes, total) }
}
