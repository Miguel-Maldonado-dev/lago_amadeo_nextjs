import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { ErrorState } from './error-state'

it('Reintentar llama onRetry', async () => {
  const onRetry = vi.fn()
  render(<ErrorState onRetry={onRetry} />)
  await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
  expect(onRetry).toHaveBeenCalled()
})

it('sin onRetry no hay botón', () => {
  render(<ErrorState />)
  expect(screen.queryByRole('button')).toBeNull()
})
