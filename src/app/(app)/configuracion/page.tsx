import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/page-header'
import { TabsContent } from '@/components/ui/tabs'
import { TABS_CATALOGO, type TabCatalogo } from '@/features/catalogos/catalogos'
import { CatalogoSection } from '@/features/catalogos/components/catalogo-section'
import { CatalogosTabs } from '@/features/catalogos/components/catalogos-tabs'
import { TiposCuotaSection } from '@/features/catalogos/components/tipos-cuota-section'
import { listConceptosExtraCatalogo, listTiposCuota } from '@/features/catalogos/queries'
import { listConceptosDescuento, listConceptosRecargo } from '@/features/cuotas/queries'
import { AuthorizationError, requireRole } from '@/lib/auth/require-role'
import { ROLES } from '@/lib/constants'
import { createClient } from '@/lib/supabase/server'

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

async function contenido(tab: TabCatalogo) {
  const supabase = await createClient()
  switch (tab) {
    case 'cuotas':
      return <TiposCuotaSection rows={await listTiposCuota(supabase)} />
    case 'extras':
      return <CatalogoSection catalogo="extras" rows={await listConceptosExtraCatalogo(supabase)} />
    case 'descuentos': {
      const rows = await listConceptosDescuento(supabase)
      return (
        <CatalogoSection
          catalogo="descuentos"
          rows={rows.map((r) => ({ id: r.id, nombre: r.nombre, importe: Number(r.monto_descuento) }))}
        />
      )
    }
    case 'recargos': {
      const rows = await listConceptosRecargo(supabase)
      return (
        <CatalogoSection
          catalogo="recargos"
          rows={rows.map((r) => ({ id: r.id, nombre: r.nombre, importe: Number(r.monto_recargo) }))}
        />
      )
    }
  }
}

export default async function ConfiguracionPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[] }>
}) {
  try {
    await requireRole(ROLES.ADMINISTRADOR)
  } catch (e) {
    if (e instanceof AuthorizationError) notFound()
    throw e
  }

  const t = first((await searchParams).tab)
  const tab = TABS_CATALOGO.find((x) => x === t) ?? 'cuotas'

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuración"
        description="Administra los catálogos que usa la aplicación: tipos de cuota, pagos extra, descuentos y recargos."
        breadcrumbs={[{ label: 'Configuración' }]}
      />
      {/* Solo se leen los datos de la pestaña activa. */}
      <CatalogosTabs tab={tab}>
        <TabsContent value={tab}>{await contenido(tab)}</TabsContent>
      </CatalogosTabs>
    </div>
  )
}
