// @vitest-environment node
import ExcelJS from 'exceljs'
import { describe, expect, it } from 'vitest'
import { crearExcel, crearPdf } from './generar'

const filas = [
  { tipo: 'Ingreso', descripcion: 'Cuota marzo', importe: 250, fecha: '2026-03-05' },
  { tipo: 'Egreso', descripcion: 'Jardinería', importe: -100.5, fecha: '2026-03-10' },
]
const meta = {
  filtros: 'Año: 2026 · Mes: Marzo · Tipo: Todos',
  generado: '2026-11-05',
  totales: { ingresos: 250, egresos: 100.5 },
}

describe('crearExcel', () => {
  it('genera la tabla con encabezado, importes numéricos y fechas reales', async () => {
    const buffer = await crearExcel(filas)
    const wb = new ExcelJS.Workbook()
    await wb.xlsx.load(buffer)
    const ws = wb.worksheets[0]
    expect(ws.getRow(1).values).toEqual([undefined, 'Tipo', 'Descripción', 'Importe', 'Fecha'])
    expect(ws.getRow(1).font?.bold).toBe(true)
    expect(ws.getCell('A3').value).toBe('Egreso')
    expect(ws.getCell('C3').value).toBe(-100.5)
    expect(ws.getCell('D2').value).toEqual(new Date(Date.UTC(2026, 2, 5)))
    expect(ws.rowCount).toBe(3)
  })
})

describe('crearPdf', () => {
  it('genera un PDF con las filas, los filtros y el consolidado al final', () => {
    const pdf = new TextDecoder('latin1').decode(crearPdf(filas, meta))
    expect(pdf.startsWith('%PDF')).toBe(true)
    for (const texto of ['Movimientos financieros', 'Mes: Marzo', 'Jardinería', 'Total de ingresos', 'Total de egresos']) {
      expect(pdf).toContain(texto)
    }
  })
})
