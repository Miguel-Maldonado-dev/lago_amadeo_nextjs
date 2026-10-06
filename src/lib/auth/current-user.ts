import { cache } from 'react'
import { ROLES, type RoleName } from '@/lib/constants'
import { createClient } from '@/lib/supabase/server'

export type CurrentUser = {
  id: string
  email: string
  userName: string
  roleName: RoleName | null
  roleId: number | null
  isActive: boolean
}

const ROLE_NAMES: readonly string[] = Object.values(ROLES)

function isRoleName(value: string | null): value is RoleName {
  return value !== null && ROLE_NAMES.includes(value)
}

/** Usuario autenticado con su fila de `users_info`; una sola lectura por petición gracias a `cache`. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getClaims()
  const claims = auth?.claims
  if (!claims) return null

  const { data: row, error } = await supabase
    .from('users_info')
    .select('*')
    .eq('id', claims.sub)
    .maybeSingle()
  if (error) throw new Error(`No se pudo leer users_info: ${error.message}`)

  const email = claims.email ?? row?.email ?? ''
  if (!row) {
    return { id: claims.sub, email, userName: '', roleName: null, roleId: null, isActive: false }
  }
  return {
    id: claims.sub,
    email,
    userName: row.user_name ?? '',
    roleName: isRoleName(row.role_name) ? row.role_name : null,
    roleId: row.role_id,
    isActive: row.is_active === true,
  }
})
