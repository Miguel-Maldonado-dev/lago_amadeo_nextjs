import type { Views } from '@/lib/supabase/types'

type PagoReporte = Views<'reporte_pagos_detalle'>

/** Pagos de un método de pago; sin método se devuelven todos. */
export function filtrarPorMetodo(rows: PagoReporte[], metodoId: number | null): PagoReporte[] {
  return metodoId === null ? rows : rows.filter((r) => r.metodo_pago_id === metodoId)
}
