import { ArrowDown, ArrowUp, type LucideIcon } from 'lucide-react'
import { METRIC_TONE_CLASSES, type MetricTone } from '@/components/metric-card'
import { Card } from '@/components/ui/card'
import { formatMoney } from '@/lib/format'
import { normalize } from '@/lib/search'
import { cn } from '@/lib/utils'
import { mesesDelResumen, type Resumen } from './dashboard-metrics'

function Cifra({
  label,
  value,
  icon: Icon,
  tone,
  className,
}: {
  label: string
  value: number
  icon: LucideIcon
  tone: MetricTone
  className?: string
}) {
  return (
    <div className={cn('flex min-w-0 items-center gap-3', className)}>
      <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-full', METRIC_TONE_CLASSES[tone])}>
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-[13px] text-muted-foreground">{label}</p>
        <p className="whitespace-nowrap text-lg font-semibold leading-6 tabular-nums">{formatMoney(value)}</p>
      </div>
    </div>
  )
}

export function ResumenMensual({ title, ingresos, egresos }: { title: string; ingresos: number; egresos: number }) {
  const headingId = `resumen-${normalize(title).replace(/\s+/g, '-')}`
  return (
    <Card role="region" aria-labelledby={headingId} className="gap-3 p-5">
      <h2 id={headingId} className="text-sm font-semibold">
        {title}
      </h2>
      <div className="grid grid-cols-2 divide-x divide-border">
        <Cifra label="Ingresos" value={ingresos} icon={ArrowUp} tone="success" className="pr-4" />
        <Cifra label="Egresos" value={egresos} icon={ArrowDown} tone="danger" className="pl-4" />
      </div>
    </Card>
  )
}

export function ResumenMeses({ resumen }: { resumen: Resumen }) {
  const { mesActual, mesAnterior } = mesesDelResumen(resumen)
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <ResumenMensual title="Resumen del mes actual" {...mesActual} />
      <ResumenMensual title="Resumen del mes anterior" {...mesAnterior} />
    </div>
  )
}
