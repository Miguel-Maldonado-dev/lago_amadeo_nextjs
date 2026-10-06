'use client'

import { Search, UserRound } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { FilterBar } from '@/components/filter-bar'
import { LabeledSelect } from '@/components/labeled-select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { todayISO } from '@/lib/dates'

export function PagosUsuarioFiltros({
  usuarios,
  usuario: usuarioProp = '',
  inicio: inicioProp = '',
  fin: finProp = '',
}: {
  usuarios: { id: string; user_name: string }[]
  usuario?: string
  inicio?: string
  fin?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [usuario, setUsuario] = useState(usuarioProp)
  const [inicio, setInicio] = useState(inicioProp)
  const [fin, setFin] = useState(finProp)
  const hoy = todayISO()

  function onFinChange(value: string) {
    if (!inicio) {
      toast.error('Primero debes seleccionar la fecha de inicio.')
      return
    }
    setFin(value)
  }

  function buscar() {
    if (!usuario || !inicio || !fin) {
      toast.error('Debes seleccionar todos los filtros para poder generar el reporte.')
      return
    }
    const qs = new URLSearchParams({ tab: 'usuario', usuario, inicio, fin })
    router.replace(`${pathname}?${qs.toString()}`)
  }

  return (
    <FilterBar
      onClear={() => {
        setUsuario('')
        setInicio('')
        setFin('')
        router.replace(`${pathname}?tab=usuario`)
      }}
    >
      <LabeledSelect
        id="rep-usuario"
        label="Usuario"
        icon={UserRound}
        options={usuarios.map((u) => ({ value: u.id, label: u.user_name }))}
        placeholder="Selecciona un usuario"
        value={usuario || null}
        onChange={(v) => setUsuario(v ?? '')}
      />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="filtro-inicio" className="text-xs font-medium text-muted-foreground">
          Fecha inicio
        </Label>
        <Input
          id="filtro-inicio"
          type="date"
          max={hoy}
          value={inicio}
          onChange={(e) => setInicio(e.target.value)}
          className="w-44"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="filtro-fin" className="text-xs font-medium text-muted-foreground">
          Fecha fin
        </Label>
        <Input
          id="filtro-fin"
          type="date"
          min={inicio || undefined}
          max={hoy}
          value={fin}
          onChange={(e) => onFinChange(e.target.value)}
          className="w-44"
        />
      </div>
      <Button type="button" onClick={buscar}>
        <Search />
        Buscar
      </Button>
    </FilterBar>
  )
}
