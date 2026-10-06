export function percentOf(part: number, total: number): number | null {
  if (total <= 0) return null
  return Math.round((part / total) * 1000) / 10
}

export function formatPercent(value: number | null, { sign = false } = {}): string {
  if (value === null) return '—'
  const rounded = Number(value.toFixed(1))
  const prefix = sign && rounded > 0 ? '+' : ''
  return `${prefix}${rounded.toString()} %`
}

export function variation(current: number, previous: number): number | null {
  if (previous === 0) return null
  return ((current - previous) / Math.abs(previous)) * 100
}
