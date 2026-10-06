'use client'

import { useMemo, useState } from 'react'
import { Building2, Calendar, Home, ListFilter } from 'lucide-react'
import { FilterBar } from '@/components/filter-bar'
import { LabeledSelect } from '@/components/labeled-select'
import type { MetricCardProps } from '@/components/metric-card'
import { MetricGroup } from '@/components/metric-group'
import { SearchInput } from '@/components/search-input'
import { Card } from '@/components/ui/card'
import { todayISO } from '@/lib/dates'
import { formatPercent } from '@/lib/percent'
import { useDebouncedValue } from '@/lib/use-debounced-value'
import type { DomicilioInfo } from '../queries'
import { domiciliosMetrics, filterDomicilios, type FechaFiltro } from './domicilios-filters'
import { DomiciliosTable } from './domicilios-table'

const ESTATUS_OPTIONS = [
  { value: 'Al corriente', label: 'Al corriente' },
  { value: 'Moroso', label: 'Moroso' },
]
const FECHA_OPTIONS = [
  { value: 'todas', label: 'Todas las fechas' },
  { value: 'ultimo-mes', label: 'Último mes' },
  { value: 'ultimo-anio', label: 'Último año' },
]

export function DomiciliosView({ rows }: { rows: DomicilioInfo[] }) {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query, 300)
  const [estatus, setEstatus] = useState<string | null>(null)
  const [fecha, setFecha] = useState<FechaFiltro>('todas')
  const today = useMemo(() => todayISO(), [])

  const filtradas = useMemo(
    () => filterDomicilios(rows, { query: debouncedQuery, estatus, fecha, today }),
    [rows, debouncedQuery, estatus, fecha, today],
  )
  const m = useMemo(() => domiciliosMetrics(filtradas), [filtradas])

  const items: MetricCardProps[] = [
    { label: 'Total de unidades', value: String(m.total), icon: Building2, tone: 'primary' },
    {
      label: 'Al corriente',
      value: String(m.alCorriente),
      icon: Home,
      tone: 'success',
      badge: m.pctAlCorriente !== null ? { text: formatPercent(m.pctAlCorriente), tone: 'success' } : undefined,
    },
    {
      label: 'Morosos',
      value: String(m.morosos),
      icon: Home,
      tone: 'danger',
      badge:
        m.pctMorosos !== null
          ? { text: formatPercent(m.pctMorosos), tone: m.morosos > 0 ? 'danger' : 'neutral' }
          : undefined,
    },
  ]

  return (
    <div className="space-y-6">
      <MetricGroup items={items} />
      <FilterBar
        onClear={() => {
          setQuery('')
          setEstatus(null)
          setFecha('todas')
        }}
      >
        <SearchInput id="dom-q" value={query} onChange={setQuery} placeholder="Buscar por dirección o residente..." />
        <LabeledSelect
          id="dom-estatus"
          label="Estatus"
          icon={ListFilter}
          allLabel="Todos los estatus"
          value={estatus}
          onChange={setEstatus}
          options={ESTATUS_OPTIONS}
        />
        <LabeledSelect
          id="dom-fecha"
          label="Fecha de registro"
          icon={Calendar}
          value={fecha}
          onChange={(v) => setFecha((v ?? 'todas') as FechaFiltro)}
          options={FECHA_OPTIONS}
        />
      </FilterBar>
      <Card className="p-0">
        <DomiciliosTable rows={filtradas} />
      </Card>
    </div>
  )
}
