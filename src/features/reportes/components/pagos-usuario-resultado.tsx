import { EmptyState } from '@/components/empty-state'
import { MetricCard } from '@/components/metric-card'
import { Card } from '@/components/ui/card'
import { formatMoney } from '@/lib/format'
import type { Views } from '@/lib/supabase/types'
import { Receipt } from 'lucide-react'
import { totalImporte } from '../totals'
import { PagosUsuarioTabla } from './pagos-usuario-tabla'

export function PagosUsuarioResultado({ rows }: { rows: Views<'reporte_pagos_detalle'>[] }) {
  if (rows.length === 0) return <EmptyState />
  return (
    <div className="space-y-4">
      <div className="max-w-sm">
        <MetricCard
          label="Total"
          value={formatMoney(totalImporte(rows))}
          helper="en el periodo seleccionado"
          icon={Receipt}
          tone="primary"
        />
      </div>
      <Card className="p-0">
        <PagosUsuarioTabla rows={rows} />
      </Card>
    </div>
  )
}
