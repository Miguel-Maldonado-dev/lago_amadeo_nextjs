import { PageHeader } from '@/components/page-header'
import { EstadoCuotas } from '@/features/dashboard/components/estado-cuotas'
import { ResumenCards } from '@/features/dashboard/components/resumen-cards'
import { ResumenMeses } from '@/features/dashboard/components/resumen-mensual'
import { UltimosMovimientos } from '@/features/dashboard/components/ultimos-movimientos'
import { getResumenFinanciero } from '@/features/dashboard/queries'
import { listDomicilios } from '@/features/domicilios/queries'
import { listMovimientos } from '@/features/movimientos/queries'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const [resumen, movimientos, domicilios] = await Promise.all([
    getResumenFinanciero(supabase),
    listMovimientos(supabase),
    listDomicilios(supabase),
  ])
  return (
    <div className="space-y-6">
      <PageHeader title="Inicio" description="Resumen general del fraccionamiento Lago Amadeo." breadcrumbs={[]} />
      <ResumenCards resumen={resumen} totalUnidades={domicilios.length} />
      <ResumenMeses resumen={resumen} />
      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <UltimosMovimientos rows={movimientos.slice(0, 5)} />
        <EstadoCuotas rows={domicilios} />
      </div>
    </div>
  )
}
