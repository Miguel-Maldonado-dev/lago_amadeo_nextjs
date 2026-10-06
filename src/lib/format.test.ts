import { formatMoney } from '@/lib/format'

test('formatMoney', () => {
  expect(formatMoney(1234.5)).toBe('$1,234.50')
  expect(formatMoney(0)).toBe('$0.00')
  expect(formatMoney(null)).toBe('$0.00')
})
