import { z } from 'zod'

const IMPORTE_TEXTO = /^\d+(\.\d+)?$/
const IMPORTE_MAXIMO = 999_999.99

const importeSchema = z
  .union([z.string(), z.number()])
  .transform((v, ctx) => {
    const texto = String(v).trim()
    if (!IMPORTE_TEXTO.test(texto)) {
      ctx.addIssue({ code: 'custom', message: 'Ingresa un importe válido' })
      return z.NEVER
    }
    return Number(texto)
  })
  .refine((n) => n > 0, 'El importe debe ser mayor a 0')
  .refine((n) => Math.abs(n * 100 - Math.round(n * 100)) < 1e-9, 'Máximo 2 decimales')
  .refine((n) => n <= IMPORTE_MAXIMO, 'El importe máximo es 999,999.99')

export const catalogoSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio').max(80, 'Máximo 80 caracteres'),
  importe: importeSchema,
})

export const tipoCuotaSchema = catalogoSchema.extend({
  accesoTelefono: z.boolean(),
  accesoTarjeta: z.boolean(),
})

export type CatalogoInput = z.input<typeof catalogoSchema>
export type TipoCuotaInput = z.input<typeof tipoCuotaSchema>
