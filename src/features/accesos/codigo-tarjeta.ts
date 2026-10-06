const MAX_UINT32 = 0xffffffff
const SOLO_DIGITOS = /^\d+$/

export type DesgloseTarjeta =
  | { ok: true; facility: number; cardId: number }
  | { ok: false; motivo: 'invalido' | 'excede-32-bits' }

/**
 * Separa el código combinado de la tarjeta (uint32) en Facility, los 16 bits altos
 * (`codigo >> 16`), y Card ID, los 16 bits bajos (`codigo & 0xFFFF`).
 */
export function desglosarCodigoTarjeta(valor: string): DesgloseTarjeta {
  if (!SOLO_DIGITOS.test(valor)) return { ok: false, motivo: 'invalido' }
  const codigo = Number(valor)
  if (codigo > MAX_UINT32) return { ok: false, motivo: 'excede-32-bits' }
  // `>>>` trabaja sin signo: con `>>` los códigos de 2^31 en adelante darían negativos.
  return { ok: true, facility: codigo >>> 16, cardId: codigo & 0xffff }
}
