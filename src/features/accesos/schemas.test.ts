import { describe, expect, test } from 'vitest'
import { numeroSchema } from './schemas'

describe('numeroSchema', () => {
  test('acepta dígitos', () => {
    expect(numeroSchema.safeParse({ valor: '5512345678' }).success).toBe(true)
  })

  test.each(['55-1234', '', '12345678901'])('rechaza %j', (valor) => {
    const r = numeroSchema.safeParse({ valor })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.issues[0].message).toBe('Solo dígitos, máximo 10')
  })
})
