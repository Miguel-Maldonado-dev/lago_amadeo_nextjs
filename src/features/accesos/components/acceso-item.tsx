'use client'

import { CreditCard, Pencil, Phone, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Button } from '@/components/ui/button'
import { eliminarTarjeta, eliminarTelefono } from '../actions'
import { MSG_TARJETA_ELIMINADA, MSG_TELEFONO_ELIMINADO } from '../messages'
import { NumeroDialog, type AccesoKind } from './numero-dialog'

const KINDS = {
  telefono: { title: 'Eliminar Número', deleted: MSG_TELEFONO_ELIMINADO, remove: eliminarTelefono },
  tarjeta: { title: 'Eliminar Tarjeta', deleted: MSG_TARJETA_ELIMINADA, remove: eliminarTarjeta },
} as const

export function AccesoItem({
  kind,
  domicilioId,
  id,
  valor,
}: {
  kind: AccesoKind
  domicilioId: number
  id: number
  valor: string
}) {
  const router = useRouter()
  const config = KINDS[kind]

  async function onConfirm() {
    const result = await config.remove(id, domicilioId)
    if (!result.ok) throw new Error(result.error)
    toast.success(config.deleted)
    router.refresh()
  }

  return (
    <li className="flex items-center justify-between gap-3 rounded-md border border-border bg-card px-3 py-2">
      <div className="flex items-center gap-2">
        {kind === 'telefono' ? (
          <Phone className="size-4 text-muted-foreground" />
        ) : (
          <CreditCard className="size-4 text-muted-foreground" />
        )}
        <span className="text-sm font-medium tabular-nums">{valor}</span>
      </div>
      <div className="flex gap-1">
        <NumeroDialog
          kind={kind}
          domicilioId={domicilioId}
          item={{ id, valor }}
          trigger={
            <Button variant="ghost" size="icon-sm" aria-label={`Editar ${valor}`}>
              <Pencil />
            </Button>
          }
        />
        <ConfirmDialog
          title={config.title}
          description="¿Deseas eliminar este registro? Esta acción no se puede deshacer."
          confirmLabel="Eliminar"
          onConfirm={onConfirm}
          trigger={
            <Button variant="ghost" size="icon-sm" className="text-danger" aria-label={`Eliminar ${valor}`}>
              <Trash2 />
            </Button>
          }
        />
      </div>
    </li>
  )
}
