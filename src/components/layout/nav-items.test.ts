import { Settings } from 'lucide-react'
import { describe, expect, it } from 'vitest'
import { visibleNavItems } from './nav-items'

const LABELS = [
  'Inicio',
  'Domicilios',
  'Residentes',
  'Cuotas',
  'Pagos',
  'Movimientos Financieros',
  'Reportes',
  'Usuarios',
  'Configuración',
]

describe('visibleNavItems', () => {
  it('Comite ve 7 ítems sin /usuarios ni /configuracion', () => {
    const items = visibleNavItems('Comite')
    expect(items).toHaveLength(7)
    expect(items.map((i) => i.href)).not.toContain('/usuarios')
    expect(items.map((i) => i.href)).not.toContain('/configuracion')
  })

  it('Administrador ve 9 ítems en el orden esperado', () => {
    const items = visibleNavItems('Administrador')
    expect(items).toHaveLength(9)
    expect(items.map((i) => i.label)).toEqual(LABELS)
  })

  it('Configuración usa el ícono de engrane', () => {
    const item = visibleNavItems('Administrador').find((i) => i.href === '/configuracion')
    expect(item?.icon).toBe(Settings)
  })

  it('sin rol ve solo los ítems públicos', () => {
    expect(visibleNavItems(null)).toHaveLength(7)
  })
})
