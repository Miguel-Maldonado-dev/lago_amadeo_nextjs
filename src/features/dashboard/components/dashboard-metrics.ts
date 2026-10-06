import type { DomicilioInfo } from '@/features/domicilios/queries'
import type { Views } from '@/lib/supabase/types'

export type Resumen = Views<'resumen_financiero_completo'> | null

export type ResumenPeriodo = { ingresos: number; egresos: number }

/** Ingresos y egresos del mes actual y del mes anterior, ya calculados por la vista. */
export function mesesDelResumen(resumen: Resumen): { mesActual: ResumenPeriodo; mesAnterior: ResumenPeriodo } {
  return {
    mesActual: { ingresos: resumen?.ingresos_mes ?? 0, egresos: resumen?.egresos_mes ?? 0 },
    mesAnterior: { ingresos: resumen?.ingresos_mes_anterior ?? 0, egresos: resumen?.egresos_mes_anterior ?? 0 },
  }
}

export function dashboardMetrics(resumen: Resumen, totalUnidades: number) {
  return {
    saldo: resumen?.saldo_actual ?? 0,
    ingresos: resumen?.total_ingresos ?? 0,
    egresos: resumen?.total_egresos ?? 0,
    unidades: totalUnidades,
    ...mesesDelResumen(resumen),
  }
}

export function estadoCuotas(rows: DomicilioInfo[]) {
  const morosos = rows.filter((r) => r.estatus === 'Moroso').length
  return { alCorriente: rows.length - morosos, morosos, total: rows.length }
}
