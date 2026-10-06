import { cn } from '@/lib/utils'
import { formatMoney } from '@/lib/format'

export function Money({
  value,
  variant,
}: {
  value: number | null | undefined
  variant?: 'ingreso' | 'egreso'
}) {
  const text = formatMoney(value)
  const prefix = variant === 'ingreso' ? '+ ' : variant === 'egreso' ? '- ' : ''
  return (
    <span
      className={cn(
        'font-medium tabular-nums',
        variant === 'ingreso' && 'text-success',
        variant === 'egreso' && 'text-danger',
      )}
    >
      {prefix}
      {text}
    </span>
  )
}
