import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import type { Views } from '@/lib/supabase/types'

export async function getResumenFinanciero(
  supabase: SupabaseClient<Database>,
): Promise<Views<'resumen_financiero_completo'> | null> {
  const { data, error } = await supabase
    .from('resumen_financiero_completo')
    .select('*')
    .limit(1)
    .maybeSingle()
  if (error) throw new Error(`No se pudo leer el resumen financiero: ${error.message}`)
  return data
}
