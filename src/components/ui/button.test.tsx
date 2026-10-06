import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Button } from './button'

describe('Button', () => {
  it('icon-sm se ve de 36 px pero amplía el área de clic con un pseudo-elemento', () => {
    render(<Button size="icon-sm" aria-label="Más" />)
    const button = screen.getByRole('button', { name: 'Más' })
    expect(button.className).toContain('size-9')
    expect(button.className).toContain('after:absolute')
  })

  it('secondary se renderiza con fondo de tarjeta', () => {
    render(<Button variant="secondary">Cancelar</Button>)
    expect(screen.getByRole('button', { name: 'Cancelar' }).className).toContain('bg-card')
  })
})
