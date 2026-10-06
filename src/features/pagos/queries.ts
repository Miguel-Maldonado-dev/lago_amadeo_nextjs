import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import { TIPO_PAGO } from '@/lib/constants'
import type { Tables, Views } from '@/lib/supabase/types'

export async function getPagoRecibo(
  supabase: SupabaseClient<Database>,
  pagoId: number,
): Promise<{ referencia: string; file_data: string | null } | null> {
  const { data, error } = await supabase
    .from('pagos')
    .select('referencia, file_data')
    .eq('id', pagoId)
    .maybeSingle()
  if (error) throw new Error(`No se pudo leer el recibo: ${error.message}`)
  return data
}

export async function getPagoIdPorCuota(
  supabase: SupabaseClient<Database>,
  cuotaId: number,
): Promise<number | null> {
  const { data, error } = await supabase
    .from('pagos')
    .select('id')
    .eq('cuota_id', cuotaId)
    .order('id', { ascending: true })
    .limit(1)
    .maybeSingle()
  if (error) throw new Error(`No se pudo leer el pago: ${error.message}`)
  return data?.id ?? null
}

export async function listMetodosPago(supabase: SupabaseClient<Database>): Promise<Tables<'metodos_pago'>[]> {
  const { data, error } = await supabase.from('metodos_pago').select('*').order('id', { ascending: true })
  if (error) throw new Error(`No se pudieron leer los métodos de pago: ${error.message}`)
  return data ?? []
}

export type PagoInfo = Views<'pagos_info'>

export async function listPagos(supabase: SupabaseClient<Database>): Promise<PagoInfo[]> {
  const { data, error } = await supabase.from('pagos_info').select('*').order('id', { ascending: false })
  if (error) throw new Error(`No se pudieron leer los pagos: ${error.message}`)
  return data ?? []
}

export async function listPagosExtraDomicilio(
  supabase: SupabaseClient<Database>,
  domicilioId: number,
): Promise<PagoInfo[]> {
  const { data, error } = await supabase
    .from('pagos_info')
    .select('*')
    .eq('domicilio_id', domicilioId)
    .eq('tipo_pago_id', TIPO_PAGO.EXTRA)
    .order('id', { ascending: false })
  if (error) throw new Error(`No se pudieron leer los pagos extra: ${error.message}`)
  return data ?? []
}

export async function listConceptosExtra(supabase: SupabaseClient<Database>): Promise<Tables<'conceptos_pago'>[]> {
  const { data, error } = await supabase
    .from('conceptos_pago')
    .select('*')
    .eq('tipo_pago_id', TIPO_PAGO.EXTRA)
    .order('id', { ascending: true })
  if (error) throw new Error(`No se pudieron leer los conceptos extra: ${error.message}`)
  return data ?? []
}

export async function getConceptoPago(
  supabase: SupabaseClient<Database>,
  id: number,
): Promise<Tables<'conceptos_pago'> | null> {
  const { data, error } = await supabase.from('conceptos_pago').select('*').eq('id', id).maybeSingle()
  if (error) throw new Error(`No se pudo leer el concepto: ${error.message}`)
  return data
}
