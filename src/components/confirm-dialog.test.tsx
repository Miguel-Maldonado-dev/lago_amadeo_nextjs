import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { toast } from 'sonner'
import { ConfirmDialog } from './confirm-dialog'

vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

function setup(onConfirm: () => Promise<void> | void, tone?: 'danger' | 'default') {
  render(
    <ConfirmDialog
      title="Eliminar"
      description="¿Seguro?"
      trigger={<button>Abrir</button>}
      onConfirm={onConfirm}
      tone={tone}
    />,
  )
}

describe('ConfirmDialog', () => {
  beforeEach(() => vi.clearAllMocks())

  it('cierra tras confirmar con éxito', async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined)
    setup(onConfirm)
    await userEvent.click(screen.getByText('Abrir'))
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar' }))
    await waitFor(() => expect(screen.queryByText('¿Seguro?')).not.toBeInTheDocument())
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('mantiene abierto y muestra toast si falla', async () => {
    setup(vi.fn().mockRejectedValue(new Error('Falló')))
    await userEvent.click(screen.getByText('Abrir'))
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar' }))
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Falló'))
    expect(screen.getByText('¿Seguro?')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Confirmar' })).toBeEnabled()
  })

  it('con tone="danger" el botón de confirmar es destructive', async () => {
    setup(vi.fn(), 'danger')
    await userEvent.click(screen.getByText('Abrir'))
    expect(screen.getByRole('button', { name: 'Confirmar' })).toHaveAttribute('data-variant', 'destructive')
  })

  it('con tone="default" el botón de confirmar es default', async () => {
    setup(vi.fn(), 'default')
    await userEvent.click(screen.getByText('Abrir'))
    expect(screen.getByRole('button', { name: 'Confirmar' })).toHaveAttribute('data-variant', 'default')
  })
})
