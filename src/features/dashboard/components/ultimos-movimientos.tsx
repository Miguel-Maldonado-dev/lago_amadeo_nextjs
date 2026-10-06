import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { EmptyState } from '@/components/empty-state'
import { Money } from '@/components/money'
import { SectionCard } from '@/components/section-card'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TIPO_MOVIMIENTO } from '@/lib/constants'
import { formatDate } from '@/lib/dates'
import type { Views } from '@/lib/supabase/types'

const MAX = 40

export function UltimosMovimientos({ rows }: { rows: Views<'movimientos_info'>[] }) {
  return (
    <SectionCard
      title="Últimos movimientos"
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
            <TableRow>
              <TableHead>Fecha</TableHead>
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
                  <TableCell>{formatDate(r.fecha_movimiento)}</TableCell>
                  <TableCell title={d}>{d.length > MAX ? `${d.slice(0, MAX)}…` : d}</TableCell>
                  <TableCell>
                    <StatusBadge status={r.tipo_movimiento} />
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
