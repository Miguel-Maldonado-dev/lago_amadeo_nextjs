'use client'

import { DataTable, type Column } from '@/components/data-table'
import { CopyButton } from '@/components/copy-button'
import { Money } from '@/components/money'
import { formatDate } from '@/lib/dates'
import type { PagoInfo } from '../queries'
import { ReciboButton } from './recibo-button'

const columns: Column<PagoInfo>[] = [
  {
    key: 'referencia',
    header: 'Referencia',
    cell: (r) =>
      r.referencia ? (
        <div className="flex items-center gap-1">
          <span title={r.referencia} className="font-mono text-[13px]">
            {r.referencia.slice(0, 8)}
            {r.referencia.length > 8 ? '…' : null}
          </span>
          <CopyButton value={r.referencia} />
        </div>
      ) : (
        '—'
      ),
  },
  { key: 'concepto', header: 'Concepto', cell: (r) => r.concepto, sortValue: (r) => r.concepto ?? '' },
  { key: 'direccion', header: 'Domicilio', cell: (r) => r.direccion, sortValue: (r) => r.direccion ?? '' },
  {
    key: 'importe',
    header: 'Importe',
    align: 'right',
    cell: (r) => <Money value={r.importe} />,
    sortValue: (r) => r.importe ?? 0,
  },
  {
    key: 'fecha_pago',
    header: 'Fecha de pago',
    hideBelow: 'md',
    cell: (r) => formatDate(r.fecha_pago),
    sortValue: (r) => r.fecha_pago ?? '',
  },
  { key: 'acciones', header: 'Acciones', align: 'right', cell: (r) => <ReciboButton pagoId={r.id!} /> },
]

export function PagosTable({ rows }: { rows: PagoInfo[] }) {
  return (
    <DataTable
      columns={columns}
      rows={rows}
      getRowKey={(r) => r.id!}
      entityLabel="pagos"
      emptyTitle="Sin pagos"
      emptyDescription="Aún no hay pagos registrados."
    />
  )
}
