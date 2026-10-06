import { createClient } from '@/lib/supabase/server'
import { getPagoIdPorCuota } from '../queries'
import { ReciboButton } from './recibo-button'

/** Botón "Recibo" de una cuota pagada; no renderiza nada si la cuota no tiene pago registrado. */
export async function ReciboPorCuota({ cuotaId }: { cuotaId: number }) {
  const supabase = await createClient()
  const pagoId = await getPagoIdPorCuota(supabase, cuotaId)
  return pagoId === null ? null : <ReciboButton pagoId={pagoId} />
}
