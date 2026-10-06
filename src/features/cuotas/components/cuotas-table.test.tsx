import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test } from 'vitest'
import type { CuotaInfo } from '../queries'
import { CuotasTable } from './cuotas-table'

const row = (id: number, direccion: string, estatus: string, importe = 1500): CuotaInfo =>
  ({
    id,
    direccion,
    periodo: 'Marzo 2026',
    concepto: 'Mantenimiento',
    importe_cuota: importe,
    fecha_vencimiento_formated: '10/03/2026',
    estatus,
  }) as CuotaInfo

const rows = [row(1, 'Calle A 1', 'Vencido'), row(2, 'Calle B 2', 'Pagado'), row(3, 'Calle C 3', 'Vencido')]

describe('CuotasTable', () => {
  test('filtra por estatus', () => {
    render(<CuotasTable rows={rows} estatus="Vencido" />)
    expect(screen.getByText('Calle A 1')).toBeInTheDocument()
    expect(screen.getByText('Calle C 3')).toBeInTheDocument()
    expect(screen.queryByText('Calle B 2')).not.toBeInTheDocument()
  })

  test('sin estatus muestra todas', () => {
    render(<CuotasTable rows={rows} estatus={null} />)
    expect(screen.getAllByText(/Calle/)).toHaveLength(3)
  })

  test('ordenar por Importe desc', async () => {
    const data = [row(1, 'Calle A 1', 'Pagado', 100), row(2, 'Calle B 2', 'Pagado', 900), row(3, 'Calle C 3', 'Pagado', 500)]
    render(<CuotasTable rows={data} estatus={null} />)
    const btn = within(screen.getByRole('columnheader', { name: 'Importe' })).getByRole('button')
    await userEvent.click(btn)
    await userEvent.click(btn)
    expect(within(screen.getAllByRole('row')[1]).getAllByRole('cell')[0].textContent).toBe('Calle B 2')
  })
})
