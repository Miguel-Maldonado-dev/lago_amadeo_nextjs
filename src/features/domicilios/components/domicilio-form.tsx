'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import type { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { todayISO } from '@/lib/dates'
import { formatMoney } from '@/lib/format'
import type { Tables } from '@/lib/supabase/types'
import { domicilioSchema, type DomicilioInput } from '../schemas'

const SIN_ASIGNAR = 'none'

export function DomicilioForm({
  defaultValues,
  conceptos,
  onSubmit,
  submitLabel,
  allowSinAsignar = true,
  formId,
  hideSubmit = false,
}: {
  defaultValues?: Partial<DomicilioInput>
  conceptos: Tables<'conceptos_pago'>[]
  onSubmit: (input: DomicilioInput) => Promise<void>
  submitLabel: string
  allowSinAsignar?: boolean
  formId?: string
  hideSubmit?: boolean
}) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DomicilioInput, unknown, z.output<typeof domicilioSchema>>({
    resolver: zodResolver(domicilioSchema),
    defaultValues: { direccion: '', fechaAlta: todayISO(), observaciones: '', ...defaultValues },
  })

  return (
    <form
      id={formId}
      onSubmit={handleSubmit(onSubmit, () => toast.error('Por favor, ingresa todos los datos obligatorios. (*)'))}
      className="grid gap-4 md:grid-cols-2"
      noValidate
    >
      <div className="flex flex-col gap-1.5 md:col-span-2">
        <Label htmlFor="direccion" className="text-xs font-medium">Dirección <span className="text-danger">*</span></Label>
        <Input id="direccion" className="uppercase" {...register('direccion')} />
        {errors.direccion && <p className="text-xs text-danger">{errors.direccion.message}</p>}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="fechaAlta" className="text-xs font-medium">Fecha de Registro <span className="text-danger">*</span></Label>
        <Input id="fechaAlta" type="date" {...register('fechaAlta')} />
        {errors.fechaAlta && <p className="text-xs text-danger">{errors.fechaAlta.message}</p>}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="conceptoId" className="text-xs font-medium">Tipo de Cuota Mensual</Label>
        <Controller
          control={control}
          name="conceptoId"
          render={({ field }) => (
            <Select
              value={field.value ? String(field.value) : SIN_ASIGNAR}
              onValueChange={(v) => field.onChange(v === SIN_ASIGNAR ? undefined : v)}
            >
              <SelectTrigger id="conceptoId" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {allowSinAsignar && <SelectItem value={SIN_ASIGNAR}>Sin asignar</SelectItem>}
                {conceptos.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {`${c.nombre} — ${formatMoney(c.importe)}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>
      <div className="flex flex-col gap-1.5 md:col-span-2">
        <Label htmlFor="observaciones" className="text-xs font-medium">Observaciones</Label>
        <Textarea id="observaciones" {...register('observaciones')} />
      </div>
      {!hideSubmit && (
        <Button type="submit" disabled={isSubmitting} className="md:col-span-2">
          {submitLabel}
        </Button>
      )}
    </form>
  )
}
