import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ResumenCards } from './resumen-cards'

const resumen = {
  saldo_actual: 60706.27,
  total_ingresos: 187733,
  total_egresos: 127026.73,
  ingresos_mes: 1124,
  egresos_mes: 0,
  ingresos_mes_anterior: 1000,
  egresos_mes_anterior: 0,
}

describe('ResumenCards', () => {
  it('con null muestra ceros', () => {
    render(<ResumenCards resumen={null} totalUnidades={158} />)
    expect(screen.getAllByText('$0.00')).toHaveLength(3)
    expect(screen.getByText('158')).toBeInTheDocument()
  })

  it('no muestra porcentajes ni textos auxiliares', () => {
    render(<ResumenCards resumen={resumen} totalUnidades={158} />)
    expect(screen.queryByText(/%/)).toBeNull()
    expect(screen.queryByText('vs. mes anterior')).toBeNull()
    expect(screen.queryByText('Sin datos del mes anterior')).toBeNull()
    expect(screen.queryByText('domicilios registrados')).toBeNull()
  })

  it('usa relleno parejo de 20 px y el título en una sola línea', () => {
    const { container } = render(<ResumenCards resumen={resumen} totalUnidades={158} />)
    const cards = container.querySelectorAll('[data-slot="card"]')
    expect(cards).toHaveLength(4)
    cards.forEach((card) => expect(card).toHaveClass('p-5'))
    expect(container.firstElementChild).toHaveClass('lg:grid-cols-4')
    for (const label of ['Ingresos acumulados', 'Egresos acumulados']) {
      const el = screen.getByText(label)
      expect(el).toHaveClass('truncate')
      expect(el).toHaveAttribute('title', label)
    }
  })
})
