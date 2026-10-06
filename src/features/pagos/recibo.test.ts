import { beforeEach, expect, test, vi } from 'vitest'
import { invokeEdgeFunction } from '@/lib/supabase/functions'
import { generarReciboBase64, type ReciboPayload } from './recibo'

vi.mock('@/lib/supabase/functions', () => ({ invokeEdgeFunction: vi.fn() }))

const supabase = {} as never

const payload: ReciboPayload = {
  direccion: 'CALLE LAGO 12',
  residente: 'Ana López',
  periodo: 'OCTUBRE 2026',
  concepto: 'Cuota Mensual',
  fecha_vencimiento: '31/10/2026',
  importe: 250,
  descuento: 0,
  recargo: 100,
  fecha_pago: '05/10/2026',
  referencia: 'ref-uuid',
}

beforeEach(() => {
  vi.clearAllMocks()
})

test('respuesta 200 con file devuelve el base64', async () => {
  vi.mocked(invokeEdgeFunction).mockResolvedValue(
    new Response(JSON.stringify({ file: 'AAA', file_name: 'recibo_pago.pdf' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }),
  )

  await expect(generarReciboBase64(supabase, payload)).resolves.toBe('AAA')
  expect(invokeEdgeFunction).toHaveBeenCalledWith(supabase, 'generar-recibo-b64', {
    method: 'POST',
    body: payload,
  })
})

test('respuesta 500 devuelve null y registra el error', async () => {
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.mocked(invokeEdgeFunction).mockResolvedValue(new Response('boom', { status: 500 }))

  await expect(generarReciboBase64(supabase, payload)).resolves.toBeNull()
  expect(consoleError).toHaveBeenCalled()
  consoleError.mockRestore()
})

test('si fetch lanza devuelve null sin propagar el error', async () => {
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.mocked(invokeEdgeFunction).mockRejectedValue(new TypeError('fetch failed'))

  await expect(generarReciboBase64(supabase, payload)).resolves.toBeNull()
  expect(consoleError).toHaveBeenCalled()
  consoleError.mockRestore()
})
