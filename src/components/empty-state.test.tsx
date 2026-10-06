import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { EmptyState } from './empty-state'

it('renderiza título, descripción y acción', () => {
  render(<EmptyState title="T" description="D" action={<button>Ir</button>} />)
  expect(screen.getByText('T')).toBeInTheDocument()
  expect(screen.getByText('D')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Ir' })).toBeInTheDocument()
})
