'use server'

import { revalidatePath } from 'next/cache'
import { fail, ok, type ActionResult } from '@/lib/action-result'
import { runAction } from '@/lib/auth/run-action'
import { ROLES } from '@/lib/constants'
import { invokeEdgeFunction } from '@/lib/supabase/functions'
import { createClient } from '@/lib/supabase/server'
import { MSG_NO_AUTO_CAMBIAR_ROL, MSG_NO_AUTO_DESACTIVAR, MSG_USUARIO_ERROR_PREFIX } from './messages'
import {
  editarUsuarioSchema,
  nuevoUsuarioSchema,
  type EditarUsuarioInput,
  type NuevoUsuarioInput,
} from './schemas'

export async function crearUsuario(input: NuevoUsuarioInput): Promise<ActionResult> {
  return runAction([ROLES.ADMINISTRADOR], async () => {
    const parsed = nuevoUsuarioSchema.safeParse(input)
    if (!parsed.success) return fail(parsed.error.issues[0].message)
    const { userName, email, password, roleId } = parsed.data

    const supabase = await createClient()
    const res = await invokeEdgeFunction(supabase, 'create-user', {
      method: 'POST',
      body: { email, password, user_name: userName, role_id: roleId },
    })
    let json: { success?: unknown; error?: unknown }
    try {
      json = await res.json()
    } catch {
      json = {}
    }
    if (!(res.ok && json?.success === true)) {
      const detalle = typeof json?.error === 'string' && json.error ? json.error : 'error desconocido'
      return fail(MSG_USUARIO_ERROR_PREFIX + detalle)
    }

    revalidatePath('/usuarios')
    return ok(undefined)
  })
}

export async function actualizarUsuario(id: string, input: EditarUsuarioInput): Promise<ActionResult> {
  return runAction([ROLES.ADMINISTRADOR], async (user) => {
    const parsed = editarUsuarioSchema.safeParse(input)
    if (!parsed.success) return fail(parsed.error.issues[0].message)
    const { userName, roleId } = parsed.data
    if (id === user.id && roleId !== user.roleId) return fail(MSG_NO_AUTO_CAMBIAR_ROL)

    const supabase = await createClient()
    const { error: userError } = await supabase.from('users').update({ user_name: userName }).eq('id', id)
    if (userError) throw new Error(userError.message)
    const { error: roleError } = await supabase.from('user_roles').update({ role_id: roleId }).eq('user_id', id)
    if (roleError) throw new Error(roleError.message)

    revalidatePath('/usuarios')
    return ok(undefined)
  })
}

export async function cambiarEstadoUsuario(id: string, isActive: boolean): Promise<ActionResult> {
  return runAction([ROLES.ADMINISTRADOR], async (user) => {
    if (!isActive && id === user.id) return fail(MSG_NO_AUTO_DESACTIVAR)

    const supabase = await createClient()
    const { error } = await supabase.from('users').update({ is_active: isActive }).eq('id', id)
    if (error) throw new Error(error.message)

    revalidatePath('/usuarios')
    return ok(undefined)
  })
}
