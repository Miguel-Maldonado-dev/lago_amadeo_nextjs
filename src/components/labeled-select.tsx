'use client'

import type { LucideIcon } from 'lucide-react'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function LabeledSelect({
  id,
  label,
  icon: Icon,
  value,
  onChange,
  options,
  placeholder = 'Seleccionar',
  allLabel,
}: {
  id: string
  label: string
  icon?: LucideIcon
  value: string | null
  onChange: (v: string | null) => void
  options: { value: string; label: string }[]
  placeholder?: string
  allLabel?: string
}) {
  return (
    <div className="flex min-w-[160px] flex-col gap-1.5">
      <Label htmlFor={id} className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      <Select
        value={value ?? (allLabel ? '__all__' : '')}
        onValueChange={(v) => onChange(v === '__all__' ? null : v)}
      >
        <SelectTrigger id={id} className="w-full">
          {Icon && <Icon className="size-4 text-muted-foreground" />}
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {allLabel && <SelectItem value="__all__">{allLabel}</SelectItem>}
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
