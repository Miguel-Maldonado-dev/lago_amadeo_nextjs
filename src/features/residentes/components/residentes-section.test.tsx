import { render, screen } from '@testing-library/react'
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
  it('anuncia al residente principal como imagen con nombre accesible', () => {
    render(
      <ResidentesSection
        domicilioId={7}
        residentes={[residente(1, 'Ana López', true), residente(2, 'Luis Pérez', false)]}
      />,
    )
    expect(screen.getAllByRole('img', { name: 'Residente principal' })).toHaveLength(1)
  })

  it('los botones de acción nombran al residente', () => {
    render(<ResidentesSection domicilioId={7} residentes={[residente(1, 'Ana López', true)]} />)
    expect(screen.getByRole('button', { name: 'Editar Ana López' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Eliminar Ana López' })).toBeInTheDocument()
  })
})
