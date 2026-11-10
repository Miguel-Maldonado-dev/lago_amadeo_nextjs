import {
  MSG_CONCEPTO_GUARDADO,
  MSG_DESCUENTO_GUARDADO,
  MSG_RECARGO_GUARDADO,
  MSG_TIPO_CUOTA_GUARDADO,
} from './messages'

export type CatalogoSimple = 'extras' | 'descuentos' | 'recargos'
export type TabCatalogo = 'cuotas' | CatalogoSimple

export const TABS_CATALOGO: TabCatalogo[] = ['cuotas', 'extras', 'descuentos', 'recargos']

export type ElementoCatalogo = { id: number; nombre: string; importe: number }
export type TipoCuota = ElementoCatalogo & { accesoTelefono: boolean; accesoTarjeta: boolean }

type ConfigCatalogo = {
  titulo: string
  tab: string
  descripcion: string
  singular: string
  etiquetaMonto: string
  guardado: string
}

export const CATALOGOS: Record<TabCatalogo, ConfigCatalogo> = {
  cuotas: {
    titulo: 'Tipos de cuota mensual',
    tab: 'Tipos de cuota',
    descripcion: 'Se asignan a cada domicilio y definen el importe de sus cuotas y sus accesos.',
    singular: 'tipo de cuota',
    etiquetaMonto: 'Importe mensual',
    guardado: MSG_TIPO_CUOTA_GUARDADO,
  },
  extras: {
    titulo: 'Conceptos de pago extra',
    tab: 'Conceptos extra',
    descripcion: 'Cargos únicos, como la reposición de una tarjeta. Se eligen al registrar un pago extra.',
    singular: 'concepto',
    etiquetaMonto: 'Importe',
    guardado: MSG_CONCEPTO_GUARDADO,
  },
  descuentos: {
    titulo: 'Descuentos',
    tab: 'Descuentos',
    descripcion: 'Montos que se restan a una cuota al editarla.',
    singular: 'descuento',
    etiquetaMonto: 'Monto',
    guardado: MSG_DESCUENTO_GUARDADO,
  },
  recargos: {
    titulo: 'Recargos',
    tab: 'Recargos',
    descripcion: 'Montos que se suman a una cuota al editarla.',
    singular: 'recargo',
    etiquetaMonto: 'Monto',
    guardado: MSG_RECARGO_GUARDADO,
  },
}
