import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { FormDialog } from './form-dialog'

describe('FormDialog', () => {
  it('abierto muestra el botón Cerrar en español', () => {
    render(
      <FormDialog title="Nuevo domicilio" open onOpenChange={vi.fn()}>
        <p>Contenido</p>
      </FormDialog>,
    )
    expect(screen.getByRole('dialog', { name: 'Nuevo domicilio' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cerrar' })).toBeInTheDocument()
  })

  it('el cuerpo deja 4 px abajo y a los lados para que no se corte el anillo de foco del último campo', () => {
    render(
      <FormDialog title="Agregar Número" open onOpenChange={vi.fn()}>
        <input aria-label="Número" />
      </FormDialog>,
    )
    const body = screen.getByRole('textbox', { name: 'Número' }).closest('[data-slot="form-dialog-body"]')
    expect(body).toHaveClass('overflow-y-auto', 'px-1', 'pb-1')
  })
})
