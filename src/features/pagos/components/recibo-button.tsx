'use client'

import { FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ReciboDialog } from './recibo-dialog'

export function ReciboButton({ pagoId }: { pagoId: number }) {
  return (
    <ReciboDialog
      pagoId={pagoId}
      trigger={
        <Button variant="secondary" size="sm">
          <FileText />
          Recibo
        </Button>
      }
    />
  )
}
