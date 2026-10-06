'use client'

import { useMemo } from 'react'
import { DataTable, type Column } from '@/components/data-table'
import { Money } from '@/components/money'
import { StatusBadge } from '@/components/status-badge'
import type { CuotaInfo } from '../queries'

const columns: Column<CuotaInfo>[] = [
  {
    key: 'direccion',
    header: 'Dirección',
    cell: (r) => <span className="font-medium">{r.direccion ?? '—'}</span>,
    sortValue: (r) => r.direccion ?? '',
  },
  {
    key: 'periodo',
    header: 'Periodo',
    cell: (r) => r.periodo ?? '—',
    sortValue: (r) => (r.anio ?? 0) * 100 + (r.mes ?? 0),
  },
  { key: 'concepto', header: 'Concepto', cell: (r) => r.concepto ?? '—', hideBelow: 'md' },
  {
    key: 'importe',
    header: 'Importe',
    align: 'right',
    cell: (r) => <Money value={r.importe_cuota} />,
    sortValue: (r) => r.importe_cuota ?? 0,
  },
  {
    key: 'vencimiento',
    header: 'Vencimiento',
    cell: (r) => r.fecha_vencimiento_formated ?? '—',
    hideBelow: 'lg',
  },
  {
    key: 'estatus',
    header: 'Estatus',
    cell: (r) => <StatusBadge status={r.estatus} />,
    sortValue: (r) => r.estatus ?? '',
  },
]

export function CuotasTable({ rows, estatus }: { rows: CuotaInfo[]; estatus: string | null }) {
  const filtered = useMemo(() => (estatus ? rows.filter((r) => r.estatus === estatus) : rows), [rows, estatus])
  return (
    <DataTable
      columns={columns}
      rows={filtered}
      getRowKey={(r) => r.id ?? `${r.domicilio_id}-${r.periodo}`}
      entityLabel="cuotas"
      emptyTitle="Sin cuotas"
      emptyDescription="No hay cuotas para el periodo seleccionado."
    />
  )
}
