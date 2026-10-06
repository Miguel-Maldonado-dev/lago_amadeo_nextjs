import type { SupabaseClient } from '@supabase/supabase-js'
import { invokeEdgeFunction } from '@/lib/supabase/functions'
import type { Database } from '@/lib/supabase/types'

/** Cuerpo que espera la edge function `generar-recibo-b64` (montos en pesos, fechas dd/MM/yyyy). */
export type ReciboPayload = {
  direccion: string
  residente: string
  periodo?: string
  concepto: string
  fecha_vencimiento?: string
  importe: number
  descuento?: number
  recargo?: number
  fecha_pago: string
  referencia: string
}

/** Genera el PDF del recibo y devuelve su base64; `null` si la función falla (nunca lanza). */
export async function generarReciboBase64(
  supabase: SupabaseClient<Database>,
  payload: ReciboPayload,
): Promise<string | null> {
  try {
    const res = await invokeEdgeFunction(supabase, 'generar-recibo-b64', { method: 'POST', body: payload })
    if (!res.ok) {
      console.error(`generar-recibo-b64 respondió ${res.status}: ${await res.text()}`)
      return null
    }
    const json: unknown = await res.json()
    const file = (json as { file?: unknown } | null)?.file
    return typeof file === 'string' && file.length > 0 ? file : null
  } catch (error) {
    console.error('No fue posible generar el recibo:', error)
    return null
  }
}
