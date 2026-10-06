import { ArrowDown, ArrowUp, Building2, Wallet } from 'lucide-react'
import { MetricGroup } from '@/components/metric-group'
import { formatMoney } from '@/lib/format'
import { dashboardMetrics, trendBadge, type Resumen } from './dashboard-metrics'

function helperFor(badge: unknown) {
  return badge ? 'vs. mes anterior' : 'Sin datos del mes anterior'
}

export function ResumenCards({ resumen, totalUnidades }: { resumen: Resumen; totalUnidades: number }) {
  const m = dashboardMetrics(resumen, totalUnidades)
  const bSaldo = trendBadge(m.varSaldo)
  const bIngresos = trendBadge(m.varIngresos)
  const bEgresos = trendBadge(m.varEgresos, { lowerIsBetter: true })
  return (
    <MetricGroup
      columns={4}
      items={[
        { label: 'Saldo actual', value: formatMoney(m.saldo), icon: Wallet, tone: 'primary', badge: bSaldo, helper: helperFor(bSaldo) },
        { label: 'Ingresos acumulados', value: formatMoney(m.ingresos), icon: ArrowUp, tone: 'success', badge: bIngresos, helper: helperFor(bIngresos) },
        { label: 'Egresos acumulados', value: formatMoney(m.egresos), icon: ArrowDown, tone: 'danger', badge: bEgresos, helper: helperFor(bEgresos) },
        { label: 'Unidades totales', value: String(m.unidades), icon: Building2, tone: 'info', helper: 'domicilios registrados' },
      ]}
    />
  )
}
