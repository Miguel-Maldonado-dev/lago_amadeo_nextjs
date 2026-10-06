'use server'

import type { SupabaseClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { getCuotaInfo } from '@/features/cuotas/queries'
import { getDomicilioInfo } from '@/features/domicilios/queries'
import { fail, ok, type ActionResult } from '@/lib/action-result'
import { runAction } from '@/lib/auth/run-action'
import { ESTATUS, ROLES_GESTION, TIPO_PAGO } from '@/lib/constants'
import { formatDate } from '@/lib/dates'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'
import {
  MSG_CONCEPTO_INVALIDO,
  MSG_CUOTA_NO_EXISTE,
  MSG_CUOTA_YA_PAGADA,
  MSG_DOMICILIO_NO_EXISTE,
  MSG_PAGO_SIN_MARCAR,
} from './messages'
import { getConceptoPago, getPagoIdPorCuota } from './queries'
import { generarReciboBase64 } from './recibo'
import { pagoCuotaSchema, pagoExtraSchema, type PagoCuotaInput, type PagoExtraInput } from './schemas'

type PagoCuotaResult = { pagoId: number; reciboGenerado: boolean; yaExistia?: boolean }

/**
 * Registra el pago de una cuota, genera su recibo y la marca como Pagado.
 * No es transaccional (igual que la app original). El movimiento de ingreso lo crea el trigger
 * `trg_pagos_to_movimientos` al insertar en `pagos`. Una vez que existe el pago, la cuota se marca
 * siempre, aunque el recibo falle; si la cuota ya tenía un pago, no se inserta otro.
 */
export async function registrarPagoCuota(input: PagoCuotaInput): Promise<ActionResult<PagoCuotaResult>> {
  const parsed = pagoCuotaSchema.safeParse(input)
  if (!parsed.success) return fail(parsed.error.issues[0].message)
  const { cuotaId, fechaPago, metodoPagoId } = parsed.data

  return runAction(ROLES_GESTION, async (user) => {
    const supabase = await createClient()

    const cuota = await getCuotaInfo(supabase, cuotaId)
    if (
      !cuota ||
      cuota.domicilio_id === null ||
      cuota.importe_cuota === null ||
      cuota.importe_base === null
    ) {
      return fail(MSG_CUOTA_NO_EXISTE)
    }
    if (cuota.estatus === 'Pagado') return fail(MSG_CUOTA_YA_PAGADA)
    const domicilioId = cuota.domicilio_id

    // Un intento previo pudo insertar el pago sin llegar a marcar la cuota: no se duplica.
    const pagoExistente = await getPagoIdPorCuota(supabase, cuotaId)
    if (pagoExistente !== null) {
      return marcarPagadaYRevalidar(supabase, cuotaId, domicilioId, {
        pagoId: pagoExistente,
        reciboGenerado: true,
        yaExistia: true,
      })
    }

    const { data: pago, error: pagoError } = await supabase
      .from('pagos')
      .insert({
        domicilio_id: domicilioId,
        cuota_id: cuotaId,
        concepto_id: cuota.concepto_id,
        fecha_pago: fechaPago,
        metodo_pago_id: metodoPagoId,
        user_id: user.id,
        importe: cuota.importe_cuota,
      })
      .select('id, referencia')
      .single()
    if (pagoError) throw new Error(pagoError.message)

    const fileData = await generarReciboBase64(supabase, {
      direccion: cuota.direccion ?? '',
      residente: cuota.residente_principal ?? '',
      periodo: cuota.periodo ?? '',
      concepto: cuota.concepto ?? '',
      fecha_vencimiento: cuota.fecha_vencimiento_formated ?? '',
      importe: cuota.importe_base,
      descuento: cuota.monto_descuento ?? 0,
      recargo: cuota.monto_recargo ?? 0,
      fecha_pago: formatDate(fechaPago),
      referencia: pago.referencia,
    })

    const reciboGenerado = await guardarRecibo(supabase, pago.id, fileData)

    return marcarPagadaYRevalidar(supabase, cuotaId, domicilioId, { pagoId: pago.id, reciboGenerado })
  })
}

/** Pasos 6 y 7: con el pago ya registrado, marca la cuota como Pagado y revalida; nunca lanza. */
async function marcarPagadaYRevalidar(
  supabase: SupabaseClient<Database>,
  cuotaId: number,
  domicilioId: number,
  result: PagoCuotaResult,
): Promise<ActionResult<PagoCuotaResult>> {
  const { error } = await supabase.from('cuotas').update({ estatus_id: ESTATUS.PAGADO }).eq('id', cuotaId)
  if (error) console.error(`No se pudo marcar como pagada la cuota ${cuotaId}: ${error.message}`)

  revalidatePath(`/domicilios/${domicilioId}`)
  revalidatePath('/cuotas')
  revalidatePath('/pagos')
  revalidatePath('/movimientos')
  revalidatePath('/')
  return error ? fail(MSG_PAGO_SIN_MARCAR) : ok(result)
}

/** Guarda el recibo en `pagos.file_data`; nunca lanza (el pago ya existe). Devuelve si quedó guardado. */
async function guardarRecibo(
  supabase: SupabaseClient<Database>,
  pagoId: number,
  fileData: string | null,
): Promise<boolean> {
  if (!fileData) return false
  const { error } = await supabase.from('pagos').update({ file_data: fileData }).eq('id', pagoId)
  if (error) console.error(`No se pudo guardar el recibo del pago ${pagoId}: ${error.message}`)
  return !error
}

/**
 * Registra un pago extra (concepto único, p. ej. tarjeta de acceso) y genera su recibo. No hay cuota:
 * el importe es el del concepto. El movimiento de ingreso lo crea el trigger `trg_pagos_to_movimientos`.
 */
export async function registrarPagoExtra(
  input: PagoExtraInput,
): Promise<ActionResult<{ pagoId: number; reciboGenerado: boolean }>> {
  const parsed = pagoExtraSchema.safeParse(input)
  if (!parsed.success) return fail(parsed.error.issues[0].message)
  const { domicilioId, conceptoId, fechaPago, metodoPagoId } = parsed.data

  return runAction(ROLES_GESTION, async (user) => {
    const supabase = await createClient()

    const concepto = await getConceptoPago(supabase, conceptoId)
    if (!concepto || concepto.tipo_pago_id !== TIPO_PAGO.EXTRA) return fail(MSG_CONCEPTO_INVALIDO)

    const domicilio = await getDomicilioInfo(supabase, domicilioId)
    if (!domicilio) return fail(MSG_DOMICILIO_NO_EXISTE)

    const { data: pago, error: pagoError } = await supabase
      .from('pagos')
      .insert({
        domicilio_id: domicilioId,
        concepto_id: conceptoId,
        fecha_pago: fechaPago,
        metodo_pago_id: metodoPagoId,
        user_id: user.id,
        importe: concepto.importe,
      })
      .select('id, referencia')
      .single()
    if (pagoError) throw new Error(pagoError.message)

    const fileData = await generarReciboBase64(supabase, {
      direccion: domicilio.direccion ?? '',
      residente: domicilio.residente_principal ?? '',
      concepto: concepto.nombre,
      importe: concepto.importe,
      fecha_pago: formatDate(fechaPago),
      referencia: pago.referencia,
    })
    const reciboGenerado = await guardarRecibo(supabase, pago.id, fileData)

    revalidatePath('/pagos')
    revalidatePath(`/domicilios/${domicilioId}`)
    revalidatePath('/movimientos')
    revalidatePath('/')
    return ok({ pagoId: pago.id, reciboGenerado })
  })
}
