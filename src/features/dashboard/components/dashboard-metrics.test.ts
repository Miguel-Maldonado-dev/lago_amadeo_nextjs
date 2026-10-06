import { describe, expect, it } from 'vitest'
import type { DomicilioInfo } from '@/features/domicilios/queries'
import { dashboardMetrics, estadoCuotas } from './dashboard-metrics'

describe('dashboardMetrics', () => {
  it('con null devuelve ceros', () => {
    expect(dashboardMetrics(null, 158)).toEqual({
      saldo: 0,
      ingresos: 0,
      egresos: 0,
      unidades: 158,
      mesActual: { ingresos: 0, egresos: 0 },
      mesAnterior: { ingresos: 0, egresos: 0 },
    })
  })

  it('separa los acumulados del mes actual y del mes anterior', () => {
    const m = dashboardMetrics(
      {
        saldo_actual: 10,
        total_ingresos: 20,
        total_egresos: 10,
        ingresos_mes: 1124,
        egresos_mes: null,
        ingresos_mes_anterior: 1000,
        egresos_mes_anterior: 350.5,
      },
      5,
    )
    expect(m).toMatchObject({ saldo: 10, ingresos: 20, egresos: 10, unidades: 5 })
    expect(m.mesActual).toEqual({ ingresos: 1124, egresos: 0 })
    expect(m.mesAnterior).toEqual({ ingresos: 1000, egresos: 350.5 })
  })
})

describe('estadoCuotas', () => {
  it('cuenta morosos contra el resto', () => {
    const rows = [{ estatus: 'Moroso' }, { estatus: 'Al corriente' }, { estatus: null }] as DomicilioInfo[]
    expect(estadoCuotas(rows)).toEqual({ alCorriente: 2, morosos: 1, total: 3 })
  })
})
