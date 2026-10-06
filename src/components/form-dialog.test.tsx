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
})
