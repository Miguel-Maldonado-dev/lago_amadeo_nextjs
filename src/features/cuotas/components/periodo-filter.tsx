'use client'

import { Calendar, ListFilter } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { LabeledSelect } from '@/components/labeled-select'

export function PeriodoFilter({
  anios,
  meses,
  anio,
  mes,
  estatus = null,
  estatusOptions = [],
  onEstatusChange,
}: {
  anios: number[]
  meses: { id: number; name: string }[]
  anio: number
  mes: number
  estatus?: string | null
  estatusOptions?: string[]
  onEstatusChange?: (estatus: string | null) => void
}) {
  const router = useRouter()
  const pathname = usePathname()

  function go(a: number, m: number) {
    router.replace(`${pathname}?anio=${a}&mes=${m}`)
  }

  return (
    <>
      <LabeledSelect
        id="cuotas-anio"
        label="Año"
        icon={Calendar}
        value={String(anio)}
        onChange={(v) => v && go(Number(v), mes)}
        options={anios.map((a) => ({ value: String(a), label: String(a) }))}
      />
      <LabeledSelect
        id="cuotas-mes"
        label="Mes"
        icon={Calendar}
        value={String(mes)}
        onChange={(v) => v && go(anio, Number(v))}
        options={meses.map((m) => ({ value: String(m.id), label: m.name }))}
      />
      <LabeledSelect
        id="cuotas-estatus"
        label="Estatus"
        icon={ListFilter}
        allLabel="Todos"
        value={estatus}
        onChange={(v) => onEstatusChange?.(v)}
        options={estatusOptions.map((e) => ({ value: e, label: e }))}
      />
    </>
  )
}
