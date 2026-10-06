import { Check, Plus, Users } from 'lucide-react'
import { EmptyState } from '@/components/empty-state'
import { SectionCard } from '@/components/section-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { Tables } from '@/lib/supabase/types'
import { ResidenteActions } from './residente-actions'
import { ResidenteDialog } from './residente-dialog'

export function ResidentesSection({
  domicilioId,
  residentes,
}: {
  domicilioId: number
  residentes: Tables<'residentes'>[]
}) {
  return (
    <SectionCard
      title="Residentes"
      icon={Users}
      action={
        <ResidenteDialog
          domicilioId={domicilioId}
          trigger={
            <Button size="sm">
              <Plus />
              Agregar Residente
            </Button>
          }
        />
      }
    >
      {residentes.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Sin residentes"
          description="No hay residentes registrados para este domicilio."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="bg-muted hover:bg-muted">
              <TableHead>Nombre</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Residente Principal</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {residentes.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.nombre}</TableCell>
                <TableCell className="tabular-nums">{r.telefono ?? '—'}</TableCell>
                <TableCell>
                  {r.es_principal ? (
                    <Badge variant="success">
                      <Check aria-hidden="true" />
                      Sí
                    </Badge>
                  ) : null}
                </TableCell>
                <TableCell>
                  <ResidenteActions domicilioId={domicilioId} residente={r} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </SectionCard>
  )
}
