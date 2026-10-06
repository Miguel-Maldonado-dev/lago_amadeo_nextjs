import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/page-header'
import { AddUserDialog } from '@/features/usuarios/components/add-user-dialog'
import { UsuariosView } from '@/features/usuarios/components/usuarios-view'
import { listRoles, listUsuarios } from '@/features/usuarios/queries'
import { getCurrentUser } from '@/lib/auth/current-user'
import { AuthorizationError, requireRole } from '@/lib/auth/require-role'
import { ROLES } from '@/lib/constants'
import { createClient } from '@/lib/supabase/server'

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

export default async function UsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string | string[] }>
}) {
  try {
    await requireRole(ROLES.ADMINISTRADOR)
  } catch (e) {
    if (e instanceof AuthorizationError) notFound()
    throw e
  }

  const sp = await searchParams
  const estado = first(sp.estado) === 'inactivos' ? 'inactivos' : 'activos'

  const supabase = await createClient()
  const [user, rows, roles] = await Promise.all([
    getCurrentUser(),
    listUsuarios(supabase, estado === 'activos'),
    listRoles(supabase),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuarios"
        description="Gestiona los usuarios del sistema Lago Amadeo."
        breadcrumbs={[{ label: 'Usuarios' }]}
        actions={<AddUserDialog roles={roles} />}
      />
      <UsuariosView rows={rows} roles={roles} currentUserId={user?.id ?? ''} estado={estado} />
    </div>
  )
}
