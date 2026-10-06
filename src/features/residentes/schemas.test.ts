import { describe, expect, test } from 'vitest'
import { residenteSchema } from './schemas'

describe('residenteSchema', () => {
  test('aplica title case al nombre', () => {
    const r = residenteSchema.parse({ nombre: 'juan pérez' })
    expect(r.nombre).toBe('Juan Pérez')
  })

  test('teléfono vacío es válido', () => {
    expect(residenteSchema.safeParse({ nombre: 'Ana', telefono: '' }).success).toBe(true)
  })

  test('teléfono con letras falla', () => {
    const r = residenteSchema.safeParse({ nombre: 'Ana', telefono: 'abc' })
    expect(r.success).toBe(false)
  })

  test('nombre vacío falla', () => {
    const r = residenteSchema.safeParse({ nombre: '  ' })
    expect(r.success).toBe(false)
  })
})
