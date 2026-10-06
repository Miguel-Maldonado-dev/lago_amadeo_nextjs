import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import type { Tables, Views } from '@/lib/supabase/types'

export async function listResidentesDomicilio(
  supabase: SupabaseClient<Database>,
  domicilioId: number,
): Promise<Tables<'residentes'>[]> {
  const { data, error } = await supabase
    .from('residentes')
    .select('*')
    .eq('domicilio_id', domicilioId)
    .order('id', { ascending: true })
  if (error) throw new Error(`No se pudieron leer los residentes: ${error.message}`)
  return data ?? []
}

export async function listResidentesInfo(
  supabase: SupabaseClient<Database>,
  domicilioId?: number,
): Promise<Views<'residentes_info'>[]> {
  let query = supabase.from('residentes_info').select('*')
  if (domicilioId !== undefined) query = query.eq('domicilio_id', domicilioId)
  const { data, error } = await query
    .order('direccion', { ascending: true })
    .order('id', { ascending: true })
  if (error) throw new Error(`No se pudieron leer los residentes: ${error.message}`)
  return data ?? []
}
