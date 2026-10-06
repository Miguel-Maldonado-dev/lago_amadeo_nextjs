import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { DonutChart } from '@/components/donut-chart'
import { SectionCard } from '@/components/section-card'
import { Button } from '@/components/ui/button'
import type { DomicilioInfo } from '@/features/domicilios/queries'
import { estadoCuotas } from './dashboard-metrics'

export function EstadoCuotas({ rows }: { rows: DomicilioInfo[] }) {
  const e = estadoCuotas(rows)
  return (
    <SectionCard
      title="Estado de cuotas"
      action={
        <Button asChild variant="secondary" size="sm">
          <Link href="/domicilios">
            Ver todas <ArrowRight />
          </Link>
        </Button>
      }
    >
      <DonutChart
        segments={[
          { label: 'Al corriente', value: e.alCorriente, color: 'success' },
          { label: 'Morosos', value: e.morosos, color: 'danger' },
        ]}
        total={e.total}
        centerLabel="Unidades"
        centerValue={String(e.total)}
      />
    </SectionCard>
  )
}
