import { Badge, type BadgeVariant } from '@/components/ui/badge'

const VARIANTS: Record<string, BadgeVariant> = {
  Pagado: 'success',
  'Al corriente': 'success',
  Activo: 'success',
  Ingreso: 'success',
  Pendiente: 'warning',
  Vencido: 'danger',
  Moroso: 'danger',
  Inactivo: 'danger',
  Egreso: 'danger',
  Administrador: 'primary',
  Tesorero: 'info',
}

export function statusVariant(status: string | null): BadgeVariant {
  return status !== null && Object.hasOwn(VARIANTS, status) ? VARIANTS[status] : 'neutral'
}

export function StatusBadge({ status }: { status: string | null }) {
  return (
    <Badge variant={statusVariant(status)} dot>
      {status ?? ''}
    </Badge>
  )
}
