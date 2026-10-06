'use server'

import { revalidatePath } from 'next/cache'
import { fail, ok, type ActionResult } from '@/lib/action-result'
import { runAction } from '@/lib/auth/run-action'
import { ROLES_GESTION } from '@/lib/constants'
import { createClient } from '@/lib/supabase/server'
import { movimientoSchema, type MovimientoInput } from './schemas'

/** Registra un movimiento manual. Los ingresos por pagos los crea el trigger `trg_pagos_to_movimientos`. */
export async function registrarMovimiento(input: MovimientoInput): Promise<ActionResult> {
  const parsed = movimientoSchema.safeParse(input)
  if (!parsed.success) return fail(parsed.error.issues[0].message)
  const { tipoId, descripcion, importe, metodoPagoId, fechaMovimiento } = parsed.data

  return runAction(ROLES_GESTION, async (user) => {
    const supabase = await createClient()
    const { error } = await supabase.from('movimientos_financieros').insert({
      tipo_id: tipoId,
      descripcion,
      importe,
      metodo_pago_id: metodoPagoId,
      user_id: user.id,
      fecha_movimiento: fechaMovimiento,
    })
    if (error) throw new Error(error.message)

    revalidatePath('/movimientos')
    revalidatePath('/')
    return ok(undefined)
  })
}
