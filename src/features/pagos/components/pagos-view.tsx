'use client'

import { useMemo, useState } from 'react'
import { Calendar, CreditCard, DollarSign, FileText, Tag } from 'lucide-react'
import { FilterBar } from '@/components/filter-bar'
import { LabeledSelect } from '@/components/labeled-select'
import type { MetricCardProps } from '@/components/metric-card'
import { MetricGroup } from '@/components/metric-group'
import { SearchInput } from '@/components/search-input'
import { Card } from '@/components/ui/card'
import { formatMoney } from '@/lib/format'
import { MESES } from '@/lib/months'
import { useDebouncedValue } from '@/lib/use-debounced-value'
import type { PagoInfo } from '../queries'
import { aniosDisponibles, conceptosDisponibles, filterPagos, pagosMetrics } from './pagos-filters'
import { PagosTable } from './pagos-table'

const MES_OPTIONS = MESES.map((n, i) => ({ value: String(i + 1), label: n }))

export function PagosView({ rows }: { rows: PagoInfo[] }) {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query, 300)
  const [anio, setAnio] = useState<number | null>(null)
  const [mes, setMes] = useState<number | null>(null)
  const [concepto, setConcepto] = useState<string | null>(null)

  const anios = useMemo(() => aniosDisponibles(rows), [rows])
  const conceptos = useMemo(() => conceptosDisponibles(rows), [rows])
  const anioOptions = useMemo(() => anios.map((a) => ({ value: String(a), label: String(a) })), [anios])
  const conceptoOptions = useMemo(() => conceptos.map((c) => ({ value: c, label: c })), [conceptos])
  const filtradas = useMemo(
    () => filterPagos(rows, { query: debouncedQuery, anio, mes, concepto }),
    [rows, debouncedQuery, anio, mes, concepto],
  )
  const m = useMemo(() => pagosMetrics(filtradas), [filtradas])

  const helper = 'del conjunto filtrado'
  const items: MetricCardProps[] = [
    { label: 'Total de pagos', value: String(m.total), icon: CreditCard, tone: 'primary', helper },
    { label: 'Importe recaudado', value: formatMoney(m.importe), icon: DollarSign, tone: 'success', helper },
    { label: 'Pagos extra', value: String(m.extras), icon: FileText, tone: 'info', helper },
  ]

  return (
    <div className="space-y-6">
      <MetricGroup items={items} />
      <FilterBar
        onClear={() => {
          setQuery('')
          setAnio(null)
          setMes(null)
          setConcepto(null)
        }}
      >
        <SearchInput
          id="pagos-q"
          value={query}
          onChange={setQuery}
          placeholder="Buscar por referencia, concepto o domicilio..."
        />
        <LabeledSelect
          id="pagos-anio"
          label="Año"
          icon={Calendar}
          allLabel="Todos"
          value={anio === null ? null : String(anio)}
          onChange={(v) => setAnio(v === null ? null : Number(v))}
          options={anioOptions}
        />
        <LabeledSelect
          id="pagos-mes"
          label="Mes"
          icon={Calendar}
          allLabel="Todos"
          value={mes === null ? null : String(mes)}
          onChange={(v) => setMes(v === null ? null : Number(v))}
          options={MES_OPTIONS}
        />
        <LabeledSelect
          id="pagos-concepto"
          label="Concepto"
          icon={Tag}
          allLabel="Todos los conceptos"
          value={concepto}
          onChange={setConcepto}
          options={conceptoOptions}
        />
      </FilterBar>
      <Card className="p-0">
        <PagosTable rows={filtradas} />
      </Card>
    </div>
  )
}
