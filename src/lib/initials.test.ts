import { describe, expect, it } from 'vitest'
import { avatarTone, initialsOf } from './initials'

describe('initialsOf', () => {
  it('casos', () => {
    expect(initialsOf('Miguel Hernández')).toBe('MH')
    expect(initialsOf('Ulises')).toBe('U')
    expect(initialsOf('  ana   lopez ')).toBe('AL')
    expect(initialsOf('')).toBe('?')
    expect(initialsOf(null)).toBe('?')
  })
})

describe('avatarTone', () => {
  it('determinista y en rango', () => {
    expect(avatarTone('Ana')).toBe(avatarTone('Ana'))
    expect(avatarTone('Ana')).toBeGreaterThanOrEqual(1)
    expect(avatarTone('Ana')).toBeLessThanOrEqual(6)
  })
  it('nulo es 6', () => expect(avatarTone(null)).toBe(6))
})
