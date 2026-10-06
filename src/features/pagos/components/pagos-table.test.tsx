import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import type { PagoInfo } from '../queries'
import { PagosTable } from './pagos-table'

test('referencia truncada, copiar y recibo', () => {
  const row = {
    id: 1,
    referencia: 'ABCDEFGH12345',
    concepto: 'Mantenimiento',
    direccion: 'Amadeo 1',
    importe: 100,
    fecha_pago: '2026-09-10',
    tipo_pago_id: 1,
  } as PagoInfo
  render(<PagosTable rows={[row]} />)
  expect(screen.getByText('ABCDEFGH…')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /Copiar/ })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /Recibo/ })).toBeInTheDocument()
})

test('una referencia de 8 caracteres o menos se muestra completa, sin elipsis', () => {
  const row = {
    id: 2,
    referencia: 'ABC',
    concepto: 'Mantenimiento',
    direccion: 'Amadeo 1',
    importe: 100,
    fecha_pago: '2026-09-10',
    tipo_pago_id: 1,
  } as PagoInfo
  render(<PagosTable rows={[row]} />)
  expect(screen.getByText('ABC')).toBeInTheDocument()
  expect(screen.queryByText(/…/)).not.toBeInTheDocument()
})
