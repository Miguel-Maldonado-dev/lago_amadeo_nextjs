'use client'

import { useId } from 'react'
import { useWatch, type Control } from 'react-hook-form'
import { CopyButton } from '@/components/copy-button'
import { Label } from '@/components/ui/label'
import { desglosarCodigoTarjeta } from '../codigo-tarjeta'
import type { NumeroInput } from '../schemas'

function ValorCopiable({ label, value }: { label: string; value: string }) {
  const id = useId()
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Label htmlFor={id} className="text-xs font-medium">
        {label}
      </Label>
      <div className="flex h-10 items-center rounded-md border border-border bg-muted pr-0.5 pl-3 has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-ring has-[input:focus-visible]:ring-offset-2 has-[input:focus-visible]:ring-offset-background">
        <input
          id={id}
          readOnly
          value={value}
          placeholder="—"
          className="min-w-0 flex-1 bg-transparent text-sm tabular-nums outline-none placeholder:text-muted-foreground"
        />
        <CopyButton value={value} label={`Copiar ${label}`} disabled={!value} />
      </div>
    </div>
  )
}

/**
 * Facility y Card ID del código que se está escribiendo. Se suscribe solo al campo `valor`,
 * así que escribir vuelve a renderizar este bloque y no todo el formulario.
 */
export function CodigoTarjetaDesglose({ control }: { control: Control<NumeroInput> }) {
  const valor = useWatch({ control, name: 'valor' })
  const desglose = desglosarCodigoTarjeta(valor ?? '')

  return (
    <div className="flex flex-col gap-1.5">
      <div className="grid grid-cols-2 gap-3">
        <ValorCopiable label="Facility" value={desglose.ok ? String(desglose.facility) : ''} />
        <ValorCopiable label="Card ID" value={desglose.ok ? String(desglose.cardId) : ''} />
      </div>
      {!desglose.ok && desglose.motivo === 'excede-32-bits' ? (
        <p className="text-xs text-danger">El código excede 32 bits</p>
      ) : null}
    </div>
  )
}
