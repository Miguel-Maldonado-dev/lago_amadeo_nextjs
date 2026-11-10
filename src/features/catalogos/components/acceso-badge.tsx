import { Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function AccesoBadge({ activo }: { activo: boolean }) {
  return activo ? (
    <Badge variant="success">
      <Check aria-hidden="true" />
      Sí
    </Badge>
  ) : (
    <span className="text-muted-foreground">—</span>
  )
}
