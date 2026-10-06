import { PageHeader } from '@/components/page-header'
import { AddDomicilioDialog } from '@/features/domicilios/components/add-domicilio-dialog'
import { DomiciliosView } from '@/features/domicilios/components/domicilios-view'
import { listConceptosRecurrentes, listDomicilios } from '@/features/domicilios/queries'
import { createClient } from '@/lib/supabase/server'

export default async function DomiciliosPage() {
  const supabase = await createClient()
  const [domicilios, conceptos] = await Promise.all([
    listDomicilios(supabase),
    listConceptosRecurrentes(supabase),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Domicilios"
        description="Gestiona los domicilios del fraccionamiento Lago Amadeo."
        breadcrumbs={[{ label: 'Domicilios' }]}
        actions={<AddDomicilioDialog conceptos={conceptos} />}
      />
      <DomiciliosView rows={domicilios} />
    </div>
  )
}
