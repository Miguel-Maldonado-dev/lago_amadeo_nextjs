import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PageHeader } from './page-header'

describe('PageHeader', () => {
  it('renders title, breadcrumb and actions', () => {
    const { container } = render(
      <PageHeader
        title="Domicilios"
        breadcrumbs={[{ label: 'Domicilios' }]}
        actions={<button>Nuevo</button>}
      />,
    )
    expect(screen.getByRole('heading', { level: 1, name: 'Domicilios' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Inicio' })).toHaveAttribute('href', '/')
    expect(screen.getAllByText('Domicilios').length).toBeGreaterThanOrEqual(2)
    expect(screen.getByRole('button', { name: 'Nuevo' })).toBeInTheDocument()
    expect(container.querySelectorAll('li li').length).toBe(0)
  })
})
