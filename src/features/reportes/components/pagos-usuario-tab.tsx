import { listMetodosPago } from '@/features/pagos/queries'
import { parseRouteId } from '@/lib/route-id'
import { createClient } from '@/lib/supabase/server'
import { filtrarPorMetodo } from '../filtros-pagos'
import { listPagosPorUsuario, listUsuariosReporte } from '../queries'
import { pagosUsuarioFiltroSchema } from '../schemas'
import { PagosUsuarioFiltros } from './pagos-usuario-filtros'
import { PagosUsuarioResultado } from './pagos-usuario-resultado'

export async function PagosUsuarioTab({
  usuario,
  inicio,
  fin,
  metodo,
}: {
  usuario?: string
  inicio?: string
  fin?: string
  metodo?: string
}) {
  const supabase = await createClient()
  const parsed = pagosUsuarioFiltroSchema.safeParse({ usuario, inicio, fin })
  // Los pagos no dependen de los catálogos: las tres lecturas van en paralelo.
  const [usuarios, metodos, rows] = await Promise.all([
    listUsuariosReporte(supabase),
    listMetodosPago(supabase),
    parsed.success
      ? listPagosPorUsuario(supabase, {
          userId: parsed.data.usuario,
          inicio: parsed.data.inicio,
          fin: parsed.data.fin,
        })
      : null,
  ])
  // Un método que no está en el catálogo se ignora y se muestran todos.
  const id = metodo ? parseRouteId(metodo) : null
  const metodoId = metodos.some((m) => m.id === id) ? id : null

  return (
    <div className="space-y-6">
      <PagosUsuarioFiltros
        usuarios={usuarios}
        metodos={metodos.map((m) => ({ id: m.id, name: m.name }))}
        usuario={usuario}
        inicio={inicio}
        fin={fin}
        metodo={metodoId === null ? undefined : String(metodoId)}
      />
      {rows && <PagosUsuarioResultado rows={filtrarPorMetodo(rows, metodoId)} />}
    </div>
  )
}
