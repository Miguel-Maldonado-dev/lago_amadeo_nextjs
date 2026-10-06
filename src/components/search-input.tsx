'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

export function SearchInput({
  value,
  onChange,
  placeholder,
  id,
  'aria-label': ariaLabel,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  id?: string
  'aria-label'?: string
}) {
  return (
    <div className="relative min-w-[240px] flex-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        id={id}
        className="pl-9"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
      />
    </div>
  )
}
