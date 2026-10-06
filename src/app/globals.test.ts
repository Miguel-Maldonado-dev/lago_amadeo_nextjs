import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

test('globals.css define los tokens del sistema', () => {
  const css = readFileSync(resolve(process.cwd(), 'src/app/globals.css'), 'utf8')
  for (const [name, value] of [['--primary', '#065F46'], ['--primary-hover', '#054E39'], ['--primary-light', '#E6F4EF'], ['--success', '#15803D'], ['--success-light', '#DCFCE7'], ['--danger', '#B91C1C'], ['--danger-light', '#FEE2E2'], ['--warning', '#B45309'], ['--warning-light', '#FEF3C7'], ['--info', '#1D4ED8'], ['--info-light', '#DBEAFE'], ['--background', '#F6F8FA'], ['--foreground', '#111827'], ['--text-secondary', '#4B5563'], ['--muted-foreground', '#6B7280'], ['--border', '#E5E7EB'], ['--muted', '#F3F4F6']])
    expect(css).toMatch(new RegExp(`${name}:\\s*${value}`, 'i'))
  for (const old of ['--badge-success', '--table-header', '--ingreso', '--egreso', '--font-heading', '.dark {'])
    expect(css).not.toContain(old)
  expect(css).toMatch(/--ring:\s*#065F46/i)
  expect(css).not.toContain('@custom-variant dark')
  expect(css).not.toContain('oklch(')
})
