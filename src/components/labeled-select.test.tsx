import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { LabeledSelect } from './labeled-select'

describe('LabeledSelect', () => {
  it('associates label and maps __all__ to null', async () => {
    const onChange = vi.fn()
    render(
      <LabeledSelect
        id="estatus"
        label="Estatus"
        value="a"
        onChange={onChange}
        options={[{ value: 'a', label: 'Activo' }]}
        allLabel="Todos los estatus"
      />,
    )
    expect(screen.getByLabelText('Estatus')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.click(screen.getByRole('option', { name: 'Todos los estatus' }))
    expect(onChange).toHaveBeenCalledWith(null)
  })
})
