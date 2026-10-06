import { describe, expect, it } from 'vitest'
import { formatPercent, percentOf, variation } from './percent'

describe('percent', () => {
  it('percentOf', () => {
    expect(percentOf(152, 158)).toBe(96.2)
    expect(percentOf(0, 0)).toBeNull()
  })
  it('formatPercent', () => {
    expect(formatPercent(3.8)).toBe('3.8 %')
    expect(formatPercent(96.2)).toBe('96.2 %')
    expect(formatPercent(5.23, { sign: true })).toBe('+5.2 %')
    expect(formatPercent(-3.14, { sign: true })).toBe('-3.1 %')
    expect(formatPercent(0, { sign: true })).toBe('0 %')
    expect(formatPercent(5)).toBe('5 %')
    expect(formatPercent(null)).toBe('—')
  })
  it('variation', () => {
    expect(variation(105, 100)).toBe(5)
    expect(variation(50, 0)).toBeNull()
  })
})
