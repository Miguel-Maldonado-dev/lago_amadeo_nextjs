import type { DomicilioInfo } from '@/features/domicilios/queries'
import { formatPercent, variation } from '@/lib/percent'
import type { Views } from '@/lib/supabase/types'

export type Resumen = Views<'resumen_financiero_completo'> | null

export function dashboardMetrics(resumen: Resumen, totalUnidades: number) {
  const ingresosMes = resumen?.ingresos_mes ?? 0
  const egresosMes = resumen?.egresos_mes ?? 0
  const ingresosPrev = resumen?.ingresos_mes_anterior ?? 0
  const egresosPrev = resumen?.egresos_mes_anterior ?? 0
  return {
    saldo: resumen?.saldo_actual ?? 0,
    ingresos: resumen?.total_ingresos ?? 0,
    egresos: resumen?.total_egresos ?? 0,
    unidades: totalUnidades,
    varSaldo: variation(ingresosMes - egresosMes, ingresosPrev - egresosPrev),
    varIngresos: variation(ingresosMes, ingresosPrev),
    varEgresos: variation(egresosMes, egresosPrev),
  }
}

export function trendBadge(
  v: number | null,
  { lowerIsBetter = false } = {},
): { text: string; tone: 'success' | 'danger' | 'neutral' } | undefined {
  if (v === null) return undefined
  if (v === 0) return { text: '0 %', tone: 'neutral' }
  const good = lowerIsBetter ? v < 0 : v > 0
  return { text: formatPercent(v, { sign: true }), tone: good ? 'success' : 'danger' }
}

export function estadoCuotas(rows: DomicilioInfo[]) {
  const morosos = rows.filter((r) => r.estatus === 'Moroso').length
  return { alCorriente: rows.length - morosos, morosos, total: rows.length }
}
