'use client'

import { DataTable, type Column } from '@/components/data-table'
import { Money } from '@/components/money'
import { TIPO_MOVIMIENTO } from '@/lib/constants'
import { formatDate } from '@/lib/dates'
import type { Views } from '@/lib/supabase/types'
import { TipoMovimientoCell } from './tipo-movimiento-cell'

type Movimiento = Views<'movimientos_info'>

const columns: Column<Movimiento>[] = [
  {
    key: 'tipo',
    header: 'Tipo',
    cell: (r) => <TipoMovimientoCell tipoId={r.tipo_id} nombre={r.tipo_movimiento} />,
  },
  {
    key: 'descripcion',
    header: 'Descripción',
    cell: (r) => {
      const d = r.descripcion ?? ''
      return (
        <span title={d}>{d.length > 60 ? `${d.slice(0, 60)}…` : d}</span>
      )
    },
    sortValue: (r) => r.descripcion ?? '',
  },
  {
    key: 'importe',
    header: 'Importe',
    align: 'right',
    cell: (r) => <Money value={r.importe} variant={r.tipo_id === TIPO_MOVIMIENTO.EGRESO ? 'egreso' : 'ingreso'} />,
    sortValue: (r) => r.importe ?? 0,
  },
  {
    key: 'fecha',
    header: 'Fecha',
    hideBelow: 'md',
    cell: (r) => formatDate(r.fecha_movimiento),
    sortValue: (r) => r.fecha_movimiento ?? '',
  },
]

export function MovimientosTable({ rows }: { rows: Movimiento[] }) {
  return (
    <DataTable
      columns={columns}
      rows={rows}
      getRowKey={(r) => r.id!}
      entityLabel="movimientos"
      emptyTitle="Sin movimientos"
      emptyDescription="Aún no hay movimientos registrados."
    />
  )
}
