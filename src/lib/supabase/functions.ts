import type { SupabaseClient } from '@supabase/supabase-js'
import { SUPABASE_KEY, SUPABASE_URL } from '@/lib/supabase/env'
import type { Database } from '@/lib/supabase/types'

type InvokeInit = { method?: 'GET' | 'POST'; body?: unknown; query?: Record<string, string> }

/** Llama a una Edge Function con el token del usuario y devuelve la `Response` cruda (CSV, TXT, JSON…). */
export async function invokeEdgeFunction(
  supabase: SupabaseClient<Database>,
  slug: string,
  init: InvokeInit,
): Promise<Response> {
  const { data } = await supabase.auth.getSession()
  const accessToken = data.session?.access_token

  const url = new URL(`${SUPABASE_URL}/functions/v1/${slug}`)
  Object.entries(init.query ?? {}).forEach(([key, value]) => url.searchParams.set(key, value))

  const hasBody = init.body !== undefined
  const headers: Record<string, string> = { apikey: SUPABASE_KEY }
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`
  if (hasBody) headers['Content-Type'] = 'application/json'

  return fetch(url, {
    method: init.method ?? (hasBody ? 'POST' : 'GET'),
    headers,
    body: hasBody ? JSON.stringify(init.body) : undefined,
  })
}
