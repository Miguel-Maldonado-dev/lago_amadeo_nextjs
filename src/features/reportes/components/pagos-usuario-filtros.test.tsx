import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PagosUsuarioFiltros } from './pagos-usuario-filtros'

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }), usePathname: () => '/reportes' }))

const USUARIO = '0b3f7c1e-8d2a-4c5b-9e6f-1a2b3c4d5e6f'
const metodos = [
  { id: 1, name: 'Efectivo' },
  { id: 2, name: 'Transferencia' },
]
const base = { usuarios: [{ id: USUARIO, user_name: 'Ana' }], metodos, usuario: USUARIO, inicio: '2026-01-01', fin: '2026-01-31' }
const metodoSelect = () => screen.getByRole('combobox', { name: 'Método de pago' })
const urlBuscada = () => new URLSearchParams(String(replace.mock.lastCall?.[0]).split('?')[1])

describe('PagosUsuarioFiltros · método de pago', () => {
  beforeEach(() => replace.mockClear())

  it('por defecto muestra todos los métodos y ofrece Efectivo y Transferencia', async () => {
    render(<PagosUsuarioFiltros {...base} />)
    expect(metodoSelect()).toHaveTextContent('Todos los métodos')
    await userEvent.click(metodoSelect())
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual([
      'Todos los métodos',
      'Efectivo',
      'Transferencia',
    ])
  })

  it('Buscar agrega el método elegido a la URL', async () => {
    render(<PagosUsuarioFiltros {...base} />)
    await userEvent.click(metodoSelect())
    await userEvent.click(screen.getByRole('option', { name: 'Transferencia' }))
    await userEvent.click(screen.getByRole('button', { name: 'Buscar' }))
    expect(urlBuscada().get('metodo')).toBe('2')
    expect(urlBuscada().get('usuario')).toBe(USUARIO)
  })

  it('sin método, Buscar no lo incluye en la URL', async () => {
    render(<PagosUsuarioFiltros {...base} />)
    await userEvent.click(screen.getByRole('button', { name: 'Buscar' }))
    expect(urlBuscada().has('metodo')).toBe(false)
  })

  it('conserva el método de la URL y Limpiar lo reinicia', async () => {
    render(<PagosUsuarioFiltros {...base} metodo="1" />)
    expect(metodoSelect()).toHaveTextContent('Efectivo')
    await userEvent.click(screen.getByRole('button', { name: /Limpiar/ }))
    expect(metodoSelect()).toHaveTextContent('Todos los métodos')
    expect(replace).toHaveBeenLastCalledWith('/reportes?tab=usuario')
  })
})
