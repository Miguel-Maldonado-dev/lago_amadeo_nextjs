import { describe, expect, test } from 'vitest'
import { callsOf, fakeQuery, fakeSupabase } from '@/test/fake-query'
import { listConceptosExtraCatalogo, listTiposCuota } from './queries'

const sb = (q: ReturnType<typeof fakeQuery>) => fakeSupabase({ conceptos_pago: q }) as never

describe('listTiposCuota', () => {
  test('lee los conceptos recurrentes con sus accesos, ordenados por nombre', async () => {
    const q = fakeQuery({
      data: [
        { id: 2, nombre: 'Acceso Peatonal', importe: 100, concepto_pago_acceso: [{ acceso_telefono: false, acceso_tarjeta: true }] },
        { id: 9, nombre: 'Nuevo', importe: 50, concepto_pago_acceso: [] },
        { id: 1, nombre: 'Acceso Completo', importe: 250, concepto_pago_acceso: { acceso_telefono: true, acceso_tarjeta: true } },
      ],
    })
    const rows = await listTiposCuota(sb(q))
    expect(callsOf(q, 'select')[0].args).toEqual(['id, nombre, importe, concepto_pago_acceso(acceso_telefono, acceso_tarjeta)'])
    expect(callsOf(q, 'eq')[0].args).toEqual(['tipo_pago_id', 1])
    expect(callsOf(q, 'order')[0].args[0]).toBe('nombre')
    expect(rows).toEqual([
      { id: 2, nombre: 'Acceso Peatonal', importe: 100, accesoTelefono: false, accesoTarjeta: true },
      { id: 9, nombre: 'Nuevo', importe: 50, accesoTelefono: true, accesoTarjeta: true },
      { id: 1, nombre: 'Acceso Completo', importe: 250, accesoTelefono: true, accesoTarjeta: true },
    ])
  })

  test('propaga el error de lectura', async () => {
    await expect(listTiposCuota(sb(fakeQuery({ error: { message: 'boom' } })))).rejects.toThrow(
      'No se pudieron leer los tipos de cuota: boom',
    )
  })
})

describe('listConceptosExtraCatalogo', () => {
  test('lee los conceptos extra ordenados por nombre', async () => {
    const q = fakeQuery({ data: [{ id: 3, nombre: 'Tarjeta de Acceso', importe: 100 }] })
    expect(await listConceptosExtraCatalogo(sb(q))).toEqual([{ id: 3, nombre: 'Tarjeta de Acceso', importe: 100 }])
    expect(callsOf(q, 'eq')[0].args).toEqual(['tipo_pago_id', 2])
    expect(callsOf(q, 'order')[0].args[0]).toBe('nombre')
  })

  test('propaga el error de lectura', async () => {
    await expect(listConceptosExtraCatalogo(sb(fakeQuery({ error: { message: 'x' } })))).rejects.toThrow(
      'No se pudieron leer los conceptos extra: x',
    )
  })
})
