import { Pencil, Plus, Receipt } from 'lucide-react'
import { EmptyState } from '@/components/empty-state'
import { Money } from '@/components/money'
import { SectionCard } from '@/components/section-card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CATALOGOS, type TipoCuota } from '../catalogos'
import { AccesoBadge } from './acceso-badge'
import { TipoCuotaDialog } from './tipo-cuota-dialog'

const config = CATALOGOS.cuotas

export function TiposCuotaSection({ rows }: { rows: TipoCuota[] }) {
  return (
    <SectionCard
      title={config.titulo}
      description={config.descripcion}
      icon={Receipt}
      action={
        <TipoCuotaDialog
          trigger={
            <Button size="sm">
              <Plus />
              Agregar
            </Button>
          }
        />
      }
    >
      {rows.length === 0 ? (
        <EmptyState icon={Receipt} title="Sin elementos" description="Agrega el primero con el botón Agregar." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="bg-muted hover:bg-muted">
              <TableHead>Nombre</TableHead>
              <TableHead className="text-right">{config.etiquetaMonto}</TableHead>
              <TableHead>Acceso vehicular (teléfono)</TableHead>
              <TableHead>Acceso peatonal (tarjeta)</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.nombre}</TableCell>
                <TableCell className="text-right">
                  <Money value={r.importe} />
                </TableCell>
                <TableCell>
                  <AccesoBadge activo={r.accesoTelefono} />
                </TableCell>
                <TableCell>
                  <AccesoBadge activo={r.accesoTarjeta} />
                </TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    <TipoCuotaDialog
                      item={r}
                      trigger={
                        <Button variant="secondary" size="icon-sm" aria-label={`Editar ${r.nombre}`}>
                          <Pencil />
                        </Button>
                      }
                    />
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
