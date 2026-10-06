import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import type { Views } from '@/lib/supabase/types'
import { MovimientosTable } from './movimientos-table'

const row = (over: Partial<Views<'movimientos_info'>>): Views<'movimientos_info'> => ({
  id: 1,
  tipo_id: 1,
  tipo_movimiento: 'Ingreso',
  descripcion: 'Cuota',
  importe: 100,
  metodo_pago_id: 1,
  metodo_pago: 'Efectivo',
  referencia: 'r',
  user_id: 'u1',
  fecha_movimiento: '2026-10-05',
  created_at: '2026-10-05T00:00:00Z',
  ...over,
})

test('egreso se muestra con signo menos y text-danger', () => {
  render(<MovimientosTable rows={[row({ id: 1, tipo_id: 2, tipo_movimiento: 'Egreso' })]} />)
  const el = screen.getByText('- $100.00')
  expect(el).toHaveClass('text-danger')
})

test('ingreso se muestra con signo más y text-success', () => {
  render(<MovimientosTable rows={[row({ id: 2 })]} />)
  expect(screen.getByText('+ $100.00')).toHaveClass('text-success')
})
