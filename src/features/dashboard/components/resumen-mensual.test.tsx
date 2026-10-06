import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ResumenMeses, ResumenMensual } from './resumen-mensual'

describe('ResumenMensual', () => {
  it('muestra título, ingresos y egresos del periodo', () => {
    render(<ResumenMensual title="Resumen del mes actual" ingresos={1500} egresos={250.5} />)
    const card = screen.getByRole('region', { name: 'Resumen del mes actual' })
    expect(within(card).getByText('Ingresos')).toBeInTheDocument()
    expect(within(card).getByText('$1,500.00')).toBeInTheDocument()
    expect(within(card).getByText('Egresos')).toBeInTheDocument()
    expect(within(card).getByText('$250.50')).toBeInTheDocument()
    expect(card).toHaveClass('p-5')
  })
})

describe('ResumenMeses', () => {
  it('muestra el resumen del mes actual y del mes anterior con sus importes', () => {
    render(
      <ResumenMeses
        resumen={{
          saldo_actual: 0,
          total_ingresos: 0,
          total_egresos: 0,
          ingresos_mes: 3950,
          egresos_mes: 120,
          ingresos_mes_anterior: 2450,
          egresos_mes_anterior: null,
        }}
      />,
    )
    const actual = screen.getByRole('region', { name: 'Resumen del mes actual' })
    expect(within(actual).getByText('$3,950.00')).toBeInTheDocument()
    expect(within(actual).getByText('$120.00')).toBeInTheDocument()
    const anterior = screen.getByRole('region', { name: 'Resumen del mes anterior' })
    expect(within(anterior).getByText('$2,450.00')).toBeInTheDocument()
    expect(within(anterior).getByText('$0.00')).toBeInTheDocument()
  })
})
