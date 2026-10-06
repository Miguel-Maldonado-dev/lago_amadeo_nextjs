import { ArrowDown, ArrowUp } from 'lucide-react'
import { StatusBadge } from '@/components/status-badge'
import { TIPO_MOVIMIENTO } from '@/lib/constants'
import { cn } from '@/lib/utils'

/** Celda de tipo de movimiento: flecha en círculo tintado más badge. Compartida por Movimientos e Inicio. */
export function TipoMovimientoCell({ tipoId, nombre }: { tipoId: number | null; nombre: string | null }) {
  const egreso = tipoId === TIPO_MOVIMIENTO.EGRESO
  return (
    <div className="flex items-center gap-2">
      <span
        data-testid="tipo-movimiento-icon"
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-full',
          egreso ? 'bg-danger-light text-danger' : 'bg-success-light text-success',
        )}
      >
        {egreso ? <ArrowDown className="size-4" aria-hidden="true" /> : <ArrowUp className="size-4" aria-hidden="true" />}
      </span>
      <StatusBadge status={nombre} />
    </div>
  )
}
