import { describe, expect, test } from 'vitest'
import { domicilioSchema } from './schemas'

const base = { direccion: 'Calle 1', fechaAlta: '2026-01-01' }

describe('domicilioSchema', () => {
  test('recorta y pasa la dirección a mayúsculas', () => {
    expect(domicilioSchema.parse({ ...base, direccion: ' calle 1 ' }).direccion).toBe('CALLE 1')
  })
  test('rechaza dirección vacía', () => {
    expect(domicilioSchema.safeParse({ ...base, direccion: '  ' }).success).toBe(false)
  })
  test('rechaza fecha con formato inválido', () => {
    expect(domicilioSchema.safeParse({ ...base, fechaAlta: '2026/01/01' }).success).toBe(false)
  })
  test('convierte conceptoId a número', () => {
    expect(domicilioSchema.parse({ ...base, conceptoId: '2' }).conceptoId).toBe(2)
  })
})
