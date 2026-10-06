'use client'

import Link from 'next/link'
import { Eye } from 'lucide-react'
import { DataTable, type Column } from '@/components/data-table'
import { PersonCell } from '@/components/person-cell'
import { RowActions } from '@/components/row-actions'
import { StatusBadge } from '@/components/status-badge'
import { formatDate } from '@/lib/dates'
import type { DomicilioInfo } from '../queries'

const detalleHref = (id: number) => '/domicilios/' + id

const columns: Column<DomicilioInfo>[] = [
  {
    key: 'direccion',
    header: 'Dirección',
    cell: (r) =>
      r.id == null ? (
        <span className="font-medium">{r.direccion}</span>
      ) : (
        <Link
          href={detalleHref(r.id)}
          className="rounded-sm font-medium outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {r.direccion}
        </Link>
      ),
    sortValue: (r) => r.direccion ?? '',
  },
  {
    key: 'fecha_alta',
    header: 'Fecha de Registro',
    cell: (r) => (r.fecha_alta ? formatDate(r.fecha_alta) : ''),
    sortValue: (r) => r.fecha_alta ?? '',
    hideBelow: 'md',
  },
  {
    key: 'residente',
    header: 'Residente Principal',
    cell: (r) => <PersonCell name={r.residente_principal} />,
    sortValue: (r) => r.residente_principal ?? '',
  },
  {
    key: 'estatus',
    header: 'Estatus',
    cell: (r) => <StatusBadge status={r.estatus} />,
    sortValue: (r) => r.estatus ?? '',
  },
  {
    key: 'acciones',
    header: 'Acciones',
    align: 'right',
    cell: (r) => (
      <RowActions
        label={`Acciones de ${r.direccion ?? 'domicilio'}`}
        items={[{ label: 'Ver detalle', icon: Eye, href: '/domicilios/' + r.id }]}
      />
    ),
  },
]

export function DomiciliosTable({ rows }: { rows: DomicilioInfo[] }) {
  return (
    <DataTable
      columns={columns}
      rows={rows}
      getRowKey={(r) => r.id ?? r.direccion ?? ''}
      rowHref={(r) => (r.id == null ? undefined : detalleHref(r.id))}
      entityLabel="domicilios"
      emptyTitle="Sin domicilios"
      emptyDescription="Registra el primer domicilio con el botón Nuevo Domicilio."
    />
  )
}
