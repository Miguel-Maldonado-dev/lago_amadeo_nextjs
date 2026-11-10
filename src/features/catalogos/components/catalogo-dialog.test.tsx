import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Button } from '@/components/ui/button'
import { guardarCatalogo } from '../actions'
import { AVISO_NOMBRE } from '../messages'
import { CatalogoDialog } from './catalogo-dialog'

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }))
vi.mock('../actions', () => ({ guardarCatalogo: vi.fn(), guardarTipoCuota: vi.fn() }))

const item = { id: 4, nombre: 'Pago tardío', importe: 50 }

async function abrir(props: Partial<Parameters<typeof CatalogoDialog>[0]> = {}) {
  const user = userEvent.setup()
  render(<CatalogoDialog catalogo="descuentos" trigger={<Button>Abrir</Button>} {...props} />)
  await user.click(screen.getByRole('button', { name: 'Abrir' }))
  return user
}

describe('CatalogoDialog', () => {
  beforeEach(() => vi.mocked(guardarCatalogo).mockReset().mockResolvedValue({ ok: true, data: undefined }))

  it('agrega un descuento', async () => {
    const user = await abrir()
    expect(screen.getByRole('dialog', { name: 'Agregar descuento' })).toBeInTheDocument()
    await user.type(screen.getByLabelText(/Nombre/), 'Comité')
    await user.type(screen.getByLabelText(/Monto/), '250')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))
    expect(guardarCatalogo).toHaveBeenCalledWith('descuentos', null, { nombre: 'Comité', importe: 250 })
  })

  it('rechaza importes con coma sin llamar a la acción', async () => {
    const user = await abrir()
    await user.type(screen.getByLabelText(/Nombre/), 'Comité')
    await user.type(screen.getByLabelText(/Monto/), '250,50')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))
    expect(await screen.findByText('Ingresa un importe válido')).toBeInTheDocument()
    expect(guardarCatalogo).not.toHaveBeenCalled()
  })

  it('al editar avisa solo si cambia el nombre', async () => {
    const user = await abrir({ catalogo: 'recargos', item })
    expect(screen.getByRole('dialog', { name: 'Editar recargo' })).toBeInTheDocument()
    expect(screen.queryByText(AVISO_NOMBRE)).not.toBeInTheDocument()
    await user.type(screen.getByLabelText(/Nombre/), 's')
    expect(screen.getByText(AVISO_NOMBRE)).toBeInTheDocument()
  })

  it('cancelar y reabrir muestra los valores guardados', async () => {
    const user = await abrir({ catalogo: 'recargos', item })
    await user.clear(screen.getByLabelText(/Nombre/))
    await user.type(screen.getByLabelText(/Nombre/), 'Otro')
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    await user.click(screen.getByRole('button', { name: 'Abrir' }))
    expect(screen.getByLabelText(/Nombre/)).toHaveValue('Pago tardío')
  })
})
