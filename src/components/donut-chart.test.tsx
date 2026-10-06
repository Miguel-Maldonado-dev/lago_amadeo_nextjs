import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DonutChart } from './donut-chart'

describe('DonutChart', () => {
  it('expone aria-label y leyenda', () => {
    const { container } = render(
      <DonutChart
        segments={[
          { label: 'Al corriente', value: 152, color: 'success' },
          { label: 'Morosos', value: 6, color: 'danger' },
        ]}
        total={158}
        centerLabel="Unidades"
        centerValue="158"
      />,
    )
    const svg = container.querySelector('svg[role=img]')
    expect(svg?.getAttribute('aria-label')).toContain('Al corriente: 152 (96.2 %)')
    expect(screen.getByText('Morosos')).toBeInTheDocument()
    expect(screen.getByText('158')).toBeInTheDocument()
  })
})
