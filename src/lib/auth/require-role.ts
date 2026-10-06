import { getCurrentUser, type CurrentUser } from '@/lib/auth/current-user'
import type { RoleName } from '@/lib/constants'

export class AuthorizationError extends Error {
  readonly code: 'NO_SESSION' | 'FORBIDDEN'

  constructor(code: 'NO_SESSION' | 'FORBIDDEN') {
    super(code === 'NO_SESSION' ? 'Sin sesión o usuario inactivo.' : 'Rol no autorizado.')
    this.name = 'AuthorizationError'
    this.code = code
  }
}

export function hasRole(user: CurrentUser | null, roles: RoleName[]): boolean {
  return user?.roleName != null && roles.includes(user.roleName)
}

/** Exige una sesión con usuario activo; lanza `AuthorizationError('NO_SESSION')` si no la hay. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser()
  if (!user || !user.isActive) throw new AuthorizationError('NO_SESSION')
  return user
}

/** Exige un usuario activo con alguno de los roles; lanza `AuthorizationError('FORBIDDEN')` si no. */
export async function requireRole(...roles: RoleName[]): Promise<CurrentUser> {
  const user = await requireUser()
  if (!hasRole(user, roles)) throw new AuthorizationError('FORBIDDEN')
  return user
}
