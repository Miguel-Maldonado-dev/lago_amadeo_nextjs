import { Pencil, Receipt } from 'lucide-react'
import type { ReactNode } from 'react'
import { EmptyState } from '@/components/empty-state'
import { Money } from '@/components/money'
import { SectionCard } from '@/components/section-card'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { Tables } from '@/lib/supabase/types'
import type { CuotaInfo } from '../queries'
import { EditarCuotaDialog } from './editar-cuota-dialog'
import { GenerarCuotaDomicilioDialog } from './generar-cuota-domicilio-dialog'

export function CuotasSection({
  domicilioId,
  cuotas,
  puedeGestionar,
  anios,
  meses,
  conceptosDescuento,
  conceptosRecargo,
  renderPagar,
  renderRecibo,
}: {
  domicilioId: number
  cuotas: CuotaInfo[]
  puedeGestionar: boolean
  anios: number[]
  meses: { id: number; name: string }[]
  conceptosDescuento: Tables<'conceptos_descuento'>[]
  conceptosRecargo: Tables<'conceptos_recargo'>[]
  renderPagar?: (cuota: CuotaInfo) => ReactNode
  renderRecibo?: (cuota: CuotaInfo) => ReactNode
}) {
  return (
    <SectionCard
      title="Cuotas"
      action={
        puedeGestionar && (
          <GenerarCuotaDomicilioDialog domicilioId={domicilioId} anios={anios} meses={meses} />
        )
      }
    >
      {cuotas.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Sin cuotas"
          description="No hay cuotas registradas para este domicilio."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Periodo</TableHead>
              <TableHead>Concepto</TableHead>
              <TableHead className="text-right">Importe</TableHead>
              <TableHead>Vencimiento</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cuotas.map((c) => {
              const editable = c.estatus === 'Pendiente' || c.estatus === 'Vencido'
              return (
                <TableRow key={c.id}>
                  <TableCell>{c.periodo}</TableCell>
                  <TableCell>{c.concepto}</TableCell>
                  <TableCell className="text-right">
                    <Money value={c.importe_cuota} />
                  </TableCell>
                  <TableCell>{c.fecha_vencimiento_formated}</TableCell>
                  <TableCell>
                    <StatusBadge status={c.estatus} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      {puedeGestionar && editable && (
                        <>
                          {renderPagar?.(c)}
                          <EditarCuotaDialog
                            cuota={c}
                            domicilioId={domicilioId}
                            conceptosDescuento={conceptosDescuento}
                            conceptosRecargo={conceptosRecargo}
                            trigger={
                              <Button variant="ghost" size="icon-sm" aria-label="Editar cuota">
                                <Pencil />
                              </Button>
                            }
                          />
                        </>
                      )}
                      {c.estatus === 'Pagado' && renderRecibo?.(c)}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}
    </SectionCard>
  )
}
