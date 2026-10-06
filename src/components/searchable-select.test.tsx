import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SearchableSelect } from './searchable-select'

const options = [
  { value: 'a', label: 'Lago Norte' },
  { value: 'b', label: 'Casa Sur' },
  { value: 'c', label: 'LAGO Este' },
]

describe('SearchableSelect', () => {
  it('filtra por label sin distinguir mayúsculas y selecciona', async () => {
    const onChange = vi.fn()
    render(
      <SearchableSelect options={options} value={null} onChange={onChange} placeholder="Elige" />,
    )
    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.type(screen.getByPlaceholderText('Buscar...'), 'lago')
    expect(screen.getByText('Lago Norte')).toBeInTheDocument()
    expect(screen.getByText('LAGO Este')).toBeInTheDocument()
    expect(screen.queryByText('Casa Sur')).not.toBeInTheDocument()
    await userEvent.click(screen.getByText('LAGO Este'))
    expect(onChange).toHaveBeenCalledWith('c')
  })

  it('muestra la etiqueta seleccionada y permite limpiar', async () => {
    const onChange = vi.fn()
    render(
      <SearchableSelect options={options} value="b" onChange={onChange} placeholder="Elige" allowClear />,
    )
    expect(screen.getByRole('combobox')).toHaveTextContent('Casa Sur')
    await userEvent.click(screen.getByRole('button', { name: 'Limpiar' }))
    expect(onChange).toHaveBeenCalledWith(null)
  })
})
