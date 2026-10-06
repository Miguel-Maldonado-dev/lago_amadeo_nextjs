'use client'

import { useMemo, useState } from 'react'
import { AlertCircle, CircleDollarSign, FileText } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { FilterBar } from '@/components/filter-bar'
import type { MetricCardProps } from '@/components/metric-card'
import { MetricGroup } from '@/components/metric-group'
import { Card } from '@/components/ui/card'
import { formatMoney } from '@/lib/format'
import { formatPercent } from '@/lib/percent'
import type { CuotaInfo } from '../queries'
import { cuotasMetrics } from './cuotas-metrics'
import { CuotasTable } from './cuotas-table'
import { PeriodoFilter } from './periodo-filter'

export function CuotasView({
  rows,
  anios,
  meses,
  anio,
  mes,
  estatusOptions,
}: {
  rows: CuotaInfo[]
  anios: number[]
  meses: { id: number; name: string }[]
  anio: number
  mes: number
  estatusOptions: string[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [estatus, setEstatus] = useState<string | null>(null)

  const filtradas = useMemo(
    () => (estatus ? rows.filter((r) => r.estatus === estatus) : rows),
    [rows, estatus],
  )
  const m = useMemo(() => cuotasMetrics(filtradas), [filtradas])
  const mesNombre = meses.find((x) => x.id === mes)?.name ?? ''

  function clear() {
    setEstatus(null)
    router.replace(pathname)
  }

  const items: MetricCardProps[] = [
    {
      label: 'Total de registros',
      value: String(m.total),
      icon: FileText,
      tone: 'primary',
      helper: 'del periodo seleccionado',
    },
    {
      label: 'Importe total',
      value: formatMoney(m.importeTotal),
      icon: CircleDollarSign,
      tone: 'success',
      helper: `${mesNombre} ${anio}`,
    },
    {
      label: 'Pendientes',
      value: String(m.pendientes),
      icon: AlertCircle,
      tone: 'danger',
      badge:
        m.pctPendientes !== null
          ? { text: formatPercent(m.pctPendientes), tone: m.pendientes > 0 ? 'danger' : 'neutral' }
          : undefined,
    },
  ]

  return (
    <div className="space-y-6">
      <MetricGroup items={items} />
      <FilterBar onClear={clear}>
        <PeriodoFilter
          anios={anios}
          meses={meses}
          anio={anio}
          mes={mes}
          estatus={estatus}
          estatusOptions={estatusOptions}
          onEstatusChange={setEstatus}
        />
      </FilterBar>
      <Card className="p-0">
        <CuotasTable rows={rows} estatus={estatus} />
      </Card>
    </div>
  )
}
