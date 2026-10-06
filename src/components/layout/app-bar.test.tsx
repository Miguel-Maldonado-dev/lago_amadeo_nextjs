import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { AppBar } from './app-bar'

vi.mock('next/navigation', () => ({ usePathname: () => '/domicilios' }))
vi.mock('@/features/auth/actions', () => ({ logout: vi.fn() }))

describe('AppBar', () => {
  it('el botón del avatar tiene un área táctil de 40 px', () => {
    render(<AppBar user={{ userName: 'Ana', roleName: 'Administrador' }} />)
    expect(screen.getByRole('button', { name: 'Usuario: Ana' })).toHaveClass('size-10')
  })

  it('el menú móvil (Sheet) ofrece el botón Cerrar en español', async () => {
    render(<AppBar user={{ userName: 'Ana', roleName: 'Administrador' }} />)
    await userEvent.click(screen.getByRole('button', { name: 'Abrir menú' }))
    expect(screen.getByRole('button', { name: 'Cerrar' })).toBeInTheDocument()
  })
})
