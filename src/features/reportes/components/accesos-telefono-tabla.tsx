'use client'

import { Card } from '@/components/ui/card'
import { DataTable, type Column } from '@/components/data-table'
import type { Views } from '@/lib/supabase/types'

type Row = Views<'accesos_telefono_info'>

const columns: Column<Row>[] = [
  {
    key: 'direccion',
    header: 'Domicilio',
    cell: (r) => r.direccion ?? '—',
    sortValue: (r) => r.direccion ?? '',
  },
  { key: 'telefono1', header: 'Teléfono 1', cell: (r) => r.telefono_1 ?? '—' },
  {
    key: 'telefono2',
    header: 'Teléfono 2',
    hideBelow: 'md',
    cell: (r) => r.telefono_2 ?? '—',
  },
]

export function AccesosTelefonoTabla({ rows }: { rows: Row[] }) {
  return (
    <Card className="p-0">
      <DataTable columns={columns} rows={rows} getRowKey={(r) => r.cuota_id!} entityLabel="domicilios" />
    </Card>
  )
}
