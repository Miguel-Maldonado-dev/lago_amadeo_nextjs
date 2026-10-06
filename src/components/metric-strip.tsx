import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { METRIC_TONE_CLASSES, type MetricTone } from '@/components/metric-card'

type StripItem = { label: string; value: string; icon: LucideIcon; tone?: MetricTone }

export function MetricStrip({ featured, items }: { featured: StripItem; items: StripItem[] }) {
  const FeaturedIcon = featured.icon
  return (
    <Card className="flex flex-col divide-y divide-border lg:flex-row lg:divide-x lg:divide-y-0">
      <div className="flex items-center gap-4 p-6 lg:flex-1">
        <div
          className={`flex size-14 shrink-0 items-center justify-center rounded-full ${METRIC_TONE_CLASSES[featured.tone ?? 'primary']}`}
        >
          <FeaturedIcon className="size-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-muted-foreground">{featured.label}</p>
          <p className="text-[32px] font-bold leading-10 text-primary tabular-nums">{featured.value}</p>
        </div>
      </div>
      {items.map(({ label, value, icon: Icon, tone = 'neutral' }) => (
        <div key={label} className="flex items-center gap-3 p-6 lg:flex-1">
          <div
            className={`flex size-10 shrink-0 items-center justify-center rounded-full [&>svg]:size-5 ${METRIC_TONE_CLASSES[tone]}`}
          >
            <Icon />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] text-muted-foreground">{label}</p>
            <p className="text-lg font-semibold tabular-nums">{value}</p>
          </div>
        </div>
      ))}
    </Card>
  )
}
