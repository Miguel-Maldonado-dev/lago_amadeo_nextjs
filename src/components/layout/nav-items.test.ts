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
]

describe('visibleNavItems', () => {
  it('Comite ve 7 ítems sin /usuarios', () => {
    const items = visibleNavItems('Comite')
    expect(items).toHaveLength(7)
    expect(items.map((i) => i.href)).not.toContain('/usuarios')
  })

  it('Administrador ve 8 ítems en el orden esperado', () => {
    const items = visibleNavItems('Administrador')
    expect(items).toHaveLength(8)
    expect(items.map((i) => i.label)).toEqual(LABELS)
  })

  it('sin rol ve solo los ítems públicos', () => {
    expect(visibleNavItems(null)).toHaveLength(7)
  })
})
