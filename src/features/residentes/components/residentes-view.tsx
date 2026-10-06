'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FilterBar } from '@/components/filter-bar'
import { SearchInput } from '@/components/search-input'
import { SearchableSelect } from '@/components/searchable-select'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { matches } from '@/lib/search'
import type { Views } from '@/lib/supabase/types'
import { useDebouncedValue } from '@/lib/use-debounced-value'
import { ResidentesTable } from './residentes-table'

type Row = Views<'residentes_info'>

export function ResidentesView({
  rows,
  domicilios,
  domicilioId,
}: {
  rows: Row[]
  domicilios: { id: number; direccion: string }[]
  domicilioId?: number
}) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query, 300)
  const filtradas = useMemo(
    () => rows.filter((r) => matches([r.nombre, r.telefono, r.direccion], debouncedQuery)),
    [rows, debouncedQuery],
  )
  const options = useMemo(
    () => domicilios.map((o) => ({ value: String(o.id), label: o.direccion })),
    [domicilios],
  )

  return (
    <div className="space-y-6">
      <FilterBar
        onClear={() => {
          setQuery('')
          if (domicilioId !== undefined) router.replace('/residentes')
        }}
      >
        <SearchInput
          id="res-q"
          value={query}
          onChange={setQuery}
          placeholder="Buscar por nombre, teléfono o domicilio..."
        />
        <div className="flex min-w-[240px] flex-col gap-1.5">
          <Label id="res-dom-label" htmlFor="res-dom" className="text-xs font-medium text-muted-foreground">
            Domicilio
          </Label>
          <SearchableSelect
            id="res-dom"
            aria-labelledby="res-dom-label"
            options={options}
            value={domicilioId === undefined ? null : String(domicilioId)}
            onChange={(v) => router.replace(v ? `/residentes?domicilio=${v}` : '/residentes')}
            placeholder="Seleccionar domicilio..."
            allowClear
          />
        </div>
      </FilterBar>
      <Card className="p-0">
        <ResidentesTable rows={filtradas} />
      </Card>
    </div>
  )
}
