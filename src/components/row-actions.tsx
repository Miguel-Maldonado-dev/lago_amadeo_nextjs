'use client'

import Link from 'next/link'
import { MoreVertical, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export type RowActionItem = {
  label: string
  icon?: LucideIcon
  onSelect?: () => void
  href?: string
  tone?: 'default' | 'danger'
  disabled?: boolean
}

export function RowActions({ items, label = 'Acciones' }: { items: RowActionItem[]; label?: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={label}>
          <MoreVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        {items.map(({ label: itemLabel, icon: Icon, onSelect, href, tone, disabled }) => {
          const variant = tone === 'danger' ? 'destructive' : 'default'
          return href ? (
            <DropdownMenuItem key={itemLabel} asChild disabled={disabled} variant={variant}>
              <Link href={href}>
                {Icon ? <Icon aria-hidden="true" /> : null}
                {itemLabel}
              </Link>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem key={itemLabel} onSelect={onSelect} disabled={disabled} variant={variant}>
              {Icon ? <Icon aria-hidden="true" /> : null}
              {itemLabel}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
