'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent, type ReactNode } from 'react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { FormDialog } from '@/components/form-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Tables } from '@/lib/supabase/types'
import { editarCuota, eliminarDescuento, eliminarRecargo, obtenerAjustesCuota } from '../actions'
import { MSG_CUOTA_EDITADA, MSG_DESCUENTO_ELIMINADO, MSG_RECARGO_ELIMINADO } from '../messages'
import type { CuotaInfo } from '../queries'

const NONE = '0'
const MSG_ERROR_GENERICO = 'Ocurrió un error inesperado. Intenta de nuevo.'
const FORM_ID = 'editar-cuota-form'

type Ajustes = { descuento: Tables<'descuento_cuota'> | null; recargo: Tables<'recargo_cuota'> | null }

export function EditarCuotaDialog({
  cuota,
  domicilioId,
  conceptosDescuento,
  conceptosRecargo,
  trigger,
}: {
  cuota: CuotaInfo
  domicilioId: number
  conceptosDescuento: Tables<'conceptos_descuento'>[]
  conceptosRecargo: Tables<'conceptos_recargo'>[]
  trigger: ReactNode
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [ajustes, setAjustes] = useState<Ajustes>({ descuento: null, recargo: null })
  const [descuentoSel, setDescuentoSel] = useState(NONE)
  const [recargoSel, setRecargoSel] = useState(NONE)
  const [submitting, setSubmitting] = useState(false)

  async function cargarAjustes() {
    try {
      const result = await obtenerAjustesCuota(cuota.id!)
      if (result.ok) setAjustes(result.data)
      else toast.error(result.error)
    } catch {
      toast.error(MSG_ERROR_GENERICO)
    }
  }

  function handleOpenChange(next: boolean) {
    if (next) {
      setAjustes({ descuento: null, recargo: null })
      setDescuentoSel(NONE)
      setRecargoSel(NONE)
      void cargarAjustes()
    }
    setOpen(next)
  }

  async function quitar(tipo: 'descuento' | 'recargo') {
    const row = ajustes[tipo]
    if (!row) return
    const result =
      tipo === 'descuento' ? await eliminarDescuento(row.id, domicilioId) : await eliminarRecargo(row.id, domicilioId)
    if (!result.ok) throw new Error(result.error)
    toast.success(tipo === 'descuento' ? MSG_DESCUENTO_ELIMINADO : MSG_RECARGO_ELIMINADO)
    await cargarAjustes()
    router.refresh()
  }

  async function onGuardar() {
    setSubmitting(true)
    try {
      const result = await editarCuota(cuota.id!, domicilioId, {
        conceptoDescuentoId: descuentoSel !== NONE ? Number(descuentoSel) : undefined,
        conceptoRecargoId: recargoSel !== NONE ? Number(recargoSel) : undefined,
      })
      if (result.ok) {
        toast.success(MSG_CUOTA_EDITADA)
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
    void onGuardar()
  }

  return (
    <FormDialog
      title="Editar Cuota"
      description="Aplica o quita el descuento y el recargo de esta cuota."
      trigger={trigger}
      open={open}
      onOpenChange={handleOpenChange}
      footer={
        <>
          <Button variant="secondary" type="button" disabled={submitting} onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID} loading={submitting}>
            Guardar
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} className="grid gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cuota-descuento" className="text-xs font-medium">
            Descuento
          </Label>
          <Select value={descuentoSel} onValueChange={setDescuentoSel} disabled={ajustes.descuento !== null}>
            <SelectTrigger id="cuota-descuento" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>Sin descuento</SelectItem>
              {conceptosDescuento.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {ajustes.descuento && (
            <div className="flex items-center justify-between gap-2">
              <Badge variant="neutral">
                Aplicado: {conceptosDescuento.find((c) => c.id === ajustes.descuento!.concepto_descuento_id)?.nombre}
              </Badge>
              <ConfirmDialog
                title="Quitar descuento"
                description="¿Deseas quitar el descuento de esta cuota?"
                confirmLabel="Quitar"
                onConfirm={() => quitar('descuento')}
                trigger={
                  <Button type="button" variant="destructive" size="sm">
                    Quitar
                  </Button>
                }
              />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cuota-recargo" className="text-xs font-medium">
            Recargo
          </Label>
          <Select value={recargoSel} onValueChange={setRecargoSel} disabled={ajustes.recargo !== null}>
            <SelectTrigger id="cuota-recargo" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>Sin recargo</SelectItem>
              {conceptosRecargo.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {ajustes.recargo && (
            <div className="flex items-center justify-between gap-2">
              <Badge variant="neutral">
                Aplicado: {conceptosRecargo.find((c) => c.id === ajustes.recargo!.concepto_recargo_id)?.nombre}
              </Badge>
              <ConfirmDialog
                title="Quitar recargo"
                description="¿Deseas quitar el recargo de esta cuota?"
                confirmLabel="Quitar"
                onConfirm={() => quitar('recargo')}
                trigger={
                  <Button type="button" variant="destructive" size="sm">
                    Quitar
                  </Button>
                }
              />
            </div>
          )}
        </div>
      </form>
    </FormDialog>
  )
}
