import { PageHeader } from '@/components/page-header'
import { ResidentesView } from '@/features/residentes/components/residentes-view'
import { listResidentesInfo } from '@/features/residentes/queries'
import { listDomiciliosOptions } from '@/features/domicilios/queries'
import { parseRouteId } from '@/lib/route-id'
import { createClient } from '@/lib/supabase/server'

export default async function ResidentesPage({
  searchParams,
}: {
  searchParams: Promise<{ domicilio?: string | string[] }>
}) {
  const sp = await searchParams
  const raw = Array.isArray(sp.domicilio) ? sp.domicilio[0] : sp.domicilio
  const domicilioId = parseRouteId(raw ?? '') ?? undefined

  const supabase = await createClient()
  const [options, rows] = await Promise.all([
    listDomiciliosOptions(supabase),
    listResidentesInfo(supabase, domicilioId),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Residentes"
        description="Consulta los residentes del fraccionamiento Lago Amadeo."
        breadcrumbs={[{ label: 'Residentes' }]}
      />
      <ResidentesView rows={rows} domicilios={options} domicilioId={domicilioId} />
    </div>
  )
}
