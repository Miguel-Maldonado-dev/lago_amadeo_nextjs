import { z } from 'zod'
import { toTitleCase } from '@/lib/text'

export const residenteSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio').transform(toTitleCase),
  telefono: z.string().regex(/^\d{0,10}$/, 'Solo dígitos, máximo 10').optional(),
  esPrincipal: z.boolean().optional(),
})

export type ResidenteInput = z.input<typeof residenteSchema>
