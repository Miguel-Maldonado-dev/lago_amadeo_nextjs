'use client'

import { Pencil } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { FormDialog } from '@/components/form-dialog'
import { Button } from '@/components/ui/button'
import { todayISO } from '@/lib/dates'
import type { Tables } from '@/lib/supabase/types'
import { actualizarDomicilio } from '../actions'
import { MSG_DOMICILIO_ACTUALIZADO } from '../messages'
import type { DomicilioInfo } from '../queries'
import type { DomicilioInput } from '../schemas'
import { DomicilioForm } from './domicilio-form'

const FORM_ID = 'edit-domicilio-form'

export function EditDomicilioDialog({
  domicilio,
  conceptos,
  conceptoActual,
  trigger,
}: {
  domicilio: DomicilioInfo
  conceptos: Tables<'conceptos_pago'>[]
  conceptoActual: number | null
  trigger?: ReactNode
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(input: DomicilioInput) {
    setSubmitting(true)
    try {
      const result = await actualizarDomicilio(domicilio.id!, input)
      if (result.ok) {
        toast.success(MSG_DOMICILIO_ACTUALIZADO)
        setOpen(false)
        router.refresh()
      } else {
        toast.error(result.error)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <FormDialog
      title="Editar Domicilio"
      description="Actualiza los datos del domicilio."
      trigger={
        trigger ?? (
          <Button variant="ghost" size="icon" aria-label="Editar domicilio">
            <Pencil />
          </Button>
        )
      }
      open={open}
      onOpenChange={setOpen}
      footer={
        <>
          <Button variant="secondary" type="button" disabled={submitting} onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID} loading={submitting}>
            Guardar
          </Button>
        </>
      }
    >
      <DomicilioForm
        defaultValues={{
          direccion: domicilio.direccion ?? '',
          fechaAlta: domicilio.fecha_alta ?? todayISO(),
          conceptoId: conceptoActual ?? undefined,
          observaciones: domicilio.observaciones ?? '',
        }}
        conceptos={conceptos}
        onSubmit={onSubmit}
        submitLabel="Guardar"
        allowSinAsignar={conceptoActual === null}
        formId={FORM_ID}
        hideSubmit
      />
    </FormDialog>
  )
}
