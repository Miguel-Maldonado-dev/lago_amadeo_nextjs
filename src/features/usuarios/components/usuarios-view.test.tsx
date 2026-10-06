import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import type { Tables, Views } from '@/lib/supabase/types'
import { UsuariosView } from './usuarios-view'

vi.mock('../actions', () => ({
  cambiarEstadoUsuario: vi.fn(),
  crearUsuario: vi.fn(),
  editarUsuario: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/usuarios',
}))

const row = (id: string, user_name: string, email: string, role_name: string) =>
  ({ id, user_name, email, role_name, is_active: true }) as Views<'users_info'>

const rows = [row('u1', 'Obed Ramos', 'obed@x.com', 'Tesorero'), row('u2', 'Ana Pérez', 'ana@x.com', 'Administrador')]
const roles = [] as Tables<'roles'>[]

describe('UsuariosView', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  test('buscar filtra filas', () => {
    render(<UsuariosView rows={rows} roles={roles} currentUserId="u2" estado="activos" />)
    fireEvent.change(screen.getByPlaceholderText('Buscar por nombre o email...'), {
      target: { value: 'obed' },
    })
    act(() => {
      vi.advanceTimersByTime(400)
    })
    expect(screen.getAllByRole('row')).toHaveLength(2)
    expect(screen.queryByText('Ana Pérez')).not.toBeInTheDocument()
  })

  test('badges de rol y estatus', () => {
    render(<UsuariosView rows={rows} roles={roles} currentUserId="u2" estado="activos" />)
    expect(screen.getByText('Tesorero').className).toContain('bg-info-light')
    expect(screen.getAllByText('Activo')[0].className).toContain('bg-success-light')
  })

  test('el usuario actual no puede desactivarse', () => {
    render(<UsuariosView rows={rows} roles={roles} currentUserId="u2" estado="activos" />)
    const fila = screen.getByText('Ana Pérez').closest('tr')!
    expect(within(fila).queryByRole('button', { name: 'Desactivar usuario' })).not.toBeInTheDocument()
    const otra = screen.getByText('Obed Ramos').closest('tr')!
    expect(within(otra).getByRole('button', { name: 'Desactivar usuario' })).toBeInTheDocument()
  })
})
