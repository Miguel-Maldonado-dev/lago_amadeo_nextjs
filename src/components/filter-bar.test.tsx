import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { FilterBar } from './filter-bar'

describe('FilterBar', () => {
  it('shows clear button and calls onClear', async () => {
    const onClear = vi.fn()
    render(<FilterBar onClear={onClear}><span>x</span></FilterBar>)
    await userEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' }))
    expect(onClear).toHaveBeenCalled()
  })
  it('lays the filters out horizontally (flex-row overrides the Card flex-col base)', () => {
    const { container } = render(<FilterBar><span>x</span></FilterBar>)
    const card = container.querySelector('[data-slot="card"]')
    expect(card).toHaveClass('flex-row')
    expect(card).not.toHaveClass('flex-col')
  })
  it('no button without onClear', () => {
    render(<FilterBar><span>x</span></FilterBar>)
    expect(screen.queryByRole('button')).toBeNull()
  })
})
