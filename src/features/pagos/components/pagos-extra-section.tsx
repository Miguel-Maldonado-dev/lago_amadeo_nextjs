import { Plus, Receipt } from 'lucide-react'
import { EmptyState } from '@/components/empty-state'
import { Money } from '@/components/money'
import { SectionCard } from '@/components/section-card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate } from '@/lib/dates'
import type { Tables } from '@/lib/supabase/types'
import type { PagoInfo } from '../queries'
import { ReciboButton } from './recibo-button'
import { RegistrarPagoExtraDialog } from './registrar-pago-extra-dialog'

export function PagosExtraSection({
  domicilioId,
  pagos,
  puedeGestionar,
  domicilios,
  conceptos,
  metodos,
}: {
  domicilioId: number
  pagos: PagoInfo[]
  puedeGestionar: boolean
  domicilios: { id: number; direccion: string }[]
  conceptos: Tables<'conceptos_pago'>[]
  metodos: Tables<'metodos_pago'>[]
}) {
  return (
    <SectionCard
      title="Pagos extra"
      action={
        puedeGestionar && (
          <RegistrarPagoExtraDialog
            domicilioId={domicilioId}
            domicilios={domicilios}
            conceptos={conceptos}
            metodos={metodos}
            trigger={
              <Button size="sm">
                <Plus />
                Pago Extra
              </Button>
            }
          />
        )
      }
    >
      {pagos.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Sin pagos extra"
          description="No hay pagos extra registrados para este domicilio."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Concepto</TableHead>
              <TableHead className="text-right">Importe</TableHead>
              <TableHead>Fecha de pago</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagos.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.concepto}</TableCell>
                <TableCell className="text-right">
                  <Money value={p.importe} />
                </TableCell>
                <TableCell>{formatDate(p.fecha_pago)}</TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    <ReciboButton pagoId={p.id!} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </SectionCard>
  )
}
