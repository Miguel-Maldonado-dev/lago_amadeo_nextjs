import { describe, expect, test } from 'vitest'
import type { CuotaInfo } from '../queries'
import { cuotasMetrics } from './cuotas-metrics'

const row = (estatus: string): CuotaInfo => ({ estatus, importe_cuota: 250 }) as CuotaInfo

describe('cuotasMetrics', () => {
  test('vacío', () => {
    expect(cuotasMetrics([])).toEqual({ total: 0, importeTotal: 0, pendientes: 0, pctPendientes: null })
  })

  test('cuenta pendientes y vencidos', () => {
    const rows = [row('Pagado'), row('Pagado'), row('Pagado'), row('Pendiente'), row('Vencido')]
    expect(cuotasMetrics(rows)).toEqual({ total: 5, importeTotal: 1250, pendientes: 2, pctPendientes: 40 })
  })
})
