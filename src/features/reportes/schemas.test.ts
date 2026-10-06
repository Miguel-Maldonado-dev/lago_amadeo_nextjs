import { describe, expect, test } from 'vitest'
import { eldesgateParamsSchema, pagosUsuarioFiltroSchema, zktecoParamsSchema } from './schemas'
import { totalImporte } from './totals'

const uuid = '123e4567-e89b-42d3-a456-426614174000'

describe('pagosUsuarioFiltroSchema', () => {
  test('acepta filtros válidos', () => {
    expect(
      pagosUsuarioFiltroSchema.safeParse({ usuario: uuid, inicio: '2026-01-01', fin: '2026-01-31' }).success,
    ).toBe(true)
  })

  test('rechaza inicio mayor que fin', () => {
    const r = pagosUsuarioFiltroSchema.safeParse({ usuario: uuid, inicio: '2026-02-01', fin: '2026-01-31' })
    expect(r.success).toBe(false)
  })

  test('rechaza uuid inválido', () => {
    expect(
      pagosUsuarioFiltroSchema.safeParse({ usuario: 'abc', inicio: '2026-01-01', fin: '2026-01-31' }).success,
    ).toBe(false)
  })
})

describe('totalImporte', () => {
  test('suma tratando null como 0', () => {
    expect(totalImporte([{ importe: 100 }, { importe: null }, { importe: 50.5 }])).toBe(150.5)
  })
})

describe('eldesgateParamsSchema', () => {
  test('rechaza salida inválida', () => {
    expect(eldesgateParamsSchema.safeParse({ mes: '3', anio: '2026', salida: 'X' }).success).toBe(false)
  })

  test('acepta BOTH', () => {
    expect(eldesgateParamsSchema.safeParse({ mes: '3', anio: '2026', salida: 'BOTH' }).success).toBe(true)
  })
})

describe('zktecoParamsSchema', () => {
  test('rechaza inicioID 0', () => {
    expect(zktecoParamsSchema.safeParse({ mes: '3', anio: '2026', inicioID: '0' }).success).toBe(false)
  })

  test('convierte a números', () => {
    expect(zktecoParamsSchema.parse({ mes: '3', anio: '2026', inicioID: '100' })).toEqual({
      mes: 3,
      anio: 2026,
      inicioID: 100,
    })
  })
})
