import { describe, expect, it } from 'vitest'
import type { DomicilioInfo } from '@/features/domicilios/queries'
import { dashboardMetrics, estadoCuotas, trendBadge } from './dashboard-metrics'

describe('dashboardMetrics', () => {
  it('con null devuelve ceros y variaciones null', () => {
    expect(dashboardMetrics(null, 158)).toEqual({
      saldo: 0,
      ingresos: 0,
      egresos: 0,
      unidades: 158,
      varSaldo: null,
      varIngresos: null,
      varEgresos: null,
    })
  })

  it('calcula la variación de ingresos', () => {
    const m = dashboardMetrics(
      {
        saldo_actual: 10,
        total_ingresos: 20,
        total_egresos: 10,
        ingresos_mes: 1124,
        egresos_mes: null,
        ingresos_mes_anterior: 1000,
        egresos_mes_anterior: null,
      },
      5,
    )
    expect(m.varIngresos).toBeCloseTo(12.4)
    expect(m.varEgresos).toBeNull()
  })
})

describe('trendBadge', () => {
  it('formatea positivos como success', () => {
    expect(trendBadge(12.4)).toEqual({ text: '+12.4 %', tone: 'success' })
  })
  it('invierte con lowerIsBetter', () => {
    expect(trendBadge(8.1, { lowerIsBetter: true })?.tone).toBe('danger')
  })
  it('null → undefined, 0 → neutral', () => {
    expect(trendBadge(null)).toBeUndefined()
    expect(trendBadge(0)).toEqual({ text: '0 %', tone: 'neutral' })
  })
})

describe('estadoCuotas', () => {
  it('cuenta morosos contra el resto', () => {
    const rows = [{ estatus: 'Moroso' }, { estatus: 'Al corriente' }, { estatus: null }] as DomicilioInfo[]
    expect(estadoCuotas(rows)).toEqual({ alCorriente: 2, morosos: 1, total: 3 })
  })
})
