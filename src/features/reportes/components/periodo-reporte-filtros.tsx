'use client'

import { Calendar, Search } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { FilterBar } from '@/components/filter-bar'
import { LabeledSelect } from '@/components/labeled-select'
import { Button } from '@/components/ui/button'

export function PeriodoReporteFiltros({
  anios,
  meses,
  anio,
  mes,
  tab,
  extra,
}: {
  anios: number[]
  meses: { id: number; name: string }[]
  anio: number
  mes: number
  tab: string
  extra?: ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const base = (a: number, m: number) => `${pathname}?tab=${tab}&anio=${a}&mes=${m}`

  return (
    <FilterBar onClear={() => router.replace(`${pathname}?tab=${tab}`)}>
      <LabeledSelect
        id={`${tab}-anio`}
        label="Año"
        icon={Calendar}
        value={String(anio)}
        onChange={(v) => v && router.replace(base(Number(v), mes))}
        options={anios.map((a) => ({ value: String(a), label: String(a) }))}
      />
      <LabeledSelect
        id={`${tab}-mes`}
        label="Mes"
        icon={Calendar}
        value={String(mes)}
        onChange={(v) => v && router.replace(base(anio, Number(v)))}
        options={meses.map((m) => ({ value: String(m.id), label: m.name }))}
      />
      <Button type="button" onClick={() => router.replace(`${base(anio, mes)}&buscar=1`)}>
        <Search />
        Buscar
      </Button>
      {extra && <div className="flex flex-wrap items-end gap-3 md:ml-auto">{extra}</div>}
    </FilterBar>
  )
}
