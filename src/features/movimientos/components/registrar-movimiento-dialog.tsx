'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState, type ReactNode } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import type { z } from 'zod'
import { FormDialog } from '@/components/form-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { todayISO } from '@/lib/dates'
import type { Tables } from '@/lib/supabase/types'
import { registrarMovimiento } from '../actions'
import { MSG_MOVIMIENTO_OK } from '../messages'
import { movimientoSchema } from '../schemas'

const MSG_ERROR_GENERICO = 'Ocurrió un error inesperado. Intenta de nuevo.'
const FORM_ID = 'movimiento-form'

type FormInput = z.input<typeof movimientoSchema>
type FormOutput = z.output<typeof movimientoSchema>

export function RegistrarMovimientoDialog({
  tipos,
  metodos,
  trigger,
}: {
  tipos: Tables<'tipos_movimientos'>[]
  metodos: Tables<'metodos_pago'>[]
  trigger: ReactNode
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const defaults = (): Partial<FormInput> => ({
    tipoId: undefined,
    importe: '',
    descripcion: '',
    fechaMovimiento: todayISO(),
    metodoPagoId: undefined,
  })
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(movimientoSchema),
    defaultValues: defaults(),
  })

  async function onSubmit(values: FormOutput) {
    try {
      const result = await registrarMovimiento(values)
      if (result.ok) {
        toast.success(MSG_MOVIMIENTO_OK)
        setOpen(false)
        router.refresh()
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error(MSG_ERROR_GENERICO)
    }
  }

  function handleOpenChange(next: boolean) {
    // No se cierra mientras el registro está en curso: el resultado debe verse antes de reintentar.
    if (!next && isSubmitting) return
    if (next) reset(defaults())
    setOpen(next)
  }

  return (
    <FormDialog
      title="Registrar Movimiento"
      description="Registra un ingreso o egreso de la cuenta del fraccionamiento."
      trigger={trigger}
      open={open}
      onOpenChange={handleOpenChange}
      footer={
        <>
          <Button variant="secondary" type="button" disabled={isSubmitting} onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID} loading={isSubmitting}>
            Registrar
          </Button>
        </>
      }
    >
      <form
        id={FORM_ID}
        onSubmit={handleSubmit(onSubmit, () => toast.error('Por favor, ingresa todos los datos obligatorios. (*)'))}
        className="grid gap-4 md:grid-cols-2"
        noValidate
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tipoId" className="text-xs font-medium">
            Tipo de Movimiento <span className="text-danger">*</span>
          </Label>
          <Controller
            control={control}
            name="tipoId"
            render={({ field }) => (
              <Select value={field.value ? String(field.value) : ''} onValueChange={field.onChange}>
                <SelectTrigger id="tipoId" className="w-full">
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tipos.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.tipoId && <p className="text-xs text-danger">Selecciona un tipo de movimiento</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="importe" className="text-xs font-medium">
            Importe <span className="text-danger">*</span>
          </Label>
          <Input id="importe" inputMode="decimal" {...register('importe')} />
          {errors.importe && <p className="text-xs text-danger">{errors.importe.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <Label htmlFor="descripcion" className="text-xs font-medium">
            Descripción <span className="text-danger">*</span>
          </Label>
          <Textarea id="descripcion" {...register('descripcion')} />
          {errors.descripcion && <p className="text-xs text-danger">{errors.descripcion.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fechaMovimiento" className="text-xs font-medium">
            Fecha de Movimiento <span className="text-danger">*</span>
          </Label>
          <Input id="fechaMovimiento" type="date" max={todayISO()} {...register('fechaMovimiento')} />
          {errors.fechaMovimiento && <p className="text-xs text-danger">{errors.fechaMovimiento.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="metodoPagoId" className="text-xs font-medium">
            Método de Pago <span className="text-danger">*</span>
          </Label>
          <Controller
            control={control}
            name="metodoPagoId"
            render={({ field }) => (
              <Select value={field.value ? String(field.value) : ''} onValueChange={field.onChange}>
                <SelectTrigger id="metodoPagoId" className="w-full">
                  <SelectValue placeholder="Selecciona un método de pago" />
                </SelectTrigger>
                <SelectContent>
                  {metodos.map((m) => (
                    <SelectItem key={m.id} value={String(m.id)}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.metodoPagoId && <p className="text-xs text-danger">Selecciona un método de pago</p>}
        </div>
      </form>
    </FormDialog>
  )
}
