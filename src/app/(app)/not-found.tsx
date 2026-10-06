import Link from 'next/link'
import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <EmptyState
      title="No encontrado"
      description="La página que buscas no existe o fue movida."
      action={
        <Button asChild>
          <Link href="/">Volver al inicio</Link>
        </Button>
      }
    />
  )
}
