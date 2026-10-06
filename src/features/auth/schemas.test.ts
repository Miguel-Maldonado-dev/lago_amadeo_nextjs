import { describe, expect, it } from 'vitest'
import { loginSchema } from './schemas'

describe('loginSchema', () => {
  it('rechaza email inválido', () => {
    expect(loginSchema.safeParse({ email: 'no-es-email', password: 'x' }).success).toBe(false)
  })
  it('rechaza password vacío', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com', password: '' }).success).toBe(false)
  })
  it('acepta credenciales válidas', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com', password: 'x' }).success).toBe(true)
  })
})
