import type { SupabaseClient } from '@supabase/supabase-js'
import { TIPO_PAGO } from '@/lib/constants'
import type { Database } from '@/lib/supabase/database.types'
import type { Tables, Views } from '@/lib/supabase/types'

export type DomicilioInfo = Views<'domicilios_info'>

export async function listDomicilios(supabase: SupabaseClient<Database>): Promise<DomicilioInfo[]> {
  const { data, error } = await supabase.from('domicilios_info').select('*').order('direccion', { ascending: true })
  if (error) throw new Error(`No se pudieron leer los domicilios: ${error.message}`)
  return data ?? []
}

export async function getDomicilioInfo(
  supabase: SupabaseClient<Database>,
  id: number,
): Promise<DomicilioInfo | null> {
  const { data, error } = await supabase.from('domicilios_info').select('*').eq('id', id).maybeSingle()
  if (error) throw new Error(`No se pudo leer el domicilio: ${error.message}`)
  return data
}

export async function listConceptosRecurrentes(
  supabase: SupabaseClient<Database>,
): Promise<Tables<'conceptos_pago'>[]> {
  const { data, error } = await supabase
    .from('conceptos_pago')
    .select('*')
    .eq('tipo_pago_id', TIPO_PAGO.RECURRENTE)
    .order('nombre', { ascending: true })
  if (error) throw new Error(`No se pudieron leer los conceptos: ${error.message}`)
  return data ?? []
}

export async function listDomiciliosOptions(
  supabase: SupabaseClient<Database>,
): Promise<{ id: number; direccion: string }[]> {
  const { data, error } = await supabase.from('domicilios').select('id, direccion').order('direccion', { ascending: true })
  if (error) throw new Error(`No se pudieron leer los domicilios: ${error.message}`)
  return data ?? []
}

export async function getDomicilioConcepto(
  supabase: SupabaseClient<Database>,
  domicilioId: number,
): Promise<Tables<'domicilio_concepto'> | null> {
  const { data, error } = await supabase
    .from('domicilio_concepto')
    .select('*')
    .eq('domicilio_id', domicilioId)
    .maybeSingle()
  if (error) throw new Error(`No se pudo leer el concepto del domicilio: ${error.message}`)
  return data
}
