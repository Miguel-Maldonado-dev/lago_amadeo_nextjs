import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Button } from '@/components/ui/button'
import { NumeroDialog } from './numero-dialog'

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }))
vi.mock('../actions', () => ({
  crearTelefono: vi.fn(),
  actualizarTelefono: vi.fn(),
  crearTarjeta: vi.fn(),
  actualizarTarjeta: vi.fn(),
}))

const writeText = vi.fn().mockResolvedValue(undefined)

async function abrir(props: Partial<Parameters<typeof NumeroDialog>[0]> = {}) {
  const user = userEvent.setup()
  // userEvent.setup() instala su propio portapapeles; el simulado va después.
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
  render(<NumeroDialog kind="tarjeta" domicilioId={7} trigger={<Button>Abrir</Button>} {...props} />)
  await user.click(screen.getByRole('button', { name: 'Abrir' }))
  return user
}

describe('NumeroDialog · tarjeta', () => {
  beforeEach(() => writeText.mockClear())

  it('calcula Facility y Card ID mientras se escribe el código', async () => {
    const user = await abrir()
    await user.type(screen.getByLabelText(/Número de tarjeta/), '8518512')
    expect(screen.getByRole('textbox', { name: 'Facility' })).toHaveValue('129')
    expect(screen.getByRole('textbox', { name: 'Card ID' })).toHaveValue('64368')
  })

  it('al editar muestra el desglose de la tarjeta desde que se abre', async () => {
    await abrir({ item: { id: 1, valor: '0008517721' } })
    expect(screen.getByRole('textbox', { name: 'Facility' })).toHaveValue('129')
    expect(screen.getByRole('textbox', { name: 'Card ID' })).toHaveValue('63577')
  })

  it('los valores son de solo lectura y se copian con su botón', async () => {
    const user = await abrir({ item: { id: 1, valor: '8518512' } })
    expect(screen.getByRole('textbox', { name: 'Facility' })).toHaveAttribute('readonly')
    await user.click(screen.getByRole('button', { name: 'Copiar Facility' }))
    expect(writeText).toHaveBeenCalledWith('129')
    await user.click(screen.getByRole('button', { name: 'Copiar Card ID' }))
    expect(writeText).toHaveBeenCalledWith('64368')
  })

  it('sin código los valores quedan vacíos y no se pueden copiar', async () => {
    await abrir()
    expect(screen.getByRole('textbox', { name: 'Facility' })).toHaveValue('')
    expect(screen.getByRole('button', { name: 'Copiar Facility' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Copiar Card ID' })).toBeDisabled()
  })

  it('avisa cuando el código excede 32 bits', async () => {
    const user = await abrir()
    await user.type(screen.getByLabelText(/Número de tarjeta/), '4294967296')
    expect(screen.getByText('El código excede 32 bits')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Card ID' })).toHaveValue('')
  })
})

describe('NumeroDialog · teléfono', () => {
  it('no muestra Facility ni Card ID', async () => {
    await abrir({ kind: 'telefono' })
    expect(screen.queryByRole('textbox', { name: 'Facility' })).not.toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: 'Card ID' })).not.toBeInTheDocument()
  })
})
