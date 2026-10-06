import { describe, expect, test } from 'vitest'
import { periodoSchema } from './schemas'

describe('periodoSchema', () => {
  test('rechaza mes 13', () => {
    expect(periodoSchema.safeParse({ anio: '2026', mes: '13' }).success).toBe(false)
  })

  test('convierte cadenas a números', () => {
    expect(periodoSchema.parse({ anio: '2026', mes: '2' })).toEqual({ anio: 2026, mes: 2 })
  })
})
