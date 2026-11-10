'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState, type ReactNode } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { FormDialog } from '@/components/form-dialog'
import { Button } from '@/components/ui/button'
import { guardarCatalogo } from '../actions'
import { CATALOGOS, type CatalogoSimple, type ElementoCatalogo } from '../catalogos'
import { AVISO_NOMBRE } from '../messages'
import { catalogoSchema, type CatalogoInput } from '../schemas'
import { CamposCatalogo } from './campos-catalogo'

const FORM_ID = 'catalogo-form'

const valoresDe = (item?: ElementoCatalogo): CatalogoInput => ({
  nombre: item?.nombre ?? '',
  importe: item ? String(item.importe) : '',
})

export function CatalogoDialog({
  catalogo,
  item,
  trigger,
}: {
  catalogo: CatalogoSimple
  item?: ElementoCatalogo
  trigger: ReactNode
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const config = CATALOGOS[catalogo]
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(catalogoSchema), defaultValues: valoresDe(item) })
  const nombre = useWatch({ control, name: 'nombre' })
  const avisos = item && nombre.trim() !== item.nombre ? [AVISO_NOMBRE] : []

  async function onSubmit(values: { nombre: string; importe: number }) {
    const result = await guardarCatalogo(catalogo, item?.id ?? null, values)
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
      </form>
    </FormDialog>
  )
}
