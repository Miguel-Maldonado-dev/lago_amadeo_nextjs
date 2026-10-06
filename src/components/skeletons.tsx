import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function TableSkeleton({ rows = 8, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <Card className="gap-0 overflow-hidden py-0" aria-hidden="true">
      <div className="flex gap-4 border-b bg-muted px-5 py-3">
        {Array.from({ length: columns }, (_, c) => (
          <Skeleton key={c} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="flex gap-4 border-b px-5 py-4 last:border-b-0">
          {Array.from({ length: columns }, (_, c) => (
            <Skeleton key={c} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </Card>
  )
}

export function MetricsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} className="h-28 rounded-lg" />
      ))}
    </div>
  )
}

export function PageSkeleton({ metrics = true }: { metrics?: boolean }) {
  return (
    <div className="flex flex-col gap-6" role="status" aria-label="Cargando">
      <Skeleton className="h-9 w-60" />
      {metrics ? <MetricsSkeleton /> : null}
      <TableSkeleton />
    </div>
  )
}
