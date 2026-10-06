import { PageHeader } from '@/components/page-header'
import { CuotasView } from '@/features/cuotas/components/cuotas-view'
import { GenerarCuotasDialog } from '@/features/cuotas/components/generar-cuotas-dialog'
import { listAnios, listCuotasPeriodo, listEstatus, listMeses } from '@/features/cuotas/queries'
import { periodoSchema } from '@/features/cuotas/schemas'
import { getCurrentUser } from '@/lib/auth/current-user'
import { hasRole } from '@/lib/auth/require-role'
import { ROLES_GESTION } from '@/lib/constants'
import { currentPeriod } from '@/lib/dates'
import { createClient } from '@/lib/supabase/server'

export default async function CuotasPage({
  searchParams,
}: {
  searchParams: Promise<{ anio?: string | string[]; mes?: string | string[] }>
}) {
  const sp = await searchParams
  const parsed = periodoSchema.safeParse({
    anio: Array.isArray(sp.anio) ? sp.anio[0] : sp.anio,
    mes: Array.isArray(sp.mes) ? sp.mes[0] : sp.mes,
  })
  const { anio, mes } = parsed.success ? parsed.data : currentPeriod()

  const supabase = await createClient()
  const [user, rows, anios, meses, estatusOptions] = await Promise.all([
    getCurrentUser(),
    listCuotasPeriodo(supabase, anio, mes),
    listAnios(supabase),
    listMeses(supabase),
    listEstatus(supabase),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cuotas"
        description="Gestiona las cuotas de mantenimiento del fraccionamiento Lago Amadeo."
        breadcrumbs={[{ label: 'Cuotas' }]}
        actions={hasRole(user, ROLES_GESTION) && <GenerarCuotasDialog anios={anios} meses={meses} />}
      />
      <CuotasView
        key={`${anio}-${mes}`}
        rows={rows}
        anios={anios}
        meses={meses}
        anio={anio}
        mes={mes}
        estatusOptions={estatusOptions}
      />
    </div>
  )
}
