import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ResumenCards } from './resumen-cards'

describe('ResumenCards', () => {
  it('con null muestra ceros y sin badges', () => {
    render(<ResumenCards resumen={null} totalUnidades={158} />)
    expect(screen.getAllByText('$0.00')).toHaveLength(3)
    expect(screen.getByText('158')).toBeInTheDocument()
    expect(screen.getAllByText('Sin datos del mes anterior')).toHaveLength(3)
    expect(screen.queryByText(/%/)).toBeNull()
  })

  it('muestra variación de ingresos', () => {
    render(
      <ResumenCards
        resumen={{
          saldo_actual: 0,
          total_ingresos: 0,
          total_egresos: 0,
          ingresos_mes: 1124,
          egresos_mes: null,
          ingresos_mes_anterior: 1000,
          egresos_mes_anterior: null,
        }}
        totalUnidades={158}
      />,
    )
    expect(screen.getAllByText('+12.4 %').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('vs. mes anterior').length).toBeGreaterThanOrEqual(1)
  })
})
