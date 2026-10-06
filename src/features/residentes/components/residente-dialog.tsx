'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState, type ReactNode } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { FormDialog } from '@/components/form-dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ActionResult } from '@/lib/action-result'
import type { Tables } from '@/lib/supabase/types'
import { actualizarResidente, crearResidente } from '../actions'
import { MSG_RESIDENTE_ACTUALIZADO, MSG_RESIDENTE_AGREGADO } from '../messages'
import { residenteSchema, type ResidenteInput } from '../schemas'

const FORM_ID = 'residente-form'

export function ResidenteDialog({
  domicilioId,
  residente,
  trigger,
}: {
  domicilioId: number
  residente?: Tables<'residentes'>
  trigger: ReactNode
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const initial: ResidenteInput = {
    nombre: residente?.nombre ?? '',
    telefono: residente?.telefono ?? '',
    esPrincipal: residente?.es_principal ?? false,
  }
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ResidenteInput>({ resolver: zodResolver(residenteSchema), defaultValues: initial })

  async function onSubmit(values: ResidenteInput) {
    const result: ActionResult = residente
      ? await actualizarResidente(residente.id, domicilioId, values)
      : await crearResidente(domicilioId, values)
    if (result.ok) {
      toast.success(residente ? MSG_RESIDENTE_ACTUALIZADO : MSG_RESIDENTE_AGREGADO)
      setOpen(false)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  function handleOpenChange(next: boolean) {
    if (next) reset(initial)
    setOpen(next)
  }

  return (
    <FormDialog
      title={residente ? 'Editar Residente' : 'Agregar Residente'}
      description={residente ? 'Actualiza los datos del residente.' : 'Registra un residente en este domicilio.'}
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
          <Label htmlFor="nombre" className="text-xs font-medium">
            Nombre <span className="text-danger">*</span>
          </Label>
          <Input id="nombre" {...register('nombre')} />
          {errors.nombre && <p className="text-xs text-danger">{errors.nombre.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="telefono" className="text-xs font-medium">
            Teléfono
          </Label>
          <Input id="telefono" inputMode="numeric" maxLength={10} {...register('telefono')} />
          {errors.telefono && <p className="text-xs text-danger">{errors.telefono.message}</p>}
        </div>
        {residente && (
          <div className="flex items-center gap-2">
            <Controller
              control={control}
              name="esPrincipal"
              render={({ field }) => (
                <Checkbox
                  id="esPrincipal"
                  checked={field.value ?? false}
                  onCheckedChange={(v) => field.onChange(v === true)}
                />
              )}
            />
            <Label htmlFor="esPrincipal">Residente Principal</Label>
          </div>
        )}
      </form>
    </FormDialog>
  )
}
