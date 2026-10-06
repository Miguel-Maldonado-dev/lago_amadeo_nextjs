import { formatDate, lastDayOfMonthISO, todayISO } from '@/lib/dates'

test('formatDate no desplaza por zona horaria', () => {
  expect(formatDate('2026-03-01')).toBe('01/03/2026')
  expect(formatDate(null)).toBe('')
})
test('lastDayOfMonthISO', () => {
  expect(lastDayOfMonthISO(2026, 2)).toBe('2026-02-28')
  expect(lastDayOfMonthISO(2024, 2)).toBe('2024-02-29')
})
test('todayISO tiene formato YYYY-MM-DD', () => {
  expect(todayISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
})
