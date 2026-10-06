import { AccesoPeatonalTab } from '@/features/reportes/components/acceso-peatonal-tab'
import { AccesoVehicularTab } from '@/features/reportes/components/acceso-vehicular-tab'
import { PagosUsuarioTab } from '@/features/reportes/components/pagos-usuario-tab'
import { ReportesTabs } from '@/features/reportes/components/reportes-tabs'
import { PageHeader } from '@/components/page-header'
import { TabsContent } from '@/components/ui/tabs'

const TABS = ['usuario', 'vehicular', 'peatonal'] as const

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v
}

export default async function ReportesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  const t = first(sp.tab)
  const tab = TABS.find((x) => x === t) ?? 'usuario'

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reportes"
        description="Consulta y genera reportes del fraccionamiento Lago Amadeo."
        breadcrumbs={[{ label: 'Reportes' }]}
      />
      <ReportesTabs tab={tab}>
        <TabsContent value="usuario">
          {tab === 'usuario' && (
            <PagosUsuarioTab usuario={first(sp.usuario)} inicio={first(sp.inicio)} fin={first(sp.fin)} />
          )}
        </TabsContent>
        <TabsContent value="vehicular">
          {tab === 'vehicular' && (
            <AccesoVehicularTab anio={first(sp.anio)} mes={first(sp.mes)} buscar={first(sp.buscar)} />
          )}
        </TabsContent>
        <TabsContent value="peatonal">
          {tab === 'peatonal' && (
            <AccesoPeatonalTab anio={first(sp.anio)} mes={first(sp.mes)} buscar={first(sp.buscar)} />
          )}
        </TabsContent>
      </ReportesTabs>
    </div>
  )
}
