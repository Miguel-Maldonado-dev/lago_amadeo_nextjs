import type { SupabaseClient } from '@supabase/supabase-js'
import { TIPO_PAGO } from '@/lib/constants'
import type { Database } from '@/lib/supabase/database.types'
import type { ElementoCatalogo, TipoCuota } from './catalogos'

type Accesos = { acceso_telefono: boolean; acceso_tarjeta: boolean }

export async function listTiposCuota(supabase: SupabaseClient<Database>): Promise<TipoCuota[]> {
  const { data, error } = await supabase
    .from('conceptos_pago')
    .select('id, nombre, importe, concepto_pago_acceso(acceso_telefono, acceso_tarjeta)')
    .eq('tipo_pago_id', TIPO_PAGO.RECURRENTE)
    .order('nombre', { ascending: true })
  if (error) throw new Error(`No se pudieron leer los tipos de cuota: ${error.message}`)
  return (data ?? []).map((r) => {
    // PostgREST puede devolver la relación como arreglo u objeto; sin fila, los accesos valen true
    // (mismo criterio que la sección de accesos del domicilio).
    const rel = r.concepto_pago_acceso as Accesos | Accesos[] | null
    const acceso = Array.isArray(rel) ? rel[0] : rel
    return {
      id: r.id,
      nombre: r.nombre,
      importe: Number(r.importe),
      accesoTelefono: acceso?.acceso_telefono ?? true,
      accesoTarjeta: acceso?.acceso_tarjeta ?? true,
    }
  })
}

export async function listConceptosExtraCatalogo(supabase: SupabaseClient<Database>): Promise<ElementoCatalogo[]> {
  const { data, error } = await supabase
    .from('conceptos_pago')
    .select('id, nombre, importe')
    .eq('tipo_pago_id', TIPO_PAGO.EXTRA)
    .order('nombre', { ascending: true })
  if (error) throw new Error(`No se pudieron leer los conceptos extra: ${error.message}`)
  return (data ?? []).map((r) => ({ id: r.id, nombre: r.nombre, importe: Number(r.importe) }))
}
