import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { CopyButton } from './copy-button'

it('copia el valor', async () => {
  const user = userEvent.setup()
  const writeText = vi.fn().mockResolvedValue(undefined)
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
  render(<CopyButton value="abc" />)
  await user.click(screen.getByRole('button', { name: 'Copiar' }))
  expect(writeText).toHaveBeenCalledWith('abc')
  expect(await screen.findByRole('button', { name: 'Copiado' })).toBeInTheDocument()
})

it('deshabilitado no copia', () => {
  render(<CopyButton value="" label="Copiar Facility" disabled />)
  expect(screen.getByRole('button', { name: 'Copiar Facility' })).toBeDisabled()
})
