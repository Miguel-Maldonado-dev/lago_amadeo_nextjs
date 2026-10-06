import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, test, vi } from 'vitest'
import type { DomicilioInfo } from '../queries'
import { DomiciliosTable } from './domicilios-table'

const { push } = vi.hoisted(() => ({ push: vi.fn() }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }))

const row = (id: number, direccion: string, estatus: string): DomicilioInfo => ({
  id,
  direccion,
  fecha_alta: '2026-01-05',
  observaciones: null,
  residente_principal: 'Ana',
  id_concepto: null,
  tipo_cuota: null,
  acceso_telefono: null,
  acceso_tarjeta: null,
  estatus,
})
const rows = [row(1, 'LAGO UNO', 'Al corriente'), row(2, 'LAGO DOS', 'Moroso'), row(3, 'BOSQUE 3', 'Al corriente')]

describe('DomiciliosTable', () => {
  afterEach(() => push.mockClear())

  test('muestra las columnas', () => {
    render(<DomiciliosTable rows={rows} />)
    for (const name of ['Dirección', 'Fecha de Registro', 'Residente Principal', 'Estatus', 'Acciones']) {
      expect(screen.getByRole('columnheader', { name })).toBeInTheDocument()
    }
  })

  test('badge rojo para Moroso', () => {
    render(<DomiciliosTable rows={rows} />)
    expect(screen.getByText('Moroso').className).toContain('bg-danger-light')
  })

  test('ordenar por Dirección invierte el orden', async () => {
    render(<DomiciliosTable rows={rows} />)
    const first = () => within(screen.getAllByRole('row')[1]).getAllByRole('cell')[0].textContent
    const btn = within(screen.getByRole('columnheader', { name: 'Dirección' })).getByRole('button')
    await userEvent.click(btn)
    expect(first()).toBe('BOSQUE 3')
    await userEvent.click(btn)
    expect(first()).toBe('LAGO UNO')
  })

  test('la fila muestra un menú de acciones con Ver detalle', async () => {
    render(<DomiciliosTable rows={rows} />)
    await userEvent.click(screen.getAllByRole('button', { name: /Acciones de/ })[0])
    expect(screen.getByRole('menuitem', { name: 'Ver detalle' })).toHaveAttribute('href', '/domicilios/1')
  })

  test('al hacer clic en una fila abre el detalle del domicilio', async () => {
    render(<DomiciliosTable rows={rows} />)
    await userEvent.click(screen.getByText('Moroso'))
    expect(push).toHaveBeenCalledWith('/domicilios/2')
  })

  test('la dirección es un enlace al detalle para teclado y lector de pantalla', () => {
    render(<DomiciliosTable rows={rows} />)
    expect(screen.getByRole('link', { name: 'LAGO UNO' })).toHaveAttribute('href', '/domicilios/1')
  })

  test('abrir el menú de acciones no navega', async () => {
    render(<DomiciliosTable rows={rows} />)
    await userEvent.click(screen.getAllByRole('button', { name: /Acciones de/ })[0])
    expect(push).not.toHaveBeenCalled()
  })
})
