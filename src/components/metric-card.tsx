import type { LucideIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export type MetricTone = 'primary' | 'success' | 'danger' | 'info' | 'neutral'

export type MetricDensity = 'default' | 'compact'

export const METRIC_TONE_CLASSES: Record<MetricTone, string> = {
  primary: 'bg-primary-light text-primary',
  success: 'bg-success-light text-success',
  danger: 'bg-danger-light text-danger',
  info: 'bg-info-light text-info',
  neutral: 'bg-muted text-secondary-foreground',
}

const DENSITY_CLASSES: Record<
  MetricDensity,
  { card: string; body: string; icon: string; glyph: string; value: string }
> = {
  default: {
    card: 'flex-row items-center gap-4 p-6',
    body: 'contents',
    icon: 'size-14',
    glyph: 'size-6',
    value: 'text-[28px] leading-8',
  },
  // Relleno parejo. La tarjeta es contenedor: con poco ancho el icono queda arriba del texto
  // y, desde ~184 px de interior (icono + título o importe completos), se coloca a la izquierda.
  compact: {
    card: '@container gap-0 p-5',
    body: 'flex flex-col gap-3 @min-[11.5rem]:flex-row @min-[11.5rem]:items-center',
    icon: 'size-10',
    glyph: 'size-5',
    value: 'text-xl leading-7',
  },
}

export type MetricCardProps = {
  label: string
  value: string
  helper?: string
  icon: LucideIcon
  tone?: MetricTone
  badge?: { text: string; tone: 'success' | 'danger' | 'neutral' }
  density?: MetricDensity
}

export function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = 'primary',
  badge,
  density = 'default',
}: MetricCardProps) {
  const d = DENSITY_CLASSES[density]
  return (
    <Card className={cn('flex', d.card)}>
      <div data-slot="metric-body" className={d.body}>
        <div
          data-slot="metric-icon"
          className={cn('flex shrink-0 items-center justify-center rounded-full', d.icon, METRIC_TONE_CLASSES[tone])}
        >
          <Icon className={d.glyph} aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] text-muted-foreground" title={label}>
            {label}
          </p>
          <p className={cn('whitespace-nowrap font-bold tabular-nums', d.value)}>{value}</p>
          {helper ? <p className="text-[13px] text-muted-foreground">{helper}</p> : null}
        </div>
        {badge ? (
          <Badge variant={badge.tone} className="shrink-0">
            {badge.text}
          </Badge>
        ) : null}
      </div>
    </Card>
  )
}
