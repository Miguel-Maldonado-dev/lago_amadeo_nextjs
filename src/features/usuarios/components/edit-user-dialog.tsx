'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState, type ReactNode } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { FormDialog } from '@/components/form-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Tables, Views } from '@/lib/supabase/types'
import { actualizarUsuario } from '../actions'
import { MSG_USUARIO_ACTUALIZADO } from '../messages'
import { editarUsuarioSchema, type EditarUsuarioInput } from '../schemas'

const FORM_ID = 'edit-user-form'

export function EditUserDialog({
  usuario,
  roles,
  esUsuarioActual,
  trigger,
}: {
  usuario: Views<'users_info'>
  roles: Tables<'roles'>[]
  esUsuarioActual: boolean
  trigger: ReactNode
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const initial: EditarUsuarioInput = {
    userName: usuario.user_name ?? '',
    roleId: usuario.role_id ?? 0,
  }
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditarUsuarioInput>({
    resolver: zodResolver(editarUsuarioSchema),
    defaultValues: initial,
  })

  async function onSubmit(values: EditarUsuarioInput) {
    try {
      const result = await actualizarUsuario(usuario.id!, values)
      if (result.ok) {
        toast.success(MSG_USUARIO_ACTUALIZADO)
        setOpen(false)
        router.refresh()
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error('Ocurrió un error inesperado. Intenta de nuevo.')
    }
  }

  function handleOpenChange(next: boolean) {
    if (!next && isSubmitting) return
    if (next) reset(initial)
    setOpen(next)
  }

  return (
    <FormDialog
      title="Editar Usuario"
      description="Actualiza el nombre y el rol del usuario."
      trigger={trigger}
      open={open}
      onOpenChange={handleOpenChange}
      footer={
        <>
          <Button variant="secondary" type="button" disabled={isSubmitting} onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID} loading={isSubmitting}>
            Guardar
          </Button>
        </>
      }
    >
      <form
        id={FORM_ID}
        onSubmit={handleSubmit(onSubmit, () => toast.error('Por favor, ingresa todos los datos obligatorios. (*)'))}
        className="grid gap-4"
        noValidate
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-email" className="text-xs font-medium">
            Email
          </Label>
          <Input id="edit-email" value={usuario.email ?? ''} readOnly disabled />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-userName" className="text-xs font-medium">
            Nombre <span className="text-danger">*</span>
          </Label>
          <Input id="edit-userName" {...register('userName')} />
          {errors.userName && <p className="text-xs text-danger">{errors.userName.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-roleId" className="text-xs font-medium">
            Rol <span className="text-danger">*</span>
          </Label>
          <Controller
            control={control}
            name="roleId"
            render={({ field }) => (
              <Select
                value={field.value ? String(field.value) : ''}
                onValueChange={(v) => field.onChange(Number(v))}
                disabled={esUsuarioActual}
              >
                <SelectTrigger id="edit-roleId" className="w-full">
                  <SelectValue placeholder="Seleccionar rol..." />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.id} value={String(r.id)}>
                      {r.role_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.roleId && <p className="text-xs text-danger">Selecciona un rol</p>}
        </div>
      </form>
    </FormDialog>
  )
}
