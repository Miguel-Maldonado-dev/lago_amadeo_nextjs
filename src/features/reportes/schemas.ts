import { z } from 'zod'
import { periodoSchema } from '@/features/cuotas/schemas'
import { isoDateSchema } from '@/lib/zod'

export const pagosUsuarioFiltroSchema = z
  .object({ usuario: z.uuid(), inicio: isoDateSchema, fin: isoDateSchema })
  .refine((f) => f.inicio <= f.fin, {
    message: 'La fecha fin debe ser posterior a la fecha inicio',
    path: ['fin'],
  })

export const eldesgateParamsSchema = periodoSchema.extend({ salida: z.enum(['1', '2', 'BOTH']) })

export const zktecoParamsSchema = periodoSchema.extend({ inicioID: z.coerce.number().int().min(1) })
