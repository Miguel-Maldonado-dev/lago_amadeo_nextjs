import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function SectionCard({
  title,
  description,
  icon: Icon,
  action,
  children,
  className,
  flush = false,
}: {
  title: string
  description?: string
  icon?: LucideIcon
  action?: ReactNode
  children: ReactNode
  className?: string
  /** Cuerpo sin relleno, para tablas que van de borde a borde como en las demás pantallas. */
  flush?: boolean
}) {
  return (
    <Card className={cn('gap-0 py-0', className)}>
      <div className={cn('flex justify-between gap-4 p-5', description ? 'items-start' : 'items-center')}>
        <div className="flex items-start gap-3">
          {Icon ? (
            <Icon data-slot="section-card-icon" className="mt-0.5 size-6 shrink-0" aria-hidden="true" />
          ) : null}
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold">{title}</h2>
            {description ? <p className="text-sm text-secondary-foreground">{description}</p> : null}
          </div>
        </div>
        {action}
      </div>
      <div data-slot="section-card-body" className={flush ? undefined : 'px-5 pb-5'}>
        {children}
      </div>
    </Card>
  )
}
