import { listAnios, listMeses } from '@/features/cuotas/queries'
import { periodoSchema } from '@/features/cuotas/schemas'
import { EmptyState } from '@/components/empty-state'
import { currentPeriod } from '@/lib/dates'
import { createClient } from '@/lib/supabase/server'
import { listAccesosTelefono } from '../queries'
import { AccesosTelefonoTabla } from './accesos-telefono-tabla'
import { PeriodoReporteFiltros } from './periodo-reporte-filtros'
import { SalidaExport } from './salida-export'

export async function AccesoVehicularTab({ anio, mes, buscar }: { anio?: string; mes?: string; buscar?: string }) {
  const parsed = periodoSchema.safeParse({ anio, mes })
  const periodo = parsed.success ? parsed.data : currentPeriod()
  const supabase = await createClient()
  const [anios, meses] = await Promise.all([listAnios(supabase), listMeses(supabase)])
  const rows = buscar === '1' ? await listAccesosTelefono(supabase, periodo.anio, periodo.mes) : null

  return (
    <div className="space-y-6">
      <PeriodoReporteFiltros
        anios={anios}
        meses={meses}
        anio={periodo.anio}
        mes={periodo.mes}
        tab="vehicular"
        extra={<SalidaExport anio={periodo.anio} mes={periodo.mes} hayFilas={!!rows && rows.length > 0} />}
      />
      {rows && (rows.length === 0 ? <EmptyState /> : <AccesosTelefonoTabla rows={rows} />)}
    </div>
  )
}
