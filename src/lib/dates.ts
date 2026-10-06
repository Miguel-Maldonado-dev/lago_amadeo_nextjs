import { TIME_ZONE } from '@/lib/constants'

const todayFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/** Fecha de hoy (YYYY-MM-DD) en la zona horaria de la aplicación. */
export function todayISO(): string {
  return todayFormatter.format(new Date())
}

export function currentPeriod(): { anio: number; mes: number } {
  const [anio, mes] = todayISO().split('-')
  return { anio: Number(anio), mes: Number(mes) }
}

/** Convierte YYYY-MM-DD a dd/MM/yyyy sin usar Date (evita desplazamientos por zona horaria). */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return ''
  const [anio, mes, dia] = iso.split('-')
  return `${dia}/${mes}/${anio}`
}

export function lastDayOfMonthISO(anio: number, mes: number): string {
  const dia = new Date(Date.UTC(anio, mes, 0)).getUTCDate()
  return `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
}
