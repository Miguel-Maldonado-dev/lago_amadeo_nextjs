import type { NextRequest } from 'next/server'
import type { z } from 'zod'
import { getCurrentUser } from '@/lib/auth/current-user'
import { invokeEdgeFunction } from '@/lib/supabase/functions'
import { createClient } from '@/lib/supabase/server'

/** Reenvía a una Edge Function de exportación; esta ruta es la puerta de autenticación. */
export async function proxyExport<S extends z.ZodType>(
  request: NextRequest,
  opts: { slug: string; schema: S; toQuery: (params: z.output<S>) => Record<string, string> },
): Promise<Response> {
  const user = await getCurrentUser()
  if (!user || !user.isActive) return new Response('No autorizado', { status: 401 })

  const parsed = opts.schema.safeParse(Object.fromEntries(request.nextUrl.searchParams))
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? 'Parámetros inválidos' }, { status: 400 })
  }

  const supabase = await createClient()
  let res: Response
  try {
    res = await invokeEdgeFunction(supabase, opts.slug, { query: opts.toQuery(parsed.data) })
  } catch (error) {
    console.error(error)
    return new Response('No fue posible generar el archivo.', { status: 502 })
  }
  if (!res.ok) return new Response(await res.text(), { status: 502 })

  return new Response(res.body, {
    status: 200,
    headers: {
      'Content-Type': res.headers.get('content-type') ?? 'application/octet-stream',
      'Content-Disposition': res.headers.get('content-disposition') ?? 'attachment',
      'Cache-Control': 'private, no-store',
    },
  })
}
