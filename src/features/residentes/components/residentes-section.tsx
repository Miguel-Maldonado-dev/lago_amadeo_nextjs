import { Check, Plus, Users } from 'lucide-react'
import { EmptyState } from '@/components/empty-state'
import { PersonCell } from '@/components/person-cell'
import { SectionCard } from '@/components/section-card'
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
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Principal</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {residentes.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <PersonCell name={r.nombre} />
                </TableCell>
                <TableCell>{r.telefono ?? '—'}</TableCell>
                <TableCell>
                  {r.es_principal && (
                    <span
                      role="img"
                      className="flex size-6 items-center justify-center rounded-full bg-success-light text-success"
                      aria-label="Residente principal"
                    >
                      <Check className="size-4" />
                    </span>
                  )}
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
