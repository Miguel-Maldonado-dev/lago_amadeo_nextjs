'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { FormDialog } from '@/components/form-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ActionResult } from '@/lib/action-result'
import {
  actualizarTarjeta,
  actualizarTelefono,
  crearTarjeta,
  crearTelefono,
} from '../actions'
import { MSG_TARJETA_GUARDADA, MSG_TELEFONO_GUARDADO } from '../messages'
import { numeroSchema, type NumeroInput } from '../schemas'
import { CodigoTarjetaDesglose } from './codigo-tarjeta-desglose'

export type AccesoKind = 'telefono' | 'tarjeta'

const FORM_ID = 'numero-form'

const KINDS = {
  telefono: {
    addTitle: 'Agregar Número',
    editTitle: 'Editar Número',
    addDescription: 'Agrega un número de teléfono con acceso al fraccionamiento.',
    editDescription: 'Actualiza el número de teléfono con acceso al fraccionamiento.',
    label: 'Número de teléfono',
    saved: MSG_TELEFONO_GUARDADO,
    create: crearTelefono,
    update: actualizarTelefono,
  },
  tarjeta: {
    addTitle: 'Agregar Tarjeta',
    editTitle: 'Editar Tarjeta',
    addDescription: 'Agrega una tarjeta con acceso al fraccionamiento.',
    editDescription: 'Actualiza el número de la tarjeta de acceso.',
    label: 'Número de tarjeta',
    saved: MSG_TARJETA_GUARDADA,
    create: crearTarjeta,
    update: actualizarTarjeta,
  },
} as const

export function NumeroDialog({
  kind,
  domicilioId,
  item,
  trigger,
}: {
  kind: AccesoKind
  domicilioId: number
  item?: { id: number; valor: string }
  trigger: ReactNode
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const config = KINDS[kind]
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NumeroInput>({
    resolver: zodResolver(numeroSchema),
    defaultValues: { valor: item?.valor ?? '' },
  })

  async function onSubmit({ valor }: NumeroInput) {
    const result: ActionResult = item
      ? await config.update(item.id, domicilioId, valor)
      : await config.create(domicilioId, valor)
    if (result.ok) {
      toast.success(config.saved)
      setOpen(false)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  function handleOpenChange(next: boolean) {
    if (next) reset({ valor: item?.valor ?? '' })
    setOpen(next)
  }

  return (
    <FormDialog
      title={item ? config.editTitle : config.addTitle}
      description={item ? config.editDescription : config.addDescription}
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
          <Label htmlFor="valor" className="text-xs font-medium">
            {config.label} <span className="text-danger">*</span>
          </Label>
          <Input id="valor" inputMode="numeric" maxLength={10} {...register('valor')} />
          {errors.valor && <p className="text-xs text-danger">{errors.valor.message}</p>}
        </div>
        {kind === 'tarjeta' ? <CodigoTarjetaDesglose control={control} /> : null}
      </form>
    </FormDialog>
  )
}
