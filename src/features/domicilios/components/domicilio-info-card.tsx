import { StatusBadge } from '@/components/status-badge'
import { Card, CardContent } from '@/components/ui/card'
import { formatDate } from '@/lib/dates'
import { cn } from '@/lib/utils'
import type { DomicilioInfo } from '../queries'

function Field({ label, muted, children }: { label: string; muted?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className={cn('text-sm font-medium', muted && 'font-normal text-muted-foreground')}>{children}</div>
    </div>
  )
}

export function DomicilioInfoCard({ domicilio }: { domicilio: DomicilioInfo }) {
  return (
    <Card>
      <CardContent className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Fecha de registro">{formatDate(domicilio.fecha_alta)}</Field>
        <Field label="Tipo de cuota mensual" muted={!domicilio.tipo_cuota}>
          {domicilio.tipo_cuota ?? 'Sin asignar'}
        </Field>
        <Field label="Estatus">
          <StatusBadge status={domicilio.estatus} />
        </Field>
        <Field label="Observaciones" muted={!domicilio.observaciones}>
          {domicilio.observaciones ?? 'Sin observaciones'}
        </Field>
      </CardContent>
    </Card>
  )
}
