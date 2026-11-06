'use client'

import { FilterX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function FilterBar({
  children,
  onClear,
  clearLabel = 'Limpiar filtros',
  actions,
}: {
  children: React.ReactNode
  onClear?: () => void
  clearLabel?: string
  /** Acciones sobre los resultados filtrados (p. ej. exportar), al final de la barra. */
  actions?: React.ReactNode
}) {
  return (
    <Card className="flex flex-row flex-wrap items-end gap-3 p-4">
      {children}
      {onClear && (
        <Button type="button" variant="secondary" onClick={onClear} className="md:ml-auto">
          <FilterX /> {clearLabel}
        </Button>
      )}
      {actions}
    </Card>
  )
}
