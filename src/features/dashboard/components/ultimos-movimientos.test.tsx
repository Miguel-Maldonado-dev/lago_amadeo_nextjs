import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { Views } from '@/lib/supabase/types'
import { UltimosMovimientos } from './ultimos-movimientos'

const largo = 'Pago referencia: 9adbc862-c294-44cc-9e8d-a752d2301eae'

const row = (over: Partial<Views<'movimientos_info'>>): Views<'movimientos_info'> => ({
  id: 1,
  tipo_id: 1,
  tipo_movimiento: 'Ingreso',
  descripcion: largo,
  importe: 100,
  metodo_pago_id: 1,
  metodo_pago: 'Efectivo',
  referencia: 'r',
  user_id: 'u1',
  fecha_movimiento: '2026-10-04',
  created_at: '2026-10-04T00:00:00Z',
  ...over,
})

describe('UltimosMovimientos', () => {
  it('la tabla ocupa el ancho completo de la tarjeta, como las demás tablas', () => {
    const { container } = render(<UltimosMovimientos rows={[row({})]} />)
    const body = container.querySelector('[data-slot="section-card-body"]')
    expect(body).not.toHaveClass('px-5')
    expect(body?.querySelector('table')).not.toBeNull()
  })

  it('recorta el concepto por CSS y conserva el texto completo en el title', () => {
    render(<UltimosMovimientos rows={[row({})]} />)
    const cell = screen.getByText(largo)
    expect(cell).toHaveClass('truncate')
    expect(cell).toHaveAttribute('title', largo)
  })

  it('el tipo usa la misma celda que Movimientos (flecha en círculo + badge)', () => {
    render(<UltimosMovimientos rows={[row({ id: 2, tipo_id: 2, tipo_movimiento: 'Egreso' })]} />)
    const badge = screen.getByText('Egreso')
    const cell = badge.closest('td') as HTMLElement
    expect(within(cell).getByTestId('tipo-movimiento-icon')).toHaveClass('bg-danger-light')
    expect(screen.getByText('- $100.00')).toHaveClass('text-danger')
  })

  it('la columna Fecha se muestra desde 1280 px para no generar scroll a 1024 px', () => {
    render(<UltimosMovimientos rows={[row({})]} />)
    const th = screen.getByRole('columnheader', { name: 'Fecha' })
    expect(th).toHaveClass('hidden', 'xl:table-cell')
    expect(th).not.toHaveClass('sm:table-cell')
  })

  it('sin filas muestra el estado vacío', () => {
    render(<UltimosMovimientos rows={[]} />)
    expect(screen.getByText('Sin movimientos')).toBeInTheDocument()
  })
})
