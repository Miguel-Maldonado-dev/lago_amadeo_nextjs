import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { MSG_INACTIVO } from '../messages'
import { LoginForm } from './login-form'

vi.mock('@/features/auth/actions', () => ({ login: vi.fn() }))

describe('LoginForm', () => {
  it('renderiza etiquetas, botón y pie', () => {
    render(<LoginForm />)
    expect(screen.getByText('Bienvenido')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeInTheDocument()
    expect(
      screen.getByText('¿No tienes una cuenta? Contacta a tu administración'),
    ).toBeInTheDocument()
  })

  it('el ojo alterna el tipo del password', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)
    const input = screen.getByLabelText('Contraseña')
    expect(input).toHaveAttribute('type', 'password')
    await user.click(screen.getByRole('button', { name: 'Mostrar contraseña' }))
    expect(input).toHaveAttribute('type', 'text')
    await user.click(screen.getByRole('button', { name: 'Ocultar contraseña' }))
    expect(input).toHaveAttribute('type', 'password')
  })

  it('el botón del ojo mide 40 px de ancho', () => {
    render(<LoginForm />)
    expect(screen.getByRole('button', { name: 'Mostrar contraseña' })).toHaveClass('w-10')
  })

  it('muestra MSG_INACTIVO cuando error=inactive', () => {
    render(<LoginForm error="inactive" />)
    expect(screen.getByText(MSG_INACTIVO)).toBeInTheDocument()
  })
})
