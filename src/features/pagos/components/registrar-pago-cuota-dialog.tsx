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
import type { CuotaInfo } from '@/features/cuotas/queries'
import { todayISO } from '@/lib/dates'
import { formatMoney } from '@/lib/format'
import type { Tables } from '@/lib/supabase/types'
import { registrarPagoCuota } from '../actions'
import { MSG_PAGO_OK, MSG_PAGO_YA_EXISTIA, MSG_SIN_RECIBO } from '../messages'
import { pagoCuotaSchema } from '../schemas'

const MSG_ERROR_GENERICO = 'Ocurrió un error inesperado. Intenta de nuevo.'
const FORM_ID = 'pago-cuota-form'

/** El formulario captura fecha y método; la cuota viene de las props. */
const formSchema = pagoCuotaSchema.omit({ cuotaId: true })
type FormInput = z.input<typeof formSchema>
type FormOutput = z.output<typeof formSchema>

export function RegistrarPagoCuotaDialog({
  cuota,
  metodos,
  trigger,
}: {
  cuota: CuotaInfo
  metodos: Tables<'metodos_pago'>[]
  trigger: ReactNode
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(formSchema),
    defaultValues: { fechaPago: todayISO(), metodoPagoId: undefined },
  })

  async function onSubmit({ fechaPago, metodoPagoId }: FormOutput) {
    try {
      const result = await registrarPagoCuota({ cuotaId: cuota.id!, fechaPago, metodoPagoId })
      if (result.ok) {
        if (result.data.yaExistia) {
          toast.info(MSG_PAGO_YA_EXISTIA)
        } else {
          toast.success(MSG_PAGO_OK)
          if (!result.data.reciboGenerado) toast.warning(MSG_SIN_RECIBO)
        }
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
    // No se cierra mientras el pago está en curso: el resultado debe verse antes de reintentar.
    if (!next && isSubmitting) return
    if (next) reset({ fechaPago: todayISO(), metodoPagoId: undefined })
    setOpen(next)
  }

  const cabecera: [string, string | null][] = [
    ['Dirección', cuota.direccion],
    ['Residente', cuota.residente_principal],
    ['Periodo', cuota.periodo],
    ['Fecha de vencimiento', cuota.fecha_vencimiento_formated],
    ['Concepto', cuota.concepto],
    ['Importe', formatMoney(cuota.importe_cuota)],
  ]

  return (
    <FormDialog
      title="Registrar Pago"
      description="Registra el pago de la cuota seleccionada."
      trigger={trigger}
      open={open}
      onOpenChange={handleOpenChange}
      footer={
        <>
          <Button variant="secondary" type="button" disabled={isSubmitting} onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID} loading={isSubmitting}>
            Registrar Pago
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
        <dl className="grid grid-cols-2 gap-3 rounded-md bg-muted p-4">
          {cabecera.map(([label, value]) => (
            <div key={label} className="flex flex-col gap-1">
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="text-sm font-medium">{value || '—'}</dd>
            </div>
          ))}
        </dl>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fechaPago" className="text-xs font-medium">
            Fecha de Pago <span className="text-danger">*</span>
          </Label>
          <Input id="fechaPago" type="date" max={todayISO()} {...register('fechaPago')} />
          {errors.fechaPago && <p className="text-xs text-danger">{errors.fechaPago.message}</p>}
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
