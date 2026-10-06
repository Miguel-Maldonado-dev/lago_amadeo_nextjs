'use server'

import { revalidatePath } from 'next/cache'
import { fail, ok, type ActionResult } from '@/lib/action-result'
import { runAction } from '@/lib/auth/run-action'
import { LIMITES } from '@/lib/constants'
import { createClient } from '@/lib/supabase/server'
import { MSG_MAX_TARJETAS, MSG_MAX_TELEFONOS } from './messages'
import { numeroSchema } from './schemas'

type AccesoConfig = {
  table: 'telefonos_acceso' | 'tarjetas_acceso'
  column: 'telefono' | 'numero'
  limit: number
  maxMessage: string
}

const TELEFONO: AccesoConfig = {
  table: 'telefonos_acceso',
  column: 'telefono',
  limit: LIMITES.TELEFONOS,
  maxMessage: MSG_MAX_TELEFONOS,
}

const TARJETA: AccesoConfig = {
  table: 'tarjetas_acceso',
  column: 'numero',
  limit: LIMITES.TARJETAS,
  maxMessage: MSG_MAX_TARJETAS,
}

function crear(config: AccesoConfig, domicilioId: number, valor: string): Promise<ActionResult> {
  return runAction(null, async () => {
    const parsed = numeroSchema.safeParse({ valor })
    if (!parsed.success) return fail(parsed.error.issues[0].message)

    const supabase = await createClient()
    const { count, error: countError } = await supabase
      .from(config.table)
      .select('id', { count: 'exact', head: true })
      .eq('domicilio_id', domicilioId)
    if (countError) throw new Error(countError.message)
    if ((count ?? 0) >= config.limit) return fail(config.maxMessage)

    const { error } = await supabase
      .from(config.table)
      .insert({ domicilio_id: domicilioId, [config.column]: parsed.data.valor } as never)
    if (error) throw new Error(error.message)

    revalidatePath(`/domicilios/${domicilioId}`)
    return ok(undefined)
  })
}

function actualizar(config: AccesoConfig, id: number, domicilioId: number, valor: string): Promise<ActionResult> {
  return runAction(null, async () => {
    const parsed = numeroSchema.safeParse({ valor })
    if (!parsed.success) return fail(parsed.error.issues[0].message)

    const supabase = await createClient()
    const { error } = await supabase
      .from(config.table)
      .update({ [config.column]: parsed.data.valor } as never)
      .eq('id', id)
    if (error) throw new Error(error.message)

    revalidatePath(`/domicilios/${domicilioId}`)
    return ok(undefined)
  })
}

function eliminar(config: AccesoConfig, id: number, domicilioId: number): Promise<ActionResult> {
  return runAction(null, async () => {
    const supabase = await createClient()
    const { error } = await supabase.from(config.table).delete().eq('id', id)
    if (error) throw new Error(error.message)

    revalidatePath(`/domicilios/${domicilioId}`)
    return ok(undefined)
  })
}

export async function crearTelefono(domicilioId: number, valor: string): Promise<ActionResult> {
  return crear(TELEFONO, domicilioId, valor)
}

export async function actualizarTelefono(id: number, domicilioId: number, valor: string): Promise<ActionResult> {
  return actualizar(TELEFONO, id, domicilioId, valor)
}

export async function eliminarTelefono(id: number, domicilioId: number): Promise<ActionResult> {
  return eliminar(TELEFONO, id, domicilioId)
}

export async function crearTarjeta(domicilioId: number, valor: string): Promise<ActionResult> {
  return crear(TARJETA, domicilioId, valor)
}

export async function actualizarTarjeta(id: number, domicilioId: number, valor: string): Promise<ActionResult> {
  return actualizar(TARJETA, id, domicilioId, valor)
}

export async function eliminarTarjeta(id: number, domicilioId: number): Promise<ActionResult> {
  return eliminar(TARJETA, id, domicilioId)
}
