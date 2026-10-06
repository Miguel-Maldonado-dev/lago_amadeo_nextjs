'use client'

import { FileText } from 'lucide-react'
import { DataTable, type Column } from '@/components/data-table'
import { Money } from '@/components/money'
import { ReciboButton } from '@/features/pagos/components/recibo-button'
import { formatDate } from '@/lib/dates'
import type { Views } from '@/lib/supabase/types'

type Row = Views<'reporte_pagos_detalle'>

const columns: Column<Row>[] = [
  {
    key: 'referencia',
    header: 'Referencia',
    cell: (r) =>
      r.referencia ? (
        <span className="flex items-center gap-2 font-mono text-[13px]">
          <FileText className="size-4 text-muted-foreground" />
          {r.referencia}
        </span>
      ) : (
        '—'
      ),
    sortValue: (r) => r.referencia ?? '',
  },
  {
    key: 'usuario',
    header: 'Usuario',
    cell: (r) => r.nombre_usuario ?? '—',
    sortValue: (r) => r.nombre_usuario ?? '',
  },
  {
    key: 'metodo',
    header: 'Método de pago',
    hideBelow: 'md',
    cell: (r) => r.metodo_pago_nombre ?? '—',
  },
  {
    key: 'importe',
    header: 'Importe',
    align: 'right',
    cell: (r) => <Money value={r.importe} variant={(r.importe ?? 0) > 0 ? 'ingreso' : undefined} />,
    sortValue: (r) => r.importe ?? 0,
  },
  {
    key: 'fecha',
    header: 'Fecha de pago',
    hideBelow: 'lg',
    cell: (r) => (r.fecha_pago ? formatDate(r.fecha_pago) : '—'),
    sortValue: (r) => r.fecha_pago ?? '',
  },
  {
    key: 'acciones',
    header: 'Acciones',
    align: 'right',
    cell: (r) => <ReciboButton pagoId={r.id!} />,
  },
]

export function PagosUsuarioTabla({ rows }: { rows: Row[] }) {
  return (
    <DataTable
      columns={columns}
      rows={rows}
      getRowKey={(r) => r.id!}
      entityLabel="pagos"
      emptyTitle="Sin pagos"
      emptyDescription="No hay pagos para los filtros seleccionados."
    />
  )
}
