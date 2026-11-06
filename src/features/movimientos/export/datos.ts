import { TIPO_MOVIMIENTO } from '@/lib/constants'
import { MESES } from '@/lib/months'
import type { Views } from '@/lib/supabase/types'
import { movimientosMetrics } from '../components/movimientos-filters'

type Movimiento = Views<'movimientos_info'>

/** Una fila exportada: mismas columnas que la tabla. Los egresos van en negativo, como el "- $" de pantalla. */
export type FilaExport = { tipo: string; descripcion: string; importe: number; fecha: string }

export type FiltrosMovimientos = { query: string; anio: number | null; mes: number | null; tipo: number | null }

export type MetaExport = { filtros: string; generado: string; totales: { ingresos: number; egresos: number } }

export function filasExport(rows: Movimiento[]): FilaExport[] {
  return rows.map((r) => {
    const importe = r.importe ?? 0
    return {
      tipo: r.tipo_movimiento ?? '',
      descripcion: r.descripcion ?? '',
      importe: r.tipo_id === TIPO_MOVIMIENTO.EGRESO ? -importe : importe,
      fecha: r.fecha_movimiento?.slice(0, 10) ?? '',
    }
  })
}

/** Totales del consolidado; usa la misma cuenta que las métricas de la pantalla para que coincidan. */
export function resumenExport(rows: Movimiento[]): MetaExport['totales'] {
  const { ingresos, egresos } = movimientosMetrics(rows)
  return { ingresos, egresos }
}

const TIPOS: Record<number, string> = {
  [TIPO_MOVIMIENTO.INGRESO]: 'Ingreso',
  [TIPO_MOVIMIENTO.EGRESO]: 'Egreso',
}

export function describirFiltros(f: FiltrosMovimientos): string {
  const partes = [
    `Año: ${f.anio ?? 'Todos'}`,
    `Mes: ${f.mes === null ? 'Todos' : MESES[f.mes - 1]}`,
    `Tipo: ${f.tipo === null ? 'Todos' : (TIPOS[f.tipo] ?? 'Todos')}`,
  ]
  const query = f.query.trim()
  if (query) partes.push(`Búsqueda: "${query}"`)
  return partes.join(' · ')
}

export function nombreArchivo(ext: 'xlsx' | 'pdf', hoy: string): string {
  return `movimientos-${hoy}.${ext}`
}
