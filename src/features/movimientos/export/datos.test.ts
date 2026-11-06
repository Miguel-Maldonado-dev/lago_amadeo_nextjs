import { describe, expect, it } from 'vitest'
import type { Views } from '@/lib/supabase/types'
import { describirFiltros, filasExport, nombreArchivo, resumenExport } from './datos'

const mov = (id: number, tipo_id: number, importe: number, descripcion: string, fecha: string) =>
  ({
    id,
    tipo_id,
    tipo_movimiento: tipo_id === 1 ? 'Ingreso' : 'Egreso',
    importe,
    descripcion,
    fecha_movimiento: fecha,
  }) as Views<'movimientos_info'>

const largo = 'Pago de mantenimiento de áreas verdes y limpieza general del fraccionamiento, mes completo'
const rows = [mov(1, 1, 250, 'Cuota', '2026-03-05'), mov(2, 2, 100.5, largo, '2026-03-10')]

describe('filasExport', () => {
  it('mantiene columnas y orden de la tabla; egresos en negativo y descripción completa', () => {
    expect(filasExport(rows)).toEqual([
      { tipo: 'Ingreso', descripcion: 'Cuota', importe: 250, fecha: '2026-03-05' },
      { tipo: 'Egreso', descripcion: largo, importe: -100.5, fecha: '2026-03-10' },
    ])
  })
})

describe('resumenExport', () => {
  it('suma ingresos y egresos de las filas filtradas', () => {
    expect(resumenExport(rows)).toEqual({ ingresos: 250, egresos: 100.5 })
  })
})

describe('describirFiltros', () => {
  it('sin filtros indica todos', () => {
    expect(describirFiltros({ query: '', anio: null, mes: null, tipo: null })).toBe(
      'Año: Todos · Mes: Todos · Tipo: Todos',
    )
  })

  it('nombra los filtros aplicados y la búsqueda', () => {
    expect(describirFiltros({ query: ' agua ', anio: 2026, mes: 3, tipo: 2 })).toBe(
      'Año: 2026 · Mes: Marzo · Tipo: Egreso · Búsqueda: "agua"',
    )
  })
})

describe('nombreArchivo', () => {
  it('usa la fecha de hoy y la extensión', () => {
    expect(nombreArchivo('xlsx', '2026-11-05')).toBe('movimientos-2026-11-05.xlsx')
  })
})
