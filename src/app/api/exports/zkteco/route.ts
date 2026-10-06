import type { NextRequest } from 'next/server'
import { proxyExport } from '@/features/reportes/export-proxy'
import { zktecoParamsSchema } from '@/features/reportes/schemas'

export const GET = (request: NextRequest) =>
  proxyExport(request, {
    slug: 'create-zkteco-txt',
    schema: zktecoParamsSchema,
    toQuery: ({ mes, anio, inicioID }) => ({ mes: String(mes), anio: String(anio), inicioID: String(inicioID) }),
  })
