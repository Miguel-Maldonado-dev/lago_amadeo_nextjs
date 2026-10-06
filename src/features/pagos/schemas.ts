import { z } from 'zod'
import { fechaNoFuturaSchema, positiveInt } from '@/lib/zod'

export const pagoCuotaSchema = z.object({
  cuotaId: positiveInt,
  fechaPago: fechaNoFuturaSchema,
  metodoPagoId: positiveInt,
})

export type PagoCuotaInput = z.input<typeof pagoCuotaSchema>

export const pagoExtraSchema = z.object({
  domicilioId: positiveInt,
  conceptoId: positiveInt,
  fechaPago: fechaNoFuturaSchema,
  metodoPagoId: positiveInt,
})

export type PagoExtraInput = z.input<typeof pagoExtraSchema>
