import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CatalogosTabs } from './catalogos-tabs'

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }), usePathname: () => '/configuracion' }))

describe('CatalogosTabs', () => {
  it('muestra una pestaña por catálogo y cambia la URL al elegir otra', async () => {
    render(<CatalogosTabs tab="cuotas">contenido</CatalogosTabs>)
    expect(screen.getAllByRole('tab').map((t) => t.textContent)).toEqual([
      'Tipos de cuota',
      'Conceptos extra',
      'Descuentos',
      'Recargos',
    ])
    await userEvent.click(screen.getByRole('tab', { name: 'Descuentos' }))
    expect(replace).toHaveBeenCalledWith('/configuracion?tab=descuentos')
  })
})
