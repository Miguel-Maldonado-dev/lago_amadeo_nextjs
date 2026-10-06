import type { ReactNode } from 'react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function SectionCard({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <Card className={cn('gap-0 py-0', className)}>
      <div className="flex items-start justify-between gap-4 p-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold">{title}</h2>
          {description ? <p className="text-sm text-secondary-foreground">{description}</p> : null}
        </div>
        {action}
      </div>
      <div className="px-5 pb-5">{children}</div>
    </Card>
  )
}
