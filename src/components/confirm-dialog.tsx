'use client'

import { useState, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function ConfirmDialog({
  title,
  description,
  confirmLabel = 'Confirmar',
  trigger,
  onConfirm,
  tone = 'danger',
}: {
  title: string
  description: string
  confirmLabel?: string
  trigger: ReactNode
  onConfirm: () => Promise<void> | void
  tone?: 'danger' | 'default'
}) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)

  async function handleConfirm() {
    setPending(true)
    try {
      await onConfirm()
      setOpen(false)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Ocurrió un error inesperado. Intenta de nuevo.',
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <div className="flex items-start gap-4">
          <div
            className={cn(
              'flex size-10 shrink-0 items-center justify-center rounded-full',
              tone === 'danger' ? 'bg-danger-light text-danger' : 'bg-primary-light text-primary',
            )}
          >
            <AlertTriangle className="size-5" aria-hidden="true" />
          </div>
          <AlertDialogHeader className="place-items-start text-left">
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel variant="secondary" disabled={pending}>
            Cancelar
          </AlertDialogCancel>
          <Button
            variant={tone === 'danger' ? 'destructive' : 'default'}
            loading={pending}
            onClick={handleConfirm}
          >
            {confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
