import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Money } from './money'

describe('Money', () => {
  it('ingreso', () => {
    render(<Money value={1234.5} variant="ingreso" />)
    expect(screen.getByText('+ $1,234.50')).toHaveClass('text-success')
  })
  it('egreso', () => {
    render(<Money value={10} variant="egreso" />)
    expect(screen.getByText('- $10.00')).toHaveClass('text-danger')
  })
  it('sin variante', () => {
    render(<Money value={5} />)
    expect(screen.getByText('$5.00')).toBeInTheDocument()
  })
})
