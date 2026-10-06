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
  it('no badge when absent', () => {
    render(<MetricCard label="Al corriente" value="152" icon={Users} />)
    expect(screen.queryByText('96.2 %')).toBeNull()
  })
})
