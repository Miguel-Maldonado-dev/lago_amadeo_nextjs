import { z } from 'zod'
import { fechaNoFuturaSchema, positiveInt } from '@/lib/zod'

export const movimientoSchema = z.object({
  tipoId: positiveInt,
  descripcion: z.string().trim().min(1, 'La descripción es obligatoria'),
  importe: z.coerce.number().positive('El importe debe ser mayor a 0'),
  metodoPagoId: positiveInt,
  fechaMovimiento: fechaNoFuturaSchema,
})

export type MovimientoInput = z.input<typeof movimientoSchema>
