import { unstable_rethrow } from 'next/navigation'
import { fail, type ActionResult } from '@/lib/action-result'
import type { CurrentUser } from '@/lib/auth/current-user'
import { AuthorizationError, requireRole, requireUser } from '@/lib/auth/require-role'
import type { RoleName } from '@/lib/constants'

export const MSG_SESION = 'Tu sesión expiró. Inicia sesión de nuevo.'
export const MSG_NO_PERMISO = 'No tienes permiso para realizar esta acción.'
export const MSG_ERROR = 'Ocurrió un error inesperado. Intenta de nuevo.'

/**
 * Envuelve una Server Action: exige sesión (y rol si `roles` no es `null`) y nunca lanza;
 * los fallos se devuelven como `ActionResult` con un mensaje para el usuario.
 */
export async function runAction<T>(
  roles: RoleName[] | null,
  fn: (user: CurrentUser) => Promise<ActionResult<T>>,
): Promise<ActionResult<T>> {
  try {
    const user = roles === null ? await requireUser() : await requireRole(...roles)
    return await fn(user)
  } catch (error) {
    // redirect()/notFound() de Next.js lanzan para controlar el flujo; deben propagarse.
    unstable_rethrow(error)
    if (error instanceof AuthorizationError) {
      return fail(error.code === 'NO_SESSION' ? MSG_SESION : MSG_NO_PERMISO)
    }
    console.error(error)
    return fail(MSG_ERROR)
  }
}
