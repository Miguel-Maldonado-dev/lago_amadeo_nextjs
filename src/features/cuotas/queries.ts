import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import type { Tables, Views } from '@/lib/supabase/types'

export type CuotaInfo = Views<'cuotas_info'>

// --- Cuotas por periodo (todas las viviendas) ---

export async function listCuotasPeriodo(
  supabase: SupabaseClient<Database>,
  anio: number,
  mes: number,
): Promise<CuotaInfo[]> {
  const { data, error } = await supabase
    .from('cuotas_info')
    .select('*')
    .eq('anio', anio)
    .eq('mes', mes)
    .order('direccion', { ascending: true })
  if (error) throw new Error(`No se pudieron leer las cuotas: ${error.message}`)
  return data ?? []
}

// --- Catálogos ---

export async function listAnios(supabase: SupabaseClient<Database>): Promise<number[]> {
  const { data, error } = await supabase.from('anios').select('anio').order('anio', { ascending: false })
  if (error) throw new Error(`No se pudieron leer los años: ${error.message}`)
  return (data ?? []).map((r) => r.anio)
}

export async function listMeses(
  supabase: SupabaseClient<Database>,
): Promise<{ id: number; name: string }[]> {
  const { data, error } = await supabase.from('meses').select('id, name').order('id', { ascending: true })
  if (error) throw new Error(`No se pudieron leer los meses: ${error.message}`)
  return data ?? []
}

export async function listEstatus(supabase: SupabaseClient<Database>): Promise<string[]> {
  const { data, error } = await supabase.from('estatus').select('name').order('id', { ascending: true })
  if (error) throw new Error(`No se pudieron leer los estatus: ${error.message}`)
  return (data ?? []).map((r) => r.name)
}

// --- Cuotas de un domicilio ---

export async function listCuotasDomicilio(
  supabase: SupabaseClient<Database>,
  domicilioId: number,
): Promise<CuotaInfo[]> {
  const { data, error } = await supabase
    .from('cuotas_info')
    .select('*')
    .eq('domicilio_id', domicilioId)
    .order('anio', { ascending: false })
    .order('mes', { ascending: false })
  if (error) throw new Error(`No se pudieron leer las cuotas: ${error.message}`)
  return data ?? []
}

export async function getCuotaInfo(supabase: SupabaseClient<Database>, id: number): Promise<CuotaInfo | null> {
  const { data, error } = await supabase.from('cuotas_info').select('*').eq('id', id).maybeSingle()
  if (error) throw new Error(`No se pudo leer la cuota: ${error.message}`)
  return data
}

export async function getDescuentoCuota(
  supabase: SupabaseClient<Database>,
  cuotaId: number,
): Promise<Tables<'descuento_cuota'> | null> {
  const { data, error } = await supabase
    .from('descuento_cuota')
    .select('*')
    .eq('cuota_id', cuotaId)
    .limit(1)
    .maybeSingle()
  if (error) throw new Error(`No se pudo leer el descuento: ${error.message}`)
  return data
}

export async function getRecargoCuota(
  supabase: SupabaseClient<Database>,
  cuotaId: number,
): Promise<Tables<'recargo_cuota'> | null> {
  const { data, error } = await supabase
    .from('recargo_cuota')
    .select('*')
    .eq('cuota_id', cuotaId)
    .limit(1)
    .maybeSingle()
  if (error) throw new Error(`No se pudo leer el recargo: ${error.message}`)
  return data
}

export async function listConceptosDescuento(
  supabase: SupabaseClient<Database>,
): Promise<Tables<'conceptos_descuento'>[]> {
  const { data, error } = await supabase.from('conceptos_descuento').select('*').order('id', { ascending: true })
  if (error) throw new Error(`No se pudieron leer los descuentos: ${error.message}`)
  return data ?? []
}

export async function listConceptosRecargo(
  supabase: SupabaseClient<Database>,
): Promise<Tables<'conceptos_recargo'>[]> {
  const { data, error } = await supabase.from('conceptos_recargo').select('*').order('id', { ascending: true })
  if (error) throw new Error(`No se pudieron leer los recargos: ${error.message}`)
  return data ?? []
}

export async function existeCuota(
  supabase: SupabaseClient<Database>,
  domicilioId: number,
  anio: number,
  mes: number,
): Promise<boolean> {
  const { count, error } = await supabase
    .from('cuotas')
    .select('id', { count: 'exact', head: true })
    .eq('domicilio_id', domicilioId)
    .eq('anio', anio)
    .eq('mes', mes)
  if (error) throw new Error(`No se pudo verificar la cuota: ${error.message}`)
  return (count ?? 0) > 0
}

export async function getDomicilioConceptoInfo(
  supabase: SupabaseClient<Database>,
  domicilioId: number,
): Promise<Views<'domicilio_concepto_info'> | null> {
  const { data, error } = await supabase
    .from('domicilio_concepto_info')
    .select('*')
    .eq('domicilio_id', domicilioId)
    .limit(1)
    .maybeSingle()
  if (error) throw new Error(`No se pudo leer el tipo de cuota: ${error.message}`)
  return data
}
