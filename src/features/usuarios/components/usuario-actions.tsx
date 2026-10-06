'use client'

import { Pencil, RotateCcw, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Button } from '@/components/ui/button'
import type { Tables, Views } from '@/lib/supabase/types'
import { cambiarEstadoUsuario } from '../actions'
import { MSG_USUARIO_ACTIVADO, MSG_USUARIO_DESACTIVADO } from '../messages'
import { EditUserDialog } from './edit-user-dialog'

export function UsuarioActions({
  usuario,
  roles,
  currentUserId,
}: {
  usuario: Views<'users_info'>
  roles: Tables<'roles'>[]
  currentUserId: string
}) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const id = usuario.id!
  const esUsuarioActual = id === currentUserId

  async function cambiarEstado(isActive: boolean) {
    const result = await cambiarEstadoUsuario(id, isActive)
    if (!result.ok) throw new Error(result.error)
    toast.success(isActive ? MSG_USUARIO_ACTIVADO : MSG_USUARIO_DESACTIVADO)
    router.refresh()
  }

  async function activar() {
    setPending(true)
    try {
      await cambiarEstado(true)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ocurrió un error inesperado. Intenta de nuevo.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex justify-end gap-1">
      <EditUserDialog
        usuario={usuario}
        roles={roles}
        esUsuarioActual={esUsuarioActual}
        trigger={
          <Button variant="ghost" size="icon-sm" aria-label="Editar usuario">
            <Pencil />
          </Button>
        }
      />
      {usuario.is_active && !esUsuarioActual && (
        <ConfirmDialog
          title="Desactivar Usuario"
          description="¿Deseas desactivar este usuario? Podrás reactivarlo después."
          confirmLabel="Desactivar"
          onConfirm={() => cambiarEstado(false)}
          trigger={
            <Button variant="ghost" size="icon-sm" aria-label="Desactivar usuario" className="text-danger">
              <Trash2 />
            </Button>
          }
        />
      )}
      {!usuario.is_active && (
        <Button variant="ghost" size="icon-sm" aria-label="Activar usuario" disabled={pending} onClick={activar}>
          <RotateCcw />
        </Button>
      )}
    </div>
  )
}
