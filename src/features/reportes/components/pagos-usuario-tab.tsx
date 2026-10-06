import { createClient } from '@/lib/supabase/server'
import { listPagosPorUsuario, listUsuariosReporte } from '../queries'
import { pagosUsuarioFiltroSchema } from '../schemas'
import { PagosUsuarioFiltros } from './pagos-usuario-filtros'
import { PagosUsuarioResultado } from './pagos-usuario-resultado'

export async function PagosUsuarioTab({ usuario, inicio, fin }: { usuario?: string; inicio?: string; fin?: string }) {
  const supabase = await createClient()
  const usuarios = await listUsuariosReporte(supabase)
  const parsed = pagosUsuarioFiltroSchema.safeParse({ usuario, inicio, fin })
  const rows = parsed.success
    ? await listPagosPorUsuario(supabase, {
        userId: parsed.data.usuario,
        inicio: parsed.data.inicio,
        fin: parsed.data.fin,
      })
    : null

  return (
    <div className="space-y-6">
      <PagosUsuarioFiltros usuarios={usuarios} usuario={usuario} inicio={inicio} fin={fin} />
      {rows && <PagosUsuarioResultado rows={rows} />}
    </div>
  )
}
