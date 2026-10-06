import { z } from 'zod'
import { todayISO } from '@/lib/dates'

export const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida')

export const fechaNoFuturaSchema = isoDateSchema.refine(
  (d) => d <= todayISO(),
  'La fecha no puede ser futura',
)

export const positiveInt = z.coerce.number().int().positive()
