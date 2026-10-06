import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import type { Tables, Views } from '@/lib/supabase/types'

export async function listMovimientos(supabase: SupabaseClient<Database>): Promise<Views<'movimientos_info'>[]> {
  const { data, error } = await supabase.from('movimientos_info').select('*').order('id', { ascending: false })
  if (error) throw new Error(`No se pudieron leer los movimientos: ${error.message}`)
  return data ?? []
}

export async function listTiposMovimiento(
  supabase: SupabaseClient<Database>,
): Promise<Tables<'tipos_movimientos'>[]> {
  const { data, error } = await supabase.from('tipos_movimientos').select('*').order('id', { ascending: true })
  if (error) throw new Error(`No se pudieron leer los tipos de movimiento: ${error.message}`)
  return data ?? []
}
