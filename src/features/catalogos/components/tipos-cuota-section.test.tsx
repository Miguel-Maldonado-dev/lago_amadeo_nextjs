import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TiposCuotaSection } from './tipos-cuota-section'

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }))
vi.mock('../actions', () => ({ guardarTipoCuota: vi.fn(), guardarCatalogo: vi.fn() }))

const rows = [
  { id: 1, nombre: 'Acceso Completo', importe: 250, accesoTelefono: true, accesoTarjeta: true },
  { id: 2, nombre: 'Acceso Peatonal', importe: 100, accesoTelefono: false, accesoTarjeta: true },
]

describe('TiposCuotaSection', () => {
  it('muestra las columnas del catálogo', () => {
    render(<TiposCuotaSection rows={rows} />)
    for (const name of ['Nombre', 'Importe mensual', 'Acceso vehicular (teléfono)', 'Acceso peatonal (tarjeta)', 'Acciones']) {
      expect(screen.getByRole('columnheader', { name })).toBeInTheDocument()
    }
  })

  it('marca los accesos de cada tipo de cuota', () => {
    render(<TiposCuotaSection rows={rows} />)
    const fila = within(screen.getByText('Acceso Peatonal').closest('tr')!)
    const [, , telefono, tarjeta] = fila.getAllByRole('cell')
    expect(telefono).toHaveTextContent('—')
    expect(within(tarjeta).getByText('Sí').className).toContain('bg-success-light')
    expect(screen.getByRole('button', { name: 'Editar Acceso Peatonal' })).toBeInTheDocument()
    expect(screen.getByText('$100.00')).toBeInTheDocument()
  })

  it('sin elementos muestra el estado vacío', () => {
    render(<TiposCuotaSection rows={[]} />)
    expect(screen.getByText('Sin elementos')).toBeInTheDocument()
  })
})
