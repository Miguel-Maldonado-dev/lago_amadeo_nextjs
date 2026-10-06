import type { SupabaseClient } from '@supabase/supabase-js'
import { ROLES } from '@/lib/constants'
import type { Database } from '@/lib/supabase/database.types'
import type { Views } from '@/lib/supabase/types'

export async function listUsuariosReporte(
  supabase: SupabaseClient<Database>,
): Promise<{ id: string; user_name: string }[]> {
  const { data, error } = await supabase
    .from('users_info')
    .select('id, user_name')
    .in('role_name', [ROLES.ADMINISTRADOR, ROLES.TESORERO])
    .order('user_name', { ascending: true })
  if (error) throw new Error(`No se pudieron leer los usuarios: ${error.message}`)
  return (data ?? []).flatMap((u) => (u.id && u.user_name ? [{ id: u.id, user_name: u.user_name }] : []))
}

export async function listPagosPorUsuario(
  supabase: SupabaseClient<Database>,
  f: { userId: string; inicio: string; fin: string },
): Promise<Views<'reporte_pagos_detalle'>[]> {
  const { data, error } = await supabase
    .from('reporte_pagos_detalle')
    .select('*')
    .eq('user_id', f.userId)
    .gte('fecha_pago', f.inicio)
    .lte('fecha_pago', f.fin)
    .order('id', { ascending: false })
  if (error) throw new Error(`No se pudieron leer los pagos: ${error.message}`)
  return data ?? []
}

export async function listAccesosTelefono(
  supabase: SupabaseClient<Database>,
  anio: number,
  mes: number,
): Promise<Views<'accesos_telefono_info'>[]> {
  const { data, error } = await supabase
    .from('accesos_telefono_info')
    .select('*')
    .eq('anio', anio)
    .eq('mes', mes)
    .order('direccion', { ascending: true })
  if (error) throw new Error(`No se pudieron leer los accesos vehiculares: ${error.message}`)
  return data ?? []
}

export async function listAccesosTarjeta(
  supabase: SupabaseClient<Database>,
  anio: number,
  mes: number,
): Promise<Views<'accesos_tarjeta_info'>[]> {
  const { data, error } = await supabase
    .from('accesos_tarjeta_info')
    .select('*')
    .eq('anio', anio)
    .eq('mes', mes)
    .order('direccion', { ascending: true })
  if (error) throw new Error(`No se pudieron leer los accesos peatonales: ${error.message}`)
  return data ?? []
}
