import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Campos = { nombre: string; importe: string | number }

/** Nombre e importe/monto, compartidos por los formularios de todos los catálogos. */
export function CamposCatalogo<T extends Campos>({
  register,
  errors,
  etiquetaMonto,
  avisos,
}: {
  register: UseFormRegister<T>
  errors: FieldErrors<T>
  etiquetaMonto: string
  avisos: string[]
}) {
  const reg = register as unknown as UseFormRegister<Campos>
  const err = errors as FieldErrors<Campos>
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="catalogo-nombre" className="text-xs font-medium">
          Nombre <span className="text-danger">*</span>
        </Label>
        <Input id="catalogo-nombre" maxLength={80} {...reg('nombre')} />
        {err.nombre && <p className="text-xs text-danger">{err.nombre.message}</p>}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="catalogo-importe" className="text-xs font-medium">
          {etiquetaMonto} <span className="text-danger">*</span>
        </Label>
        <Input id="catalogo-importe" inputMode="decimal" placeholder="0.00" {...reg('importe')} />
        {err.importe && <p className="text-xs text-danger">{err.importe.message}</p>}
      </div>
      {avisos.map((a) => (
        <p key={a} className="text-xs text-warning">
          {a}
        </p>
      ))}
    </>
  )
}
