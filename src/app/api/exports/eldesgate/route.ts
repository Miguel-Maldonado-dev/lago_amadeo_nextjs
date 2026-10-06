import type { NextRequest } from 'next/server'
import { proxyExport } from '@/features/reportes/export-proxy'
import { eldesgateParamsSchema } from '@/features/reportes/schemas'

export const GET = (request: NextRequest) =>
  proxyExport(request, {
    slug: 'create-eldesgate-csv',
    schema: eldesgateParamsSchema,
    toQuery: ({ mes, anio, salida }) => ({ mes: String(mes), anio: String(anio), salida }),
  })
