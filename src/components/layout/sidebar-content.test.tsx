import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SidebarContent } from './sidebar-content'

vi.mock('next/navigation', () => ({ usePathname: () => '/domicilios' }))
vi.mock('@/features/auth/actions', () => ({ logout: vi.fn() }))

describe('SidebarContent', () => {
  it('muestra marca, usuario y rol', () => {
    render(<SidebarContent user={{ userName: 'Ana Pérez', roleName: 'Administrador' }} />)
    expect(screen.getByText('Lago Amadeo')).toBeInTheDocument()
    expect(screen.getByText('Administración')).toBeInTheDocument()
    expect(screen.getByText('Ana Pérez')).toBeInTheDocument()
    expect(screen.getByText('Administrador')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cerrar sesión' })).toBeInTheDocument()
  })

  it('marca activo el enlace actual', () => {
    render(<SidebarContent user={{ userName: 'Ana', roleName: 'Administrador' }} />)
    const link = screen.getByRole('link', { name: 'Domicilios' })
    expect(link).toHaveAttribute('aria-current', 'page')
    expect(link.className).toContain('bg-primary')
  })

  it('con rol Comite no hay enlace Usuarios', () => {
    render(<SidebarContent user={{ userName: 'Luis', roleName: 'Comite' }} />)
    expect(screen.queryByRole('link', { name: 'Usuarios' })).not.toBeInTheDocument()
  })
})
