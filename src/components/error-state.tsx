'use client'

import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ErrorState({
  title = 'Ocurrió un error',
  description = 'No fue posible cargar la información. Intenta de nuevo.',
  onRetry,
}: {
  title?: string
  description?: string
  onRetry?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-danger-light text-danger">
        <AlertCircle className="size-6" aria-hidden="true" />
      </div>
      <p className="text-base font-semibold">{title}</p>
      <p className="max-w-sm text-sm text-secondary-foreground">{description}</p>
      {onRetry ? (
        <Button variant="secondary" onClick={onRetry}>
          Reintentar
        </Button>
      ) : null}
    </div>
  )
}
