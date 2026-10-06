'use client'

import { Download } from 'lucide-react'
import { useState } from 'react'
import { LabeledSelect } from '@/components/labeled-select'
import { Button } from '@/components/ui/button'

const OPTIONS = [
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: 'BOTH', label: 'BOTH' },
]

export function SalidaExport({ anio, mes, hayFilas }: { anio: number; mes: number; hayFilas: boolean }) {
  const [salida, setSalida] = useState('1')

  return (
    <>
      <LabeledSelect
        id="export-salida"
        label="Salida"
        value={salida}
        onChange={(v) => setSalida(v ?? '1')}
        options={OPTIONS}
      />
      {hayFilas ? (
        <Button asChild variant="secondary">
          <a href={`/api/exports/eldesgate?mes=${mes}&anio=${anio}&salida=${salida}`}>
            <Download />
            Descargar CSV
          </a>
        </Button>
      ) : (
        <Button type="button" variant="secondary" disabled>
          <Download />
          Descargar CSV
        </Button>
      )}
    </>
  )
}
