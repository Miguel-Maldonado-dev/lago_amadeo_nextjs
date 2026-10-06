import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { EmptyState } from '@/components/empty-state'
import { Money } from '@/components/money'
import { SectionCard } from '@/components/section-card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TipoMovimientoCell } from '@/features/movimientos/components/tipo-movimiento-cell'
import { TIPO_MOVIMIENTO } from '@/lib/constants'
import { formatDate } from '@/lib/dates'
import type { Views } from '@/lib/supabase/types'

export function UltimosMovimientos({ rows }: { rows: Views<'movimientos_info'>[] }) {
  return (
    <SectionCard
      title="Últimos movimientos"
      flush
      action={
        <Button asChild variant="secondary" size="sm">
          <Link href="/movimientos">
            Ver todos <ArrowRight />
          </Link>
        </Button>
      }
    >
      {rows.length === 0 ? (
        <EmptyState title="Sin movimientos" description="Aún no hay movimientos registrados." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="bg-muted hover:bg-muted">
              <TableHead className="hidden xl:table-cell">Fecha</TableHead>
              <TableHead>Concepto</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Importe</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => {
              const d = r.descripcion ?? ''
              return (
                <TableRow key={r.id}>
                  <TableCell className="hidden xl:table-cell">{formatDate(r.fecha_movimiento)}</TableCell>
                  {/* max-w-0 + w-full: la columna absorbe el espacio libre y el texto se recorta con puntos suspensivos */}
                  <TableCell className="w-full max-w-0">
                    <span className="block truncate" title={d}>
                      {d}
                    </span>
                  </TableCell>
                  <TableCell>
                    <TipoMovimientoCell tipoId={r.tipo_id} nombre={r.tipo_movimiento} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Money value={r.importe} variant={r.tipo_id === TIPO_MOVIMIENTO.EGRESO ? 'egreso' : 'ingreso'} />
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
