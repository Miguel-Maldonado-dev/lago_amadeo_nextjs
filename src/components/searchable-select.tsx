'use client'

import { useState } from 'react'
import { ChevronsUpDown, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
  disabled,
  allowClear,
  id,
  'aria-labelledby': ariaLabelledby,
}: {
  options: { value: string; label: string }[]
  value: string | null
  onChange: (v: string | null) => void
  placeholder: string
  disabled?: boolean
  allowClear?: boolean
  id?: string
  'aria-labelledby'?: string
}) {
  const [open, setOpen] = useState(false)
  const selected = options.find((o) => o.value === value)

  return (
    <div className="flex items-center gap-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            aria-labelledby={ariaLabelledby}
            variant="secondary"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="h-10 w-full flex-1 justify-between font-normal"
          >
            <span className={selected ? 'truncate' : 'truncate text-muted-foreground'}>
              {selected?.label ?? placeholder}
            </span>
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-(--radix-popover-trigger-width) rounded-lg p-0 shadow-elevated" align="start">
          <Command
            filter={(itemValue, search) =>
              itemValue.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
            }
          >
            <CommandInput placeholder="Buscar..." />
            <CommandList>
              <CommandEmpty>Sin resultados</CommandEmpty>
              {options.map((o) => (
                <CommandItem
                  key={o.value}
                  value={o.label}
                  onSelect={() => {
                    onChange(o.value)
                    setOpen(false)
                  }}
                >
                  {o.label}
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {allowClear && selected && !disabled && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Limpiar"
          onClick={() => onChange(null)}
        >
          <X />
        </Button>
      )}
    </div>
  )
}
