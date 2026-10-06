'use client'

import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown, Calendar, FileText, Landmark } from 'lucide-react'
import { FilterBar } from '@/components/filter-bar'
import { LabeledSelect } from '@/components/labeled-select'
import { MetricStrip } from '@/components/metric-strip'
import { SearchInput } from '@/components/search-input'
import { Card } from '@/components/ui/card'
import { TIPO_MOVIMIENTO } from '@/lib/constants'
import { formatMoney } from '@/lib/format'
import { MESES } from '@/lib/months'
import type { Views } from '@/lib/supabase/types'
import { useDebouncedValue } from '@/lib/use-debounced-value'
import { aniosDisponibles, filterMovimientos, movimientosMetrics } from './movimientos-filters'
import { MovimientosTable } from './movimientos-table'

const MES_OPTIONS = MESES.map((n, i) => ({ value: String(i + 1), label: n }))
const TIPO_OPTIONS = [
  { value: String(TIPO_MOVIMIENTO.INGRESO), label: 'Ingreso' },
  { value: String(TIPO_MOVIMIENTO.EGRESO), label: 'Egreso' },
]

export function MovimientosView({ rows, saldo }: { rows: Views<'movimientos_info'>[]; saldo: number | null }) {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query, 300)
  const [anio, setAnio] = useState<number | null>(null)
  const [mes, setMes] = useState<number | null>(null)
  const [tipo, setTipo] = useState<number | null>(null)

  const anioOptions = useMemo(
    () => aniosDisponibles(rows).map((a) => ({ value: String(a), label: String(a) })),
    [rows],
  )
  const filtradas = useMemo(
    () => filterMovimientos(rows, { query: debouncedQuery, anio, mes, tipo }),
    [rows, debouncedQuery, anio, mes, tipo],
  )
  const m = useMemo(() => movimientosMetrics(filtradas), [filtradas])

  return (
    <div className="space-y-6">
      <MetricStrip
        featured={{ label: 'Saldo actual', value: formatMoney(saldo), icon: Landmark, tone: 'primary' }}
        items={[
          { label: 'Ingresos del conjunto', value: formatMoney(m.ingresos), icon: ArrowUp, tone: 'success' },
          { label: 'Egresos del conjunto', value: formatMoney(m.egresos), icon: ArrowDown, tone: 'danger' },
          { label: 'Total de movimientos', value: String(m.total), icon: FileText, tone: 'neutral' },
        ]}
      />
      <FilterBar
        onClear={() => {
          setQuery('')
          setAnio(null)
          setMes(null)
          setTipo(null)
        }}
      >
        <SearchInput
          id="mov-q"
          value={query}
          onChange={setQuery}
          placeholder="Buscar por referencia o descripción..."
        />
        <LabeledSelect
          id="mov-anio"
          label="Año"
          icon={Calendar}
          allLabel="Todos"
          value={anio === null ? null : String(anio)}
          onChange={(v) => setAnio(v === null ? null : Number(v))}
          options={anioOptions}
        />
        <LabeledSelect
          id="mov-mes"
          label="Mes"
          icon={Calendar}
          allLabel="Todos"
          value={mes === null ? null : String(mes)}
          onChange={(v) => setMes(v === null ? null : Number(v))}
          options={MES_OPTIONS}
        />
        <LabeledSelect
          id="mov-tipo"
          label="Tipo"
          icon={ArrowUpDown}
          allLabel="Todos"
          value={tipo === null ? null : String(tipo)}
          onChange={(v) => setTipo(v === null ? null : Number(v))}
          options={TIPO_OPTIONS}
        />
      </FilterBar>
      <Card className="p-0">
        <MovimientosTable rows={filtradas} />
      </Card>
    </div>
  )
}
