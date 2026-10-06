import { ArrowDown, ArrowUp, Building2, Wallet } from 'lucide-react'
import { MetricGroup } from '@/components/metric-group'
import { formatMoney } from '@/lib/format'
import { dashboardMetrics, type Resumen } from './dashboard-metrics'

export function ResumenCards({ resumen, totalUnidades }: { resumen: Resumen; totalUnidades: number }) {
  const m = dashboardMetrics(resumen, totalUnidades)
  return (
    <MetricGroup
      columns={4}
      density="compact"
      items={[
        { label: 'Saldo actual', value: formatMoney(m.saldo), icon: Wallet, tone: 'primary' },
        { label: 'Ingresos acumulados', value: formatMoney(m.ingresos), icon: ArrowUp, tone: 'success' },
        { label: 'Egresos acumulados', value: formatMoney(m.egresos), icon: ArrowDown, tone: 'danger' },
        { label: 'Unidades totales', value: String(m.unidades), icon: Building2, tone: 'info' },
      ]}
    />
  )
}
