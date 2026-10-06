import type { LucideIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

export type MetricTone = 'primary' | 'success' | 'danger' | 'info' | 'neutral'

export const METRIC_TONE_CLASSES: Record<MetricTone, string> = {
  primary: 'bg-primary-light text-primary',
  success: 'bg-success-light text-success',
  danger: 'bg-danger-light text-danger',
  info: 'bg-info-light text-info',
  neutral: 'bg-muted text-secondary-foreground',
}

export type MetricCardProps = {
  label: string
  value: string
  helper?: string
  icon: LucideIcon
  tone?: MetricTone
  badge?: { text: string; tone: 'success' | 'danger' | 'neutral' }
}

export function MetricCard({ label, value, helper, icon: Icon, tone = 'primary', badge }: MetricCardProps) {
  return (
    <Card className="flex flex-row items-center gap-4 p-6">
      <div
        className={`flex size-14 shrink-0 items-center justify-center rounded-full ${METRIC_TONE_CLASSES[tone]}`}
      >
        <Icon className="size-6" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] text-muted-foreground">{label}</p>
        <p className="text-[28px] font-bold leading-8 tabular-nums">{value}</p>
        {helper && <p className="text-[13px] text-muted-foreground">{helper}</p>}
      </div>
      {badge && (
        <Badge variant={badge.tone} className="shrink-0">
          {badge.text}
        </Badge>
      )}
    </Card>
  )
}
