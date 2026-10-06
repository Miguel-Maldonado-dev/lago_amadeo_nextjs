import { describe, expect, test } from 'vitest'
import { matches, normalize } from './search'

describe('search', () => {
  test('normalize quita diacríticos, mayúsculas y espacios extra', () => {
    expect(normalize('  Miguel  Hernández ')).toBe('miguel hernandez')
  })
  test('matches ignora acentos', () => {
    expect(matches(['AMADEO 1006', 'Ever Hernandez'], 'hernandez')).toBe(true)
  })
  test('query vacía coincide', () => {
    expect(matches(['x'], '')).toBe(true)
  })
})
