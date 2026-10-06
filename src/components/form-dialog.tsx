'use client'

import type { ReactNode } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

const SIZE_CLASS = {
  sm: 'sm:max-w-[440px]',
  md: 'sm:max-w-[560px]',
  lg: 'sm:max-w-[720px]',
} as const

export function FormDialog({
  title,
  description,
  trigger,
  open,
  onOpenChange,
  children,
  footer,
  size = 'md',
}: {
  title: string
  description?: string
  trigger?: ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className={SIZE_CLASS[size]}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className={description ? undefined : 'sr-only'}>
            {description ?? title}
          </DialogDescription>
        </DialogHeader>
        {/* El anillo de foco de los campos sobresale 4 px; el relleno evita que el scroll lo recorte. */}
        <div data-slot="form-dialog-body" className="max-h-[60vh] overflow-y-auto px-1 pb-1">
          {children}
        </div>
        {footer ? <DialogFooter className="border-t border-border pt-4">{footer}</DialogFooter> : null}
      </DialogContent>
    </Dialog>
  )
}
