import { describe, expect, it } from 'vitest'
import type { Views } from '@/lib/supabase/types'
import { filtrarPorMetodo } from './filtros-pagos'

const row = (id: number, metodo_pago_id: number | null) => ({ id, metodo_pago_id }) as Views<'reporte_pagos_detalle'>
const rows = [row(1, 1), row(2, 2), row(3, 1), row(4, null)]

describe('filtrarPorMetodo', () => {
  it('sin método devuelve todos los pagos', () => {
    expect(filtrarPorMetodo(rows, null)).toBe(rows)
  })

  it('con método devuelve solo los pagos de ese método', () => {
    expect(filtrarPorMetodo(rows, 1).map((r) => r.id)).toEqual([1, 3])
    expect(filtrarPorMetodo(rows, 2).map((r) => r.id)).toEqual([2])
  })
})
