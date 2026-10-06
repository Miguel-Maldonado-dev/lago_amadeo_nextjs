import { render, screen } from '@testing-library/react'
import { Users } from 'lucide-react'
import { describe, expect, it } from 'vitest'
import { SectionCard } from './section-card'

describe('SectionCard', () => {
  it('por defecto el cuerpo tiene relleno', () => {
    const { container } = render(<SectionCard title="Residentes">contenido</SectionCard>)
    expect(container.querySelector('[data-slot="section-card-body"]')).toHaveClass('px-5', 'pb-5')
  })

  it('flush deja el cuerpo sin relleno para tablas de borde a borde', () => {
    const { container } = render(
      <SectionCard title="Últimos movimientos" flush>
        contenido
      </SectionCard>,
    )
    const body = container.querySelector('[data-slot="section-card-body"]')
    expect(body).not.toHaveClass('px-5')
    expect(body).not.toHaveClass('pb-5')
  })

  it('muestra un ícono decorativo junto al título', () => {
    const { container } = render(
      <SectionCard title="Residentes" icon={Users}>
        contenido
      </SectionCard>,
    )
    const icon = container.querySelector('[data-slot="section-card-icon"]')
    expect(icon).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByRole('heading', { level: 2, name: 'Residentes' })).toBeInTheDocument()
  })

  it('sin ícono no lo renderiza', () => {
    const { container } = render(<SectionCard title="Residentes">contenido</SectionCard>)
    expect(container.querySelector('[data-slot="section-card-icon"]')).toBeNull()
  })
})
