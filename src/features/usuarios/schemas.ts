import { z } from 'zod'
import { toTitleCase } from '@/lib/text'
import { positiveInt } from '@/lib/zod'

const userName = z.string().trim().min(1, 'El nombre es obligatorio').transform(toTitleCase)

export const nuevoUsuarioSchema = z.object({
  userName,
  email: z.email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  roleId: positiveInt,
})

export const editarUsuarioSchema = z.object({
  userName,
  roleId: positiveInt,
})

export type NuevoUsuarioInput = z.input<typeof nuevoUsuarioSchema>
export type EditarUsuarioInput = z.input<typeof editarUsuarioSchema>
