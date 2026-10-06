import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SearchInput } from './search-input'

describe('SearchInput', () => {
  it('emits progressive values synchronously', async () => {
    const onChange = vi.fn()
    render(<SearchInput value="" onChange={onChange} placeholder="Buscar" />)
    await userEvent.type(screen.getByRole('textbox', { name: 'Buscar' }), 'abc')
    expect(onChange.mock.calls.map((c) => c[0])).toEqual(['a', 'b', 'c'])
    expect(onChange).toHaveBeenLastCalledWith('c')
  })

  it('shows an empty input when the parent resets value', () => {
    const { rerender } = render(<SearchInput value="abc" onChange={vi.fn()} placeholder="Buscar" />)
    expect(screen.getByRole('textbox', { name: 'Buscar' })).toHaveValue('abc')
    rerender(<SearchInput value="" onChange={vi.fn()} placeholder="Buscar" />)
    expect(screen.getByRole('textbox', { name: 'Buscar' })).toHaveValue('')
  })
})
