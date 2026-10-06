import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Tables } from '@/lib/supabase/types'
import { ResidentesSection } from './residentes-section'

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }))
vi.mock('../actions', () => ({
  crearResidente: vi.fn(),
  actualizarResidente: vi.fn(),
  eliminarResidente: vi.fn(),
}))

const residente = (id: number, nombre: string, es_principal: boolean): Tables<'residentes'> => ({
  id,
  domicilio_id: 7,
  nombre,
  telefono: '5551234567',
  es_principal,
  created_at: '2026-01-01T00:00:00Z',
})

describe('ResidentesSection', () => {
  it('marca al residente principal con la etiqueta Sí', () => {
    render(
      <ResidentesSection
        domicilioId={7}
        residentes={[residente(1, 'Ana López', true), residente(2, 'Luis Pérez', false)]}
      />,
    )
    expect(screen.getByRole('columnheader', { name: 'Residente Principal' })).toBeInTheDocument()
    const fila = (nombre: string) => screen.getByText(nombre).closest('tr')!
    expect(within(fila('Ana López')).getByText('Sí').className).toContain('bg-success-light')
    expect(within(fila('Luis Pérez')).queryByText('Sí')).not.toBeInTheDocument()
  })

  it('los botones de acción nombran al residente', () => {
    render(<ResidentesSection domicilioId={7} residentes={[residente(1, 'Ana López', true)]} />)
    expect(screen.getByRole('button', { name: 'Editar Ana López' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Eliminar Ana López' })).toBeInTheDocument()
  })

  it('los botones de acción tienen borde, como en el resto de la app', () => {
    render(<ResidentesSection domicilioId={7} residentes={[residente(1, 'Ana López', true)]} />)
    expect(screen.getByRole('button', { name: 'Editar Ana López' })).toHaveAttribute('data-variant', 'secondary')
    expect(screen.getByRole('button', { name: 'Eliminar Ana López' })).toHaveAttribute('data-variant', 'secondary')
  })
})
