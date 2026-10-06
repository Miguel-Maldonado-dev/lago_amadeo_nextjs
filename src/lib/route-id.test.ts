import { describe, expect, it } from 'vitest'
import { parseRouteId } from './route-id'

describe('parseRouteId', () => {
  it('acepta enteros positivos', () => {
    expect(parseRouteId('5')).toBe(5)
  })
  it.each(['abc', '0', '-1', '1.5', ''])('rechaza %j', (raw) => {
    expect(parseRouteId(raw)).toBeNull()
  })
})
