import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import type { Tables, Views } from '@/lib/supabase/types'

export async function listUsuarios(
  supabase: SupabaseClient<Database>,
  activos: boolean,
): Promise<Views<'users_info'>[]> {
  const { data, error } = await supabase
    .from('users_info')
    .select('*')
    .eq('is_active', activos)
    .order('created_at', { ascending: true })
  if (error) throw new Error(`No se pudieron leer los usuarios: ${error.message}`)
  return data ?? []
}

export async function listRoles(supabase: SupabaseClient<Database>): Promise<Tables<'roles'>[]> {
  const { data, error } = await supabase.from('roles').select('*').order('id', { ascending: true })
  if (error) throw new Error(`No se pudieron leer los roles: ${error.message}`)
  return data ?? []
}
