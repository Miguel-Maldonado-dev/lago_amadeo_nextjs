'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState, type ReactNode } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { FormDialog } from '@/components/form-dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { guardarTipoCuota } from '../actions'
import { CATALOGOS, type TipoCuota } from '../catalogos'
import { AVISO_IMPORTE, AVISO_NOMBRE } from '../messages'
import { tipoCuotaSchema, type TipoCuotaInput } from '../schemas'
import { CamposCatalogo } from './campos-catalogo'

const FORM_ID = 'tipo-cuota-form'
const config = CATALOGOS.cuotas

const ACCESOS = [
  { name: 'accesoTelefono', label: 'Acceso con teléfono (vehicular)' },
  { name: 'accesoTarjeta', label: 'Acceso con tarjeta (peatonal)' },
] as const

const valoresDe = (item?: TipoCuota): TipoCuotaInput => ({
  nombre: item?.nombre ?? '',
  importe: item ? String(item.importe) : '',
  accesoTelefono: item?.accesoTelefono ?? true,
  accesoTarjeta: item?.accesoTarjeta ?? true,
})

export function TipoCuotaDialog({ item, trigger }: { item?: TipoCuota; trigger: ReactNode }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(tipoCuotaSchema), defaultValues: valoresDe(item) })
  const [nombre, importe] = useWatch({ control, name: ['nombre', 'importe'] })
  const avisos: string[] = []
  if (item && Number(String(importe).trim()) !== item.importe) avisos.push(AVISO_IMPORTE)
  if (item && nombre.trim() !== item.nombre) avisos.push(AVISO_NOMBRE)

  async function onSubmit(values: { nombre: string; importe: number; accesoTelefono: boolean; accesoTarjeta: boolean }) {
    const result = await guardarTipoCuota(item?.id ?? null, values)
    if (result.ok) {
      toast.success(config.guardado)
      setOpen(false)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  function handleOpenChange(next: boolean) {
    if (next) reset(valoresDe(item))
    setOpen(next)
  }

  return (
    <FormDialog
      size="sm"
      title={`${item ? 'Editar' : 'Agregar'} ${config.singular}`}
      description={config.descripcion}
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
      <form id={FORM_ID} onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
        <CamposCatalogo register={register} errors={errors} etiquetaMonto={config.etiquetaMonto} avisos={avisos} />
        <fieldset className="grid gap-3">
          <legend className="mb-2 text-xs font-medium">Accesos que incluye</legend>
          {ACCESOS.map((a) => (
            <div key={a.name} className="flex items-center gap-2">
              <Controller
                control={control}
                name={a.name}
                render={({ field }) => (
                  <Checkbox id={a.name} checked={field.value} onCheckedChange={(v) => field.onChange(v === true)} />
                )}
              />
              <Label htmlFor={a.name}>{a.label}</Label>
            </div>
          ))}
        </fieldset>
      </form>
    </FormDialog>
  )
}
