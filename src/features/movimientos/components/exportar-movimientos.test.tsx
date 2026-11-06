import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Views } from '@/lib/supabase/types'
import { ExportarMovimientos } from './exportar-movimientos'

const { crearExcel, crearPdf, descargar } = vi.hoisted(() => ({
  crearExcel: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
  crearPdf: vi.fn().mockReturnValue(new ArrayBuffer(8)),
  descargar: vi.fn(),
}))
vi.mock('../export/generar', () => ({ crearExcel, crearPdf }))
vi.mock('@/lib/download', () => ({ descargar }))
vi.mock('@/lib/dates', async (orig) => ({ ...(await orig<object>()), todayISO: () => '2026-11-05' }))

const mov = (id: number, tipo_id: number, importe: number) =>
  ({ id, tipo_id, tipo_movimiento: tipo_id === 1 ? 'Ingreso' : 'Egreso', importe, descripcion: `M${id}`, fecha_movimiento: '2026-03-05' }) as Views<'movimientos_info'>
const rows = [mov(1, 1, 300), mov(2, 2, 120)]
const filtros = { query: '', anio: 2026, mes: 3, tipo: null }

async function exportar(opcion: RegExp) {
  render(<ExportarMovimientos rows={rows} filtros={filtros} />)
  await userEvent.click(screen.getByRole('button', { name: 'Exportar' }))
  await userEvent.click(screen.getByRole('menuitem', { name: opcion }))
}

describe('ExportarMovimientos', () => {
  beforeEach(() => vi.clearAllMocks())

  it('exporta a Excel las filas filtradas', async () => {
    await exportar(/Excel/)
    await waitFor(() => expect(descargar).toHaveBeenCalled())
    expect(crearExcel).toHaveBeenCalledWith([
      { tipo: 'Ingreso', descripcion: 'M1', importe: 300, fecha: '2026-03-05' },
      { tipo: 'Egreso', descripcion: 'M2', importe: -120, fecha: '2026-03-05' },
    ])
    const [blob, nombre] = descargar.mock.lastCall!
    expect(nombre).toBe('movimientos-2026-11-05.xlsx')
    expect((blob as Blob).type).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  })

  it('exporta a PDF con filtros y consolidado de ingresos y egresos', async () => {
    await exportar(/PDF/)
    await waitFor(() => expect(descargar).toHaveBeenCalled())
    expect(crearPdf.mock.lastCall![1]).toEqual({
      filtros: 'Año: 2026 · Mes: Marzo · Tipo: Todos',
      generado: '2026-11-05',
      totales: { ingresos: 300, egresos: 120 },
    })
    expect(descargar.mock.lastCall![1]).toBe('movimientos-2026-11-05.pdf')
  })

  it('sin movimientos el botón queda deshabilitado', () => {
    render(<ExportarMovimientos rows={[]} filtros={filtros} />)
    expect(screen.getByRole('button', { name: 'Exportar' })).toBeDisabled()
  })
})
