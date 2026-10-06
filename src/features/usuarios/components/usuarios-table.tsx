'use client'

import { DataTable, type Column } from '@/components/data-table'
import { PersonCell } from '@/components/person-cell'
import { StatusBadge } from '@/components/status-badge'
import type { Tables, Views } from '@/lib/supabase/types'
import { UsuarioActions } from './usuario-actions'

type Row = Views<'users_info'>

export function UsuariosTable({
  rows,
  roles,
  currentUserId,
}: {
  rows: Row[]
  roles: Tables<'roles'>[]
  currentUserId: string
}) {
  const columns: Column<Row>[] = [
    {
      key: 'user_name',
      header: 'Nombre',
      cell: (r) => (
        <div className="flex flex-col">
          <PersonCell name={r.user_name} />
          {r.email ? <span className="pl-11 text-xs text-muted-foreground md:hidden">{r.email}</span> : null}
        </div>
      ),
      sortValue: (r) => r.user_name ?? '',
    },
    {
      key: 'email',
      header: 'Email',
      hideBelow: 'md',
      cell: (r) => r.email ?? '—',
      sortValue: (r) => r.email ?? '',
    },
    {
      key: 'role_name',
      header: 'Rol',
      cell: (r) => (r.role_name ? <StatusBadge status={r.role_name} /> : '—'),
      sortValue: (r) => r.role_name ?? '',
    },
    {
      key: 'estatus',
      header: 'Estatus',
      cell: (r) => <StatusBadge status={r.is_active ? 'Activo' : 'Inactivo'} />,
    },
    {
      key: 'acciones',
      header: 'Acciones',
      align: 'right',
      cell: (r) => <UsuarioActions usuario={r} roles={roles} currentUserId={currentUserId} />,
    },
  ]
  return (
    <DataTable
      columns={columns}
      rows={rows}
      entityLabel="usuarios"
      getRowKey={(r) => r.id ?? r.email ?? ''}
      emptyTitle="Sin usuarios"
      emptyDescription="No hay usuarios para mostrar."
    />
  )
}
