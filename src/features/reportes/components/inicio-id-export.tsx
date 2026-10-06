'use client'

import { Download } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function InicioIdExport({ anio, mes, hayFilas }: { anio: number; mes: number; hayFilas: boolean }) {
  const [inicioID, setInicioID] = useState('')
  const habilitado = hayFilas && Number(inicioID) >= 1

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="export-inicio-id" className="text-xs font-medium text-muted-foreground">
          ID Inicio
        </Label>
        <Input
          id="export-inicio-id"
          inputMode="numeric"
          placeholder="ID Inicio"
          value={inicioID}
          onChange={(e) => setInicioID(e.target.value.replace(/\D/g, ''))}
          className="w-32"
        />
      </div>
      {habilitado ? (
        <Button asChild variant="secondary">
          <a href={`/api/exports/zkteco?mes=${mes}&anio=${anio}&inicioID=${Number(inicioID)}`}>
            <Download />
            Descargar TXT
          </a>
        </Button>
      ) : (
        <Button type="button" variant="secondary" disabled>
          <Download />
          Descargar TXT
        </Button>
      )}
    </>
  )
}
