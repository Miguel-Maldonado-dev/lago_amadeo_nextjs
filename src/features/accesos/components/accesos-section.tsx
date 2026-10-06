import { CreditCard, Phone, Plus } from 'lucide-react'
import { EmptyState } from '@/components/empty-state'
import { SectionCard } from '@/components/section-card'
import { Button } from '@/components/ui/button'
import { LIMITES } from '@/lib/constants'
import type { Tables } from '@/lib/supabase/types'
import type { DomicilioInfo } from '@/features/domicilios/queries'
import { AccesoItem } from './acceso-item'
import { NumeroDialog } from './numero-dialog'

export function AccesosSection({
  domicilio,
  telefonos,
  tarjetas,
}: {
  domicilio: DomicilioInfo
  telefonos: Tables<'telefonos_acceso'>[]
  tarjetas: Tables<'tarjetas_acceso'>[]
}) {
  const domicilioId = domicilio.id!
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {(domicilio.acceso_telefono ?? true) && (
        <SectionCard
          title="Números de acceso"
          description="Máximo 2 números"
          action={
            telefonos.length < LIMITES.TELEFONOS && (
              <NumeroDialog
                kind="telefono"
                domicilioId={domicilioId}
                trigger={
                  <Button size="sm">
                    <Plus />
                    Agregar Número
                  </Button>
                }
              />
            )
          }
        >
          {telefonos.length === 0 ? (
            <EmptyState
              icon={Phone}
              title="Sin números"
              description="No hay números registrados para el acceso."
            />
          ) : (
            <ul className="flex flex-col gap-2">
              {telefonos.map((t) => (
                <AccesoItem key={t.id} kind="telefono" domicilioId={domicilioId} id={t.id} valor={t.telefono} />
              ))}
            </ul>
          )}
        </SectionCard>
      )}
      {(domicilio.acceso_tarjeta ?? true) && (
        <SectionCard
          title="Acceso peatonal"
          description="Máximo 3 tarjetas"
          action={
            tarjetas.length < LIMITES.TARJETAS && (
              <NumeroDialog
                kind="tarjeta"
                domicilioId={domicilioId}
                trigger={
                  <Button size="sm">
                    <Plus />
                    Agregar Tarjeta
                  </Button>
                }
              />
            )
          }
        >
          {tarjetas.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="Sin tarjetas"
              description="No hay tarjetas registradas para el acceso."
            />
          ) : (
            <ul className="flex flex-col gap-2">
              {tarjetas.map((t) => (
                <AccesoItem key={t.id} kind="tarjeta" domicilioId={domicilioId} id={t.id} valor={t.numero} />
              ))}
            </ul>
          )}
        </SectionCard>
      )}
    </div>
  )
}
