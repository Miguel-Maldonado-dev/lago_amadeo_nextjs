import { TableSkeleton } from '@/components/skeletons'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

/** Misma silueta que el detalle (barra, encabezado, accesos y tablas) para que nada salte al cargar. */
export default function Loading() {
  return (
    <div className="flex flex-col gap-6" role="status" aria-label="Cargando">
      <div className="flex items-center gap-4" aria-hidden="true">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-5 w-56" />
      </div>
      <Card className="gap-6 p-5 md:p-6" aria-hidden="true">
        <div className="flex items-start gap-4 sm:items-center sm:gap-5">
          <Skeleton className="size-12 rounded-full sm:size-16" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-72 max-w-full" />
          </div>
          <Skeleton className="size-9 self-start" />
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-11" />
          ))}
        </div>
      </Card>
      <div className="grid gap-6 md:grid-cols-2" aria-hidden="true">
        <Skeleton className="h-44 rounded-lg" />
        <Skeleton className="h-44 rounded-lg" />
      </div>
      <TableSkeleton rows={3} columns={4} />
      <TableSkeleton rows={5} columns={6} />
    </div>
  )
}
