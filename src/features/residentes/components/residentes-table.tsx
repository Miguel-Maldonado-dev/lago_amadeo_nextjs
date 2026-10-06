'use client'

import { Check } from 'lucide-react'
import { DataTable, type Column } from '@/components/data-table'
import { PersonCell } from '@/components/person-cell'
import type { Views } from '@/lib/supabase/types'

type Row = Views<'residentes_info'>

const columns: Column<Row>[] = [
  {
    key: 'direccion',
    header: 'Dirección',
    cell: (r) => <span className="font-medium">{r.direccion ?? '—'}</span>,
    sortValue: (r) => r.direccion ?? '',
  },
  {
    key: 'nombre',
    header: 'Residente',
    cell: (r) => <PersonCell name={r.nombre} />,
    sortValue: (r) => r.nombre ?? '',
  },
  { key: 'telefono', header: 'Teléfono', cell: (r) => r.telefono ?? '—' },
  {
    key: 'es_principal',
    header: 'Principal',
    hideBelow: 'md',
    cell: (r) =>
      r.es_principal ? (
        <span
          role="img"
          aria-label="Residente principal"
          className="flex size-6 items-center justify-center rounded-full bg-success-light text-success"
        >
          <Check className="size-4" />
        </span>
      ) : null,
  },
]

export function ResidentesTable({ rows }: { rows: Row[] }) {
  return (
    <DataTable
      columns={columns}
      rows={rows}
      getRowKey={(r) => r.id ?? `${r.domicilio_id}-${r.nombre}`}
      entityLabel="residentes"
      emptyTitle="Sin residentes"
      emptyDescription="No hay residentes para mostrar."
    />
  )
}
