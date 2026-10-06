import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ReciboDialog } from './recibo-dialog'

afterEach(() => vi.unstubAllGlobals())

describe('ReciboDialog', () => {
  it('muestra mensaje si el pago no tiene recibo (404)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('x', { status: 404 })))
    render(<ReciboDialog pagoId={1} trigger={<button>Abrir</button>} />)
    await userEvent.click(screen.getByText('Abrir'))
    expect(await screen.findByText('Este pago no tiene recibo disponible.')).toBeInTheDocument()
  })

  it('renderiza el iframe con el PDF (200)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('%PDF', {
          status: 200,
          headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'inline; filename="abc-123.pdf"' },
        }),
      ),
    )
    const { baseElement } = render(<ReciboDialog pagoId={1} trigger={<button>Abrir</button>} />)
    await userEvent.click(screen.getByText('Abrir'))
    expect(await screen.findByTitle('Recibo')).toBeInTheDocument()
    expect(baseElement.querySelector('iframe')).not.toBeNull()
    expect(await screen.findByText('abc-123')).toBeInTheDocument()
  })
})
