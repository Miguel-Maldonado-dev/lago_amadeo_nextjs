import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StatusBadge } from './status-badge'

describe('StatusBadge', () => {
  it.each([
    ['Pagado', 'bg-success-light'],
    ['Al corriente', 'bg-success-light'],
    ['Activo', 'bg-success-light'],
    ['Pendiente', 'bg-warning-light'],
    ['Vencido', 'bg-danger-light'],
    ['Moroso', 'bg-danger-light'],
    ['Inactivo', 'bg-danger-light'],
    ['Administrador', 'bg-primary-light'],
    ['Tesorero', 'bg-info-light'],
    ['Otro', 'bg-muted'],
  ])('%s usa %s', (status, cls) => {
    render(<StatusBadge status={status} />)
    expect(screen.getByText(status)).toHaveClass(cls)
  })

  it('null renderiza vacío con estilo neutro', () => {
    const { container } = render(<StatusBadge status={null} />)
    expect(container.firstElementChild).toHaveClass('bg-muted')
    expect(container.firstElementChild).toHaveTextContent('')
  })
})
