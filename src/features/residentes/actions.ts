'use server'

import { revalidatePath } from 'next/cache'
import { fail, ok, type ActionResult } from '@/lib/action-result'
import { runAction } from '@/lib/auth/run-action'
import { createClient } from '@/lib/supabase/server'
import { residenteSchema, type ResidenteInput } from './schemas'

function revalidar(domicilioId: number) {
  revalidatePath(`/domicilios/${domicilioId}`)
  revalidatePath('/residentes')
}

export async function crearResidente(domicilioId: number, input: ResidenteInput): Promise<ActionResult> {
  return runAction(null, async () => {
    const parsed = residenteSchema.safeParse(input)
    if (!parsed.success) return fail(parsed.error.issues[0].message)
    const { nombre, telefono } = parsed.data

    const supabase = await createClient()
    const { error } = await supabase
      .from('residentes')
      .insert({ nombre, telefono: telefono || null, domicilio_id: domicilioId })
    if (error) throw new Error(error.message)

    revalidar(domicilioId)
    return ok(undefined)
  })
}

export async function actualizarResidente(
  id: number,
  domicilioId: number,
  input: ResidenteInput,
): Promise<ActionResult> {
  return runAction(null, async () => {
    const parsed = residenteSchema.safeParse(input)
    if (!parsed.success) return fail(parsed.error.issues[0].message)
    const { nombre, telefono, esPrincipal } = parsed.data

    const supabase = await createClient()
    const { error } = await supabase
      .from('residentes')
      .update({ nombre, telefono: telefono || null, es_principal: esPrincipal ?? false })
      .eq('id', id)
    if (error) throw new Error(error.message)

    revalidar(domicilioId)
    return ok(undefined)
  })
}

export async function eliminarResidente(id: number, domicilioId: number): Promise<ActionResult> {
  return runAction(null, async () => {
    const supabase = await createClient()
    const { error } = await supabase.from('residentes').delete().eq('id', id)
    if (error) throw new Error(error.message)

    revalidar(domicilioId)
    return ok(undefined)
  })
}
