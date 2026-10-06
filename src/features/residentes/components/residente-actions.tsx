'use client'

import { Pencil, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Button } from '@/components/ui/button'
import type { Tables } from '@/lib/supabase/types'
import { eliminarResidente } from '../actions'
import { MSG_RESIDENTE_ELIMINADO } from '../messages'
import { ResidenteDialog } from './residente-dialog'

export function ResidenteActions({
  domicilioId,
  residente,
}: {
  domicilioId: number
  residente: Tables<'residentes'>
}) {
  const router = useRouter()

  async function onConfirm() {
    const result = await eliminarResidente(residente.id, domicilioId)
    if (!result.ok) throw new Error(result.error)
    toast.success(MSG_RESIDENTE_ELIMINADO)
    router.refresh()
  }

  return (
    <div className="flex justify-end gap-1">
      <ResidenteDialog
        domicilioId={domicilioId}
        residente={residente}
        trigger={
          <Button variant="ghost" size="icon-sm" aria-label={`Editar ${residente.nombre}`}>
            <Pencil />
          </Button>
        }
      />
      <ConfirmDialog
        title="Eliminar Residente"
        description="¿Deseas eliminar este residente? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        onConfirm={onConfirm}
        trigger={
          <Button variant="ghost" size="icon-sm" className="text-danger" aria-label={`Eliminar ${residente.nombre}`}>
            <Trash2 />
          </Button>
        }
      />
    </div>
  )
}
