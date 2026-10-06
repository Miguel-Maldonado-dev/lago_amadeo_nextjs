'use client'

import { Card } from '@/components/ui/card'
import { DataTable, type Column } from '@/components/data-table'
import type { Views } from '@/lib/supabase/types'

type Row = Views<'accesos_tarjeta_info'>

const columns: Column<Row>[] = [
  {
    key: 'direccion',
    header: 'Domicilio',
    cell: (r) => r.direccion ?? '—',
    sortValue: (r) => r.direccion ?? '',
  },
  { key: 'tarjeta1', header: 'Tarjeta 1', cell: (r) => r.tarjeta_1 ?? '—' },
  {
    key: 'tarjeta2',
    header: 'Tarjeta 2',
    hideBelow: 'md',
    cell: (r) => r.tarjeta_2 ?? '—',
  },
  {
    key: 'tarjeta3',
    header: 'Tarjeta 3',
    hideBelow: 'md',
    cell: (r) => r.tarjeta_3 ?? '—',
  },
]

export function AccesosTarjetaTabla({ rows }: { rows: Row[] }) {
  return (
    <Card className="p-0">
      <DataTable columns={columns} rows={rows} getRowKey={(r) => r.cuota_id!} entityLabel="domicilios" />
    </Card>
  )
}
