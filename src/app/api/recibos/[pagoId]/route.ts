import type { NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/auth/current-user'
import { parseRouteId } from '@/lib/route-id'
import { createClient } from '@/lib/supabase/server'
import { getPagoRecibo } from '@/features/pagos/queries'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ pagoId: string }> },
) {
  const user = await getCurrentUser()
  if (!user || !user.isActive) return new Response('No autorizado', { status: 401 })

  const pagoId = parseRouteId((await params).pagoId)
  if (pagoId === null) return new Response('Recibo no disponible', { status: 404 })

  const supabase = await createClient()
  const pago = await getPagoRecibo(supabase, pagoId)
  if (!pago || !pago.file_data) return new Response('Recibo no disponible', { status: 404 })

  const b64 = pago.file_data.replace(/^data:[^,]*;base64,/, '')
  const bytes = Buffer.from(b64, 'base64')
  const filename = pago.referencia.replace(/["\\\r\n]/g, '').replace(/[^\x20-\x7E]/g, '')
  return new Response(bytes, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${filename}.pdf"`,
      'Cache-Control': 'private, no-store',
    },
  })
}
