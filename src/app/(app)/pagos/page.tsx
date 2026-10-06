import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { listDomiciliosOptions } from '@/features/domicilios/queries'
import { PagosView } from '@/features/pagos/components/pagos-view'
import { RegistrarPagoExtraDialog } from '@/features/pagos/components/registrar-pago-extra-dialog'
import { listConceptosExtra, listMetodosPago, listPagos } from '@/features/pagos/queries'
import { getCurrentUser } from '@/lib/auth/current-user'
import { hasRole } from '@/lib/auth/require-role'
import { ROLES_GESTION } from '@/lib/constants'
import { createClient } from '@/lib/supabase/server'

export default async function PagosPage() {
  const supabase = await createClient()
  const [user, rows, domicilios, conceptos, metodos] = await Promise.all([
    getCurrentUser(),
    listPagos(supabase),
    listDomiciliosOptions(supabase),
    listConceptosExtra(supabase),
    listMetodosPago(supabase),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pagos"
        description="Consulta y administra los pagos del fraccionamiento Lago Amadeo."
        breadcrumbs={[{ label: 'Pagos' }]}
        actions={
          hasRole(user, ROLES_GESTION) ? (
            <RegistrarPagoExtraDialog
              domicilios={domicilios}
              conceptos={conceptos}
              metodos={metodos}
              trigger={
                <Button>
                  <Plus />
                  Pago Extra
                </Button>
              }
            />
          ) : undefined
        }
      />
      <PagosView rows={rows} />
    </div>
  )
}
