import { MetricCard, type MetricCardProps, type MetricDensity } from '@/components/metric-card'

const COLUMNS = { 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4' } as const

export function MetricGroup({
  items,
  columns = 3,
  density = 'default',
}: {
  items: MetricCardProps[]
  columns?: 3 | 4
  density?: MetricDensity
}) {
  return (
    <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${COLUMNS[columns]}`}>
      {items.map((item) => (
        <MetricCard key={item.label} density={density} {...item} />
      ))}
    </div>
  )
}
