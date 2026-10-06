import { z } from 'zod'
import { isoDateSchema } from '@/lib/zod'

export const domicilioSchema = z.object({
  direccion: z
    .string()
    .trim()
    .min(1, 'La dirección es obligatoria')
    .transform((s) => s.toUpperCase()),
  fechaAlta: isoDateSchema,
  conceptoId: z.coerce.number().int().positive().optional(),
  observaciones: z.string().trim().optional(),
})

export type DomicilioInput = z.input<typeof domicilioSchema>
