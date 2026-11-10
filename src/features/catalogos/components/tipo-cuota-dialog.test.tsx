import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Button } from '@/components/ui/button'
import { guardarTipoCuota } from '../actions'
import { AVISO_IMPORTE } from '../messages'
import { TipoCuotaDialog } from './tipo-cuota-dialog'

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }))
vi.mock('../actions', () => ({ guardarCatalogo: vi.fn(), guardarTipoCuota: vi.fn() }))

const item = { id: 1, nombre: 'Acceso Completo', importe: 250, accesoTelefono: true, accesoTarjeta: true }

async function abrir(props: Partial<Parameters<typeof TipoCuotaDialog>[0]> = {}) {
  const user = userEvent.setup()
  render(<TipoCuotaDialog trigger={<Button>Abrir</Button>} {...props} />)
  await user.click(screen.getByRole('button', { name: 'Abrir' }))
  return user
}

describe('TipoCuotaDialog', () => {
  beforeEach(() => vi.mocked(guardarTipoCuota).mockReset().mockResolvedValue({ ok: true, data: undefined }))

  it('al crear, los dos accesos empiezan marcados', async () => {
    await abrir()
    expect(screen.getByRole('dialog', { name: 'Agregar tipo de cuota' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Acceso con teléfono (vehicular)' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Acceso con tarjeta (peatonal)' })).toBeChecked()
  })

  it('al cambiar el importe avisa y guarda con los accesos', async () => {
    const user = await abrir({ item })
    expect(screen.queryByText(AVISO_IMPORTE)).not.toBeInTheDocument()
    await user.clear(screen.getByLabelText(/Importe mensual/))
    await user.type(screen.getByLabelText(/Importe mensual/), '300')
    expect(screen.getByText(AVISO_IMPORTE)).toBeInTheDocument()
    await user.click(screen.getByRole('checkbox', { name: 'Acceso con tarjeta (peatonal)' }))
    await user.click(screen.getByRole('button', { name: 'Guardar' }))
    expect(guardarTipoCuota).toHaveBeenCalledWith(1, {
      nombre: 'Acceso Completo',
      importe: 300,
      accesoTelefono: true,
      accesoTarjeta: false,
    })
  })
})
