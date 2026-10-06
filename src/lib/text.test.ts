import { expect, test } from 'vitest'
import { toTitleCase } from './text'

test('capitaliza cada palabra', () => {
  expect(toTitleCase('juan pérez')).toBe('Juan Pérez')
})

test('colapsa espacios, recorta y pasa a minúsculas', () => {
  expect(toTitleCase('  MARÍA   de LA  luz ')).toBe('María De La Luz')
})
