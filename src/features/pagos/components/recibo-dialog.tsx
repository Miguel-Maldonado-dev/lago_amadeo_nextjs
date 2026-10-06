'use client'

import { Download, Printer } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { FormDialog } from '@/components/form-dialog'
import { Button } from '@/components/ui/button'
import { PRINT_AGENT_URL } from '@/lib/constants'
import {
  MSG_ERROR_CARGA_RECIBO,
  MSG_ERROR_IMPRESION,
  MSG_IMPRESO,
  MSG_SIN_RECIBO_DISPONIBLE,
} from '../messages'

type Estado =
  | { tipo: 'cargando' }
  | { tipo: 'sin-recibo' }
  | { tipo: 'error' }
  | { tipo: 'listo'; blob: Blob; objectUrl: string; referencia: string }

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).replace(/^data:[^,]*;base64,/, ''))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

export function ReciboDialog({ pagoId, trigger }: { pagoId: number; trigger: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [estado, setEstado] = useState<Estado>({ tipo: 'cargando' })
  const [imprimiendo, setImprimiendo] = useState(false)

  useEffect(() => {
    if (!open) return
    let cancelado = false
    let objectUrl: string | null = null
    ;(async () => {
      try {
        const res = await fetch('/api/recibos/' + pagoId)
        if (cancelado) return
        if (res.status === 404) return setEstado({ tipo: 'sin-recibo' })
        if (!res.ok) return setEstado({ tipo: 'error' })
        const blob = await res.blob()
        if (cancelado) return
        objectUrl = URL.createObjectURL(blob)
        const referencia =
          /filename="(.+?)\.pdf"/.exec(res.headers.get('Content-Disposition') ?? '')?.[1] ?? 'Recibo'
        setEstado({ tipo: 'listo', blob, objectUrl, referencia })
      } catch {
        if (!cancelado) setEstado({ tipo: 'error' })
      }
    })()
    return () => {
      cancelado = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [open, pagoId])

  async function imprimir(blob: Blob) {
    setImprimiendo(true)
    try {
      const pdf_base64 = await blobToBase64(blob)
      const res = await fetch(PRINT_AGENT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdf_base64 }),
      })
      const json = await res.json()
      if (json?.success === true) toast.success(MSG_IMPRESO)
      else toast.error(MSG_ERROR_IMPRESION)
    } catch {
      toast.error(MSG_ERROR_IMPRESION)
    } finally {
      setImprimiendo(false)
    }
  }

  const titulo = estado.tipo === 'listo' ? estado.referencia : 'Recibo'

  return (
    <FormDialog
      title={titulo}
      description="Visualización del recibo de pago."
      trigger={trigger}
      open={open}
      onOpenChange={(next) => {
        if (next) setEstado({ tipo: 'cargando' })
        setOpen(next)
      }}
      size="lg"
      footer={
        estado.tipo === 'listo' ? (
          <>
            <Button asChild variant="secondary">
              <a href={estado.objectUrl} download={estado.referencia + '.pdf'}>
                <Download /> Descargar
              </a>
            </Button>
            <Button onClick={() => imprimir(estado.blob)} loading={imprimiendo}>
              {!imprimiendo && <Printer />} Imprimir
            </Button>
          </>
        ) : undefined
      }
    >
      {estado.tipo === 'cargando' && <p className="text-sm text-muted-foreground">Cargando recibo...</p>}
      {estado.tipo === 'sin-recibo' && <p className="text-sm">{MSG_SIN_RECIBO_DISPONIBLE}</p>}
      {estado.tipo === 'error' && <p className="text-sm text-danger">{MSG_ERROR_CARGA_RECIBO}</p>}
      {estado.tipo === 'listo' && (
        <div className="rounded-md bg-[#444444] p-2">
          <iframe title="Recibo" src={estado.objectUrl} className="h-[55vh] max-h-[560px] w-full rounded-sm" />
        </div>
      )}
    </FormDialog>
  )
}
