import { BadgePercent, Banknote, Pencil, Plus, TriangleAlert, type LucideIcon } from 'lucide-react'
import { EmptyState } from '@/components/empty-state'
import { Money } from '@/components/money'
import { SectionCard } from '@/components/section-card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CATALOGOS, type CatalogoSimple, type ElementoCatalogo } from '../catalogos'
import { CatalogoDialog } from './catalogo-dialog'

const ICONOS: Record<CatalogoSimple, LucideIcon> = {
  extras: Banknote,
  descuentos: BadgePercent,
  recargos: TriangleAlert,
}

export function CatalogoSection({ catalogo, rows }: { catalogo: CatalogoSimple; rows: ElementoCatalogo[] }) {
  const config = CATALOGOS[catalogo]
  const Icono = ICONOS[catalogo]
  return (
    <SectionCard
      title={config.titulo}
      description={config.descripcion}
      icon={Icono}
      action={
        <CatalogoDialog
          catalogo={catalogo}
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
        <EmptyState icon={Icono} title="Sin elementos" description="Agrega el primero con el botón Agregar." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="bg-muted hover:bg-muted">
              <TableHead>Nombre</TableHead>
              <TableHead className="text-right">{config.etiquetaMonto}</TableHead>
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
                  <div className="flex justify-end">
                    <CatalogoDialog
                      catalogo={catalogo}
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
