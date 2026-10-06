import Link from 'next/link'
import { ArrowLeft, Pencil } from 'lucide-react'
import { notFound } from 'next/navigation'
import { PageBreadcrumb } from '@/components/page-breadcrumb'
import { Button } from '@/components/ui/button'
import { AccesosSection } from '@/features/accesos/components/accesos-section'
import { listTarjetas, listTelefonos } from '@/features/accesos/queries'
import { CuotasSection } from '@/features/cuotas/components/cuotas-section'
import {
  listAnios,
  listConceptosDescuento,
  listConceptosRecargo,
  listCuotasDomicilio,
  listMeses,
} from '@/features/cuotas/queries'
import { DomicilioInfoCard } from '@/features/domicilios/components/domicilio-info-card'
import { EditDomicilioDialog } from '@/features/domicilios/components/edit-domicilio-dialog'
import {
  getDomicilioConcepto,
  getDomicilioInfo,
  listConceptosRecurrentes,
  listDomiciliosOptions,
} from '@/features/domicilios/queries'
import { PagosExtraSection } from '@/features/pagos/components/pagos-extra-section'
import { ReciboPorCuota } from '@/features/pagos/components/recibo-por-cuota'
import { RegistrarPagoCuotaDialog } from '@/features/pagos/components/registrar-pago-cuota-dialog'
import { listConceptosExtra, listMetodosPago, listPagosExtraDomicilio } from '@/features/pagos/queries'
import { ResidentesSection } from '@/features/residentes/components/residentes-section'
import { listResidentesDomicilio } from '@/features/residentes/queries'
import { getCurrentUser } from '@/lib/auth/current-user'
import { hasRole } from '@/lib/auth/require-role'
import { ROLES_GESTION } from '@/lib/constants'
import { parseRouteId } from '@/lib/route-id'
import { createClient } from '@/lib/supabase/server'

export default async function DomicilioDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const domicilioId = parseRouteId(id)
  if (domicilioId === null) notFound()

  const supabase = await createClient()
  const domicilio = await getDomicilioInfo(supabase, domicilioId)
  if (!domicilio) notFound()

  const [
    concepto,
    conceptos,
    telefonos,
    tarjetas,
    residentes,
    user,
    cuotas,
    conceptosDescuento,
    conceptosRecargo,
    anios,
    meses,
    metodos,
    pagosExtra,
    domicilios,
    conceptosExtra,
  ] = await Promise.all([
    getDomicilioConcepto(supabase, domicilioId),
    listConceptosRecurrentes(supabase),
    listTelefonos(supabase, domicilioId),
    listTarjetas(supabase, domicilioId),
    listResidentesDomicilio(supabase, domicilioId),
    getCurrentUser(),
    listCuotasDomicilio(supabase, domicilioId),
    listConceptosDescuento(supabase),
    listConceptosRecargo(supabase),
    listAnios(supabase),
    listMeses(supabase),
    listMetodosPago(supabase),
    listPagosExtraDomicilio(supabase, domicilioId),
    listDomiciliosOptions(supabase),
    listConceptosExtra(supabase),
  ])

  const puedeGestionar = hasRole(user, ROLES_GESTION)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <Button variant="secondary" size="sm" asChild>
          <Link href="/domicilios">
            <ArrowLeft />
            Volver
          </Link>
        </Button>
        <PageBreadcrumb items={[{ label: 'Domicilios', href: '/domicilios' }, { label: domicilio.direccion ?? '' }]} />
      </div>
      <DomicilioInfoCard
        domicilio={domicilio}
        action={
          <EditDomicilioDialog
            domicilio={domicilio}
            conceptos={conceptos}
            conceptoActual={concepto?.concepto_id ?? null}
            trigger={
              <Button variant="secondary" size="icon-sm" aria-label="Editar domicilio" title="Editar domicilio">
                <Pencil />
              </Button>
            }
          />
        }
      />
      <AccesosSection domicilio={domicilio} telefonos={telefonos} tarjetas={tarjetas} />
      <ResidentesSection domicilioId={domicilioId} residentes={residentes} />
      <CuotasSection
        domicilioId={domicilioId}
        cuotas={cuotas}
        puedeGestionar={puedeGestionar}
        anios={anios}
        meses={meses}
        conceptosDescuento={conceptosDescuento}
        conceptosRecargo={conceptosRecargo}
        renderPagar={(c) => (
          <RegistrarPagoCuotaDialog cuota={c} metodos={metodos} trigger={<Button size="sm">Pagar</Button>} />
        )}
        renderRecibo={(c) => <ReciboPorCuota cuotaId={c.id!} />}
      />
      <PagosExtraSection
        domicilioId={domicilioId}
        pagos={pagosExtra}
        puedeGestionar={puedeGestionar}
        domicilios={domicilios}
        conceptos={conceptosExtra}
        metodos={metodos}
      />
    </div>
  )
}
