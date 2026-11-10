'use server'

import type { SupabaseClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { fail, ok, type ActionResult } from '@/lib/action-result'
import { runAction } from '@/lib/auth/run-action'
import { ROLES, TIPO_PAGO } from '@/lib/constants'
import { createClient } from '@/lib/supabase/server'
import type { CatalogoSimple } from './catalogos'
import { MSG_NO_ENCONTRADO, MSG_NOMBRE_DUPLICADO } from './messages'
import { catalogoSchema, tipoCuotaSchema, type CatalogoInput, type TipoCuotaInput } from './schemas'

type TablaCatalogo = 'conceptos_pago' | 'conceptos_descuento' | 'conceptos_recargo'
type Destino = { tabla: TablaCatalogo; columnaMonto: string; tipoPagoId?: number }

const DESTINOS: Record<CatalogoSimple, Destino> = {
  extras: { tabla: 'conceptos_pago', columnaMonto: 'importe', tipoPagoId: TIPO_PAGO.EXTRA },
  descuentos: { tabla: 'conceptos_descuento', columnaMonto: 'monto_descuento' },
  recargos: { tabla: 'conceptos_recargo', columnaMonto: 'monto_recargo' },
}
const TIPO_CUOTA: Destino = { tabla: 'conceptos_pago', columnaMonto: 'importe', tipoPagoId: TIPO_PAGO.RECURRENTE }

const ADMIN = [ROLES.ADMINISTRADOR]

/*
 * Las tres tablas comparten forma (nombre + monto) pero el cliente tipado no admite un nombre de
 * tabla variable; se usa sin tipos de esquema y las columnas quedan cubiertas por las pruebas.
 */
async function db(): Promise<SupabaseClient> {
  return (await createClient()) as unknown as SupabaseClient
}

const normalizar = (s: string) => s.trim().toLocaleLowerCase('es')

function revalidarCatalogos() {
  revalidatePath('/configuracion')
  revalidatePath('/domicilios', 'layout')
  revalidatePath('/cuotas')
  revalidatePath('/pagos')
}

/*
 * Los catálogos tienen pocas filas: se comparan en código para no depender de los comodines de
 * `ilike` (PostgREST también trata `*` como comodín) y para ignorar espacios guardados de más.
 */
async function nombreRepetido(supabase: SupabaseClient, d: Destino, nombre: string, id: number | null) {
  let q = supabase.from(d.tabla).select('id, nombre')
  if (d.tipoPagoId !== undefined) q = q.eq('tipo_pago_id', d.tipoPagoId)
  const { data, error } = await q
  if (error) throw new Error(error.message)
  const buscado = normalizar(nombre)
  return ((data ?? []) as { id: number; nombre: string }[]).some(
    (r) => r.id !== id && normalizar(r.nombre) === buscado,
  )
}

/** Inserta o actualiza nombre e importe. Devuelve el id, o `null` si el registro a editar ya no existe. */
async function escribir(
  supabase: SupabaseClient,
  d: Destino,
  id: number | null,
  nombre: string,
  importe: number,
): Promise<number | null> {
  const valores = { nombre, [d.columnaMonto]: importe }
  if (id === null) {
    const fila = d.tipoPagoId === undefined ? valores : { ...valores, tipo_pago_id: d.tipoPagoId }
    const { data, error } = await supabase.from(d.tabla).insert(fila).select('id').single()
    if (error) throw new Error(error.message)
    return (data as { id: number } | null)?.id ?? null
  }
  let q = supabase.from(d.tabla).update(valores).eq('id', id)
  if (d.tipoPagoId !== undefined) q = q.eq('tipo_pago_id', d.tipoPagoId)
  const { data, error } = await q.select('id')
  if (error) throw new Error(error.message)
  return (data ?? []).length > 0 ? id : null
}

export async function guardarCatalogo(
  catalogo: CatalogoSimple,
  id: number | null,
  input: CatalogoInput,
): Promise<ActionResult> {
  return runAction(ADMIN, async () => {
    const parsed = catalogoSchema.safeParse(input)
    if (!parsed.success) return fail(parsed.error.issues[0].message)
    const { nombre, importe } = parsed.data
    const destino = DESTINOS[catalogo]

    const supabase = await db()
    if (await nombreRepetido(supabase, destino, nombre, id)) return fail(MSG_NOMBRE_DUPLICADO)
    const guardado = await escribir(supabase, destino, id, nombre, importe)
    if (id !== null && guardado === null) return fail(MSG_NO_ENCONTRADO)

    revalidarCatalogos()
    return ok(undefined)
  })
}

export async function guardarTipoCuota(id: number | null, input: TipoCuotaInput): Promise<ActionResult> {
  return runAction(ADMIN, async () => {
    const parsed = tipoCuotaSchema.safeParse(input)
    if (!parsed.success) return fail(parsed.error.issues[0].message)
    const { nombre, importe, accesoTelefono, accesoTarjeta } = parsed.data
    const accesos = { acceso_telefono: accesoTelefono, acceso_tarjeta: accesoTarjeta }

    const supabase = await db()
    if (await nombreRepetido(supabase, TIPO_CUOTA, nombre, id)) return fail(MSG_NOMBRE_DUPLICADO)
    const conceptoId = await escribir(supabase, TIPO_CUOTA, id, nombre, importe)
    if (conceptoId === null) return fail(MSG_NO_ENCONTRADO)

    if (id === null) {
      // Sin transacción entre tablas (no hay función SQL): si falla la fila de accesos se deshace el concepto.
      const { error } = await supabase.from('concepto_pago_acceso').insert({ concepto_pago_id: conceptoId, ...accesos })
      if (error) {
        await supabase.from('conceptos_pago').delete().eq('id', conceptoId)
        throw new Error(error.message)
      }
    } else {
      // Sin restricción única en concepto_pago_id: se actualiza por concepto y solo se inserta si no
      // había fila, para no crear duplicados al buscar y luego insertar.
      const { data: actualizadas, error } = await supabase
        .from('concepto_pago_acceso')
        .update(accesos)
        .eq('concepto_pago_id', id)
        .select('id')
      const { error: insertError } =
        !error && (actualizadas ?? []).length === 0
          ? await supabase.from('concepto_pago_acceso').insert({ concepto_pago_id: id, ...accesos })
          : { error: null }
      const fallo = error ?? insertError
      if (fallo) {
        // Nombre e importe ya quedaron guardados: se refrescan las pantallas antes de reportar el error.
        revalidarCatalogos()
        throw new Error(fallo.message)
      }
    }

    revalidarCatalogos()
    return ok(undefined)
  })
}
