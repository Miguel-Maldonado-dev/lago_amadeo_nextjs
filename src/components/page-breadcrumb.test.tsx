import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PageBreadcrumb } from './page-breadcrumb'

describe('PageBreadcrumb', () => {
  it('enlaza Inicio y los niveles con ruta; el último es la página actual', () => {
    render(<PageBreadcrumb items={[{ label: 'Domicilios', href: '/domicilios' }, { label: 'AMADEO 1000' }]} />)
    expect(screen.getByRole('link', { name: 'Inicio' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Domicilios' })).toHaveAttribute('href', '/domicilios')
    expect(screen.getByText('AMADEO 1000')).toHaveAttribute('aria-current', 'page')
  })
})
