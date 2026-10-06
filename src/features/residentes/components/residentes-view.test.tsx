import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'
import type { Views } from '@/lib/supabase/types'
import { ResidentesView } from './residentes-view'

vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: vi.fn() }) }))

type Row = Views<'residentes_info'>
const row = (id: number, nombre: string, direccion: string): Row =>
  ({ id, domicilio_id: id, nombre, direccion, telefono: '5551234567', es_principal: id === 1 }) as Row
const rows = [row(1, 'Ever Hernandez', 'LAGO UNO'), row(2, 'Ana Lopez', 'LAGO DOS')]
const domicilios = [{ id: 1, direccion: 'LAGO UNO' }]

afterEach(() => vi.useRealTimers())

describe('ResidentesView', () => {
  test('buscar filtra filas', () => {
    vi.useFakeTimers()
    render(<ResidentesView rows={rows} domicilios={domicilios} />)
    const input = screen.getByPlaceholderText('Buscar por nombre, teléfono o domicilio...')
    fireEvent.change(input, { target: { value: 'hernandez' } })
    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(screen.getByText('Ever Hernandez')).toBeInTheDocument()
    expect(screen.queryByText('Ana Lopez')).not.toBeInTheDocument()
  })

  test('Limpiar filtros vacía el buscador y no reaplica la búsqueda', () => {
    vi.useFakeTimers()
    render(<ResidentesView rows={rows} domicilios={domicilios} />)
    const input = screen.getByPlaceholderText('Buscar por nombre, teléfono o domicilio...')
    fireEvent.change(input, { target: { value: 'hernandez' } })
    fireEvent.click(screen.getByRole('button', { name: /Limpiar filtros/ }))
    expect(input).toHaveValue('')
    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(input).toHaveValue('')
    expect(screen.getByText('Ever Hernandez')).toBeInTheDocument()
    expect(screen.getByText('Ana Lopez')).toBeInTheDocument()
  })
})
