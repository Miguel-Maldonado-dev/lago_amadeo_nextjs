'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState, type ReactNode } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import type { z } from 'zod'
import { FormDialog } from '@/components/form-dialog'
import { SearchableSelect } from '@/components/searchable-select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { todayISO } from '@/lib/dates'
import { formatMoney } from '@/lib/format'
import type { Tables } from '@/lib/supabase/types'
import { registrarPagoExtra } from '../actions'
import { MSG_PAGO_OK, MSG_SIN_RECIBO } from '../messages'
import { pagoExtraSchema } from '../schemas'

const MSG_ERROR_GENERICO = 'Ocurrió un error inesperado. Intenta de nuevo.'
const FORM_ID = 'pago-extra-form'

type FormInput = z.input<typeof pagoExtraSchema>
type FormOutput = z.output<typeof pagoExtraSchema>

export function RegistrarPagoExtraDialog({
  domicilioId,
  domicilios,
  conceptos,
  metodos,
  trigger,
}: {
  domicilioId?: number
  domicilios: { id: number; direccion: string }[]
  conceptos: Tables<'conceptos_pago'>[]
  metodos: Tables<'metodos_pago'>[]
  trigger: ReactNode
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const defaults = (): Partial<FormInput> => ({
    domicilioId,
    conceptoId: undefined,
    fechaPago: todayISO(),
    metodoPagoId: undefined,
  })
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(pagoExtraSchema),
    defaultValues: defaults(),
  })

  const conceptoId = useWatch({ control, name: 'conceptoId' })
  const selectedConcepto = conceptos.find((c) => c.id === Number(conceptoId))

  async function onSubmit(values: FormOutput) {
    try {
      const result = await registrarPagoExtra(values)
      if (result.ok) {
        toast.success(MSG_PAGO_OK)
        if (!result.data.reciboGenerado) toast.warning(MSG_SIN_RECIBO)
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
    if (next) reset(defaults())
    setOpen(next)
  }

  return (
    <FormDialog
      title="Registrar Pago Extra"
      description="Registra un pago adicional a las cuotas mensuales."
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
        className="grid gap-4 md:grid-cols-2"
        noValidate
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="pago-extra-domicilio" className="text-xs font-medium">
            Dirección <span className="text-danger">*</span>
          </Label>
          <Controller
            control={control}
            name="domicilioId"
            render={({ field }) => (
              <SearchableSelect
                id="pago-extra-domicilio"
                options={domicilios.map((d) => ({ value: String(d.id), label: d.direccion }))}
                value={field.value ? String(field.value) : null}
                onChange={(v) => field.onChange(v ?? undefined)}
                placeholder="Selecciona una dirección"
                disabled={domicilioId !== undefined}
              />
            )}
          />
          {errors.domicilioId && <p className="text-xs text-danger">Selecciona una dirección</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="conceptoId" className="text-xs font-medium">
            Concepto <span className="text-danger">*</span>
          </Label>
          <Controller
            control={control}
            name="conceptoId"
            render={({ field }) => (
              <Select value={field.value ? String(field.value) : ''} onValueChange={field.onChange}>
                <SelectTrigger id="conceptoId" className="w-full">
                  <SelectValue placeholder="Selecciona un concepto" />
                </SelectTrigger>
                <SelectContent>
                  {conceptos.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.conceptoId && <p className="text-xs text-danger">Selecciona un concepto</p>}
        </div>
        <dl className="grid grid-cols-2 gap-3 rounded-md bg-muted p-4 md:col-span-2">
          <div className="flex flex-col gap-1">
            <dt className="text-xs text-muted-foreground">Importe</dt>
            <dd className="text-sm font-medium">{formatMoney(selectedConcepto?.importe)}</dd>
          </div>
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
