import { render, screen } from '@testing-library/react'
import { Users } from 'lucide-react'
import { describe, expect, it } from 'vitest'
import { MetricCard } from './metric-card'

describe('MetricCard', () => {
  it('renders label, value and badge', () => {
    render(<MetricCard label="Al corriente" value="152" icon={Users} badge={{ text: '96.2 %', tone: 'success' }} />)
    expect(screen.getByText('Al corriente')).toBeInTheDocument()
    expect(screen.getByText('152')).toBeInTheDocument()
    expect(screen.getByText('96.2 %').className).toContain('bg-success-light')
  })
  it('lays the card out horizontally (flex-row overrides the Card flex-col base)', () => {
    const { container } = render(<MetricCard label="Al corriente" value="152" icon={Users} />)
    const card = container.querySelector('[data-slot="card"]')
    expect(card).toHaveClass('flex-row')
    expect(card).not.toHaveClass('flex-col')
  })
  it('compact density uses equal padding on all sides and keeps the label on one line', () => {
    const { container } = render(<MetricCard label="Ingresos acumulados" value="$187,733.00" icon={Users} density="compact" />)
    const card = container.querySelector('[data-slot="card"]')
    expect(card).toHaveClass('p-5')
    expect(card).not.toHaveClass('py-3.5')
    expect(container.querySelector('[data-slot="metric-icon"]')).toHaveClass('size-10')
    const label = screen.getByText('Ingresos acumulados')
    expect(label).toHaveClass('truncate')
    expect(label).toHaveAttribute('title', 'Ingresos acumulados')
  })
  it('compact density puts the icon above the text when the card is narrow and beside it when wide', () => {
    const { container } = render(<MetricCard label="Saldo actual" value="$60,706.27" icon={Users} density="compact" />)
    expect(container.querySelector('[data-slot="card"]')).toHaveClass('@container')
    const body = container.querySelector('[data-slot="metric-body"]')
    expect(body).toHaveClass('flex-col', '@min-[11.5rem]:flex-row', '@min-[11.5rem]:items-center')
  })
  it('default density keeps the original spacing', () => {
    const { container } = render(<MetricCard label="Al corriente" value="152" icon={Users} />)
    expect(container.querySelector('[data-slot="card"]')).toHaveClass('p-6')
    expect(container.querySelector('[data-slot="metric-icon"]')).toHaveClass('size-14')
  })
  it('no badge when absent', () => {
    render(<MetricCard label="Al corriente" value="152" icon={Users} />)
    expect(screen.queryByText('96.2 %')).toBeNull()
  })
})
