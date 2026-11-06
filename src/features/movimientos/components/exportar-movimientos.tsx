'use client'

import { useState } from 'react'
import { Download, FileSpreadsheet, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { todayISO } from '@/lib/dates'
import { descargar } from '@/lib/download'
import type { Views } from '@/lib/supabase/types'
import {
  describirFiltros,
  filasExport,
  nombreArchivo,
  resumenExport,
  type FiltrosMovimientos,
} from '../export/datos'

type Formato = 'xlsx' | 'pdf'

const MIME: Record<Formato, string> = {
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pdf: 'application/pdf',
}

/** Exporta las filas ya filtradas de la tabla. Las librerías de Excel y PDF se cargan solo al exportar. */
export function ExportarMovimientos({
  rows,
  filtros,
}: {
  rows: Views<'movimientos_info'>[]
  filtros: FiltrosMovimientos
}) {
  const [generando, setGenerando] = useState(false)

  async function exportar(formato: Formato) {
    setGenerando(true)
    try {
      const { crearExcel, crearPdf } = await import('../export/generar')
      const filas = filasExport(rows)
      const hoy = todayISO()
      const contenido =
        formato === 'xlsx'
          ? await crearExcel(filas)
          : crearPdf(filas, { filtros: describirFiltros(filtros), generado: hoy, totales: resumenExport(rows) })
      descargar(new Blob([contenido], { type: MIME[formato] }), nombreArchivo(formato, hoy))
    } catch {
      toast.error('No se pudo generar el archivo. Inténtalo de nuevo.')
    } finally {
      setGenerando(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="secondary" disabled={rows.length === 0} loading={generando}>
          {generando ? null : <Download />}
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuItem onSelect={() => exportar('xlsx')}>
          <FileSpreadsheet aria-hidden="true" />
          Excel (.xlsx)
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => exportar('pdf')}>
          <FileText aria-hidden="true" />
          PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
