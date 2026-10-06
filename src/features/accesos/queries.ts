import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import type { Tables } from '@/lib/supabase/types'

export async function listTelefonos(
  supabase: SupabaseClient<Database>,
  domicilioId: number,
): Promise<Tables<'telefonos_acceso'>[]> {
  const { data, error } = await supabase
    .from('telefonos_acceso')
    .select('*')
    .eq('domicilio_id', domicilioId)
    .order('id', { ascending: true })
  if (error) throw new Error(`No se pudieron leer los teléfonos de acceso: ${error.message}`)
  return data ?? []
}

export async function listTarjetas(
  supabase: SupabaseClient<Database>,
  domicilioId: number,
): Promise<Tables<'tarjetas_acceso'>[]> {
  const { data, error } = await supabase
    .from('tarjetas_acceso')
    .select('*')
    .eq('domicilio_id', domicilioId)
    .order('id', { ascending: true })
  if (error) throw new Error(`No se pudieron leer las tarjetas de acceso: ${error.message}`)
  return data ?? []
}
