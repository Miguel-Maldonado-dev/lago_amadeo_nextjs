'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { FormDialog } from '@/components/form-dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { currentPeriod } from '@/lib/dates'
import { generarCuotas } from '../actions'
import { MSG_CUOTAS_GENERADAS } from '../messages'

const MSG_ERROR_GENERICO = 'Ocurrió un error inesperado. Intenta de nuevo.'
const FORM_ID = 'generar-cuotas-form'

export function GenerarCuotasDialog({
  anios,
  meses,
}: {
  anios: number[]
  meses: { id: number; name: string }[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [anio, setAnio] = useState(() => currentPeriod().anio)
  const [mes, setMes] = useState(() => currentPeriod().mes)
  const [submitting, setSubmitting] = useState(false)

  async function onGenerar() {
    setSubmitting(true)
    try {
      const result = await generarCuotas({ anio, mes })
      if (result.ok) {
        toast.success(MSG_CUOTAS_GENERADAS)
        setOpen(false)
        router.refresh()
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error(MSG_ERROR_GENERICO)
    } finally {
      setSubmitting(false)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void onGenerar()
  }

  function handleOpenChange(next: boolean) {
    if (next) {
      const p = currentPeriod()
      setAnio(p.anio)
      setMes(p.mes)
    }
    setOpen(next)
  }

  return (
    <FormDialog
      title="Generar Cuotas"
      description="Genera la cuota del periodo seleccionado para todos los domicilios con tipo de cuota asignado."
      trigger={<Button>Generar Cuotas</Button>}
      open={open}
      onOpenChange={handleOpenChange}
      footer={
        <>
          <Button variant="secondary" type="button" disabled={submitting} onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID} loading={submitting}>
            Generar
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} className="grid gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="generar-anio" className="text-xs font-medium">
            Año
          </Label>
          <Select value={String(anio)} onValueChange={(v) => setAnio(Number(v))}>
            <SelectTrigger id="generar-anio" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {anios.map((a) => (
                <SelectItem key={a} value={String(a)}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="generar-mes" className="text-xs font-medium">
            Mes
          </Label>
          <Select value={String(mes)} onValueChange={(v) => setMes(Number(v))}>
            <SelectTrigger id="generar-mes" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {meses.map((m) => (
                <SelectItem key={m.id} value={String(m.id)}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </form>
    </FormDialog>
  )
}
