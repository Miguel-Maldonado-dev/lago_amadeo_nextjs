import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Eye, Trash2 } from 'lucide-react'
import { describe, expect, it, vi } from 'vitest'
import { RowActions } from './row-actions'

describe('RowActions', () => {
  it('abre el menú y muestra Ver detalle como enlace', async () => {
    render(<RowActions items={[{ label: 'Ver detalle', icon: Eye, href: '/domicilios/5' }]} />)
    expect(screen.queryByRole('menuitem')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Acciones' }))
    expect(screen.getByRole('menuitem', { name: 'Ver detalle' })).toHaveAttribute('href', '/domicilios/5')
    expect(screen.getByRole('menuitem', { name: 'Ver detalle' })).toHaveAttribute('data-variant', 'default')
  })

  it('un ítem con onSelect lo invoca y tone danger usa la variante destructive', async () => {
    const onSelect = vi.fn()
    render(
      <RowActions
        label="Acciones de Ana"
        items={[{ label: 'Eliminar', icon: Trash2, onSelect, tone: 'danger' }]}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Acciones de Ana' }))
    const item = screen.getByRole('menuitem', { name: 'Eliminar' })
    expect(item).toHaveAttribute('data-variant', 'destructive')
    await userEvent.click(item)
    expect(onSelect).toHaveBeenCalledTimes(1)
  })
})
