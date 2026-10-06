import { z } from 'zod'

export const numeroSchema = z.object({ valor: z.string().regex(/^\d{1,10}$/, 'Solo dígitos, máximo 10') })

export type NumeroInput = z.input<typeof numeroSchema>
