export const ROLES = {
  ADMINISTRADOR: 'Administrador',
  TESORERO: 'Tesorero',
  COMITE: 'Comite',
  VIGILANCIA: 'Vigilancia',
} as const

export type RoleName = (typeof ROLES)[keyof typeof ROLES]

export const ROLES_GESTION: RoleName[] = [ROLES.ADMINISTRADOR, ROLES.TESORERO]

export const ESTATUS = { PENDIENTE: 1, PAGADO: 2, VENCIDO: 3 } as const
export const TIPO_PAGO = { RECURRENTE: 1, EXTRA: 2 } as const
export const TIPO_MOVIMIENTO = { INGRESO: 1, EGRESO: 2 } as const
export const LIMITES = { TELEFONOS: 2, TARJETAS: 3 } as const

export const PRINT_AGENT_URL = 'http://localhost:8000/print'
export const TIME_ZONE = 'America/Mexico_City'
