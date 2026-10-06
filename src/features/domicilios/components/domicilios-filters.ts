import { matches } from '@/lib/search'
import { percentOf } from '@/lib/percent'
import type { DomicilioInfo } from '../queries'

export type FechaFiltro = 'todas' | 'ultimo-mes' | 'ultimo-anio'

const pad = (n: number) => String(n).padStart(2, '0')

export function shiftISO(iso: string, delta: { months?: number; years?: number }): string {
  const [y, m, d] = iso.split('-').map(Number)
  const total = y * 12 + (m - 1) + (delta.months ?? 0) + (delta.years ?? 0) * 12
  const ny = Math.floor(total / 12)
  const nm = (total % 12) + 1
  const lastDay = new Date(Date.UTC(ny, nm, 0)).getUTCDate()
  return `${ny}-${pad(nm)}-${pad(Math.min(d, lastDay))}`
}

export function filterDomicilios(
  rows: DomicilioInfo[],
  f: { query: string; estatus: string | null; fecha: FechaFiltro; today: string },
): DomicilioInfo[] {
  const desde =
    f.fecha === 'ultimo-mes'
      ? shiftISO(f.today, { months: -1 })
      : f.fecha === 'ultimo-anio'
        ? shiftISO(f.today, { years: -1 })
        : null
  return rows.filter(
    (r) =>
      matches([r.direccion, r.residente_principal], f.query) &&
      (f.estatus === null || r.estatus === f.estatus) &&
      (desde === null || (r.fecha_alta ?? '') >= desde),
  )
}

export function domiciliosMetrics(rows: DomicilioInfo[]) {
  const total = rows.length
  const alCorriente = rows.filter((r) => r.estatus === 'Al corriente').length
  const morosos = rows.filter((r) => r.estatus === 'Moroso').length
  return {
    total,
    alCorriente,
    morosos,
    pctAlCorriente: percentOf(alCorriente, total),
    pctMorosos: percentOf(morosos, total),
  }
}
