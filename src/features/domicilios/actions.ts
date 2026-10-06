'use server'

import { revalidatePath } from 'next/cache'
import { fail, ok, type ActionResult } from '@/lib/action-result'
import { runAction } from '@/lib/auth/run-action'
import { createClient } from '@/lib/supabase/server'
import { MSG_DOMICILIO_DUPLICADO } from './messages'
import { getDomicilioConcepto } from './queries'
import { domicilioSchema, type DomicilioInput } from './schemas'

export async function crearDomicilio(input: DomicilioInput): Promise<ActionResult<{ id: number }>> {
  return runAction(null, async (user) => {
    const parsed = domicilioSchema.safeParse(input)
    if (!parsed.success) return fail(parsed.error.issues[0].message)
    const { direccion, fechaAlta, conceptoId, observaciones } = parsed.data

    const supabase = await createClient()
    const { data: existentes, error: dupError } = await supabase
      .from('domicilios_info')
      .select('id')
      .eq('direccion', direccion)
      .limit(1)
    if (dupError) throw new Error(dupError.message)
    if (existentes && existentes.length > 0) return fail(MSG_DOMICILIO_DUPLICADO)

    const { data: creado, error } = await supabase
      .from('domicilios')
      .insert({ direccion, fecha_alta: fechaAlta, observaciones: observaciones || null, created_by: user.id })
      .select('id')
      .single()
    if (error) throw new Error(error.message)

    if (conceptoId !== undefined) {
      const { error: conceptoError } = await supabase
        .from('domicilio_concepto')
        .insert({ domicilio_id: creado.id, concepto_id: conceptoId })
      if (conceptoError) throw new Error(conceptoError.message)
    }

    revalidatePath('/domicilios')
    return ok({ id: creado.id })
  })
}

export async function actualizarDomicilio(id: number, input: DomicilioInput): Promise<ActionResult> {
  return runAction(null, async () => {
    const parsed = domicilioSchema.safeParse(input)
    if (!parsed.success) return fail(parsed.error.issues[0].message)
    const { direccion, fechaAlta, conceptoId, observaciones } = parsed.data

    const supabase = await createClient()
    const { error } = await supabase
      .from('domicilios')
      .update({ direccion, fecha_alta: fechaAlta, observaciones: observaciones || null })
      .eq('id', id)
    if (error) throw new Error(error.message)

    if (conceptoId !== undefined) {
      const existente = await getDomicilioConcepto(supabase, id)
      const { error: conceptoError } = existente
        ? await supabase.from('domicilio_concepto').update({ concepto_id: conceptoId }).eq('id', existente.id)
        : await supabase.from('domicilio_concepto').insert({ domicilio_id: id, concepto_id: conceptoId })
      if (conceptoError) throw new Error(conceptoError.message)
    }

    revalidatePath('/domicilios')
    revalidatePath(`/domicilios/${id}`)
    return ok(undefined)
  })
}
