import { describe, expect, test } from 'vitest'
import { editarUsuarioSchema, nuevoUsuarioSchema } from './schemas'

const base = { userName: 'ana lopez', email: 'ana@lago.mx', password: '123456', roleId: 2 }

describe('nuevoUsuarioSchema', () => {
  test('acepta datos válidos y pone el nombre en title case', () => {
    const r = nuevoUsuarioSchema.safeParse(base)
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.userName).toBe('Ana Lopez')
  })

  test('rechaza contraseña de 5 caracteres', () => {
    const r = nuevoUsuarioSchema.safeParse({ ...base, password: '12345' })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.issues[0].message).toBe('Mínimo 6 caracteres')
  })

  test('rechaza email inválido', () => {
    const r = nuevoUsuarioSchema.safeParse({ ...base, email: 'no-es-email' })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.issues[0].message).toBe('Email inválido')
  })
})

describe('editarUsuarioSchema', () => {
  test('normaliza nombre y coacciona rol', () => {
    const r = editarUsuarioSchema.safeParse({ userName: 'ana lopez', roleId: '3' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual({ userName: 'Ana Lopez', roleId: 3 })
  })

  test('rechaza nombre vacío', () => {
    expect(editarUsuarioSchema.safeParse({ userName: '  ', roleId: 1 }).success).toBe(false)
  })
})
