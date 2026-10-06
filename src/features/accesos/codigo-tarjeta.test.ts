import { describe, expect, it } from 'vitest'
import { desglosarCodigoTarjeta } from './codigo-tarjeta'

describe('desglosarCodigoTarjeta', () => {
  it('separa Facility (16 bits altos) y Card ID (16 bits bajos)', () => {
    expect(desglosarCodigoTarjeta('8518512')).toEqual({ ok: true, facility: 129, cardId: 64368 })
  })

  it('ignora los ceros a la izquierda', () => {
    expect(desglosarCodigoTarjeta('0008517721')).toEqual({ ok: true, facility: 129, cardId: 63577 })
  })

  it('cubre los extremos de 32 bits', () => {
    expect(desglosarCodigoTarjeta('0')).toEqual({ ok: true, facility: 0, cardId: 0 })
    expect(desglosarCodigoTarjeta('65535')).toEqual({ ok: true, facility: 0, cardId: 65535 })
    expect(desglosarCodigoTarjeta('65536')).toEqual({ ok: true, facility: 1, cardId: 0 })
    expect(desglosarCodigoTarjeta('4294967295')).toEqual({ ok: true, facility: 65535, cardId: 65535 })
  })

  it('rechaza códigos mayores a 32 bits', () => {
    expect(desglosarCodigoTarjeta('4294967296')).toEqual({ ok: false, motivo: 'excede-32-bits' })
    expect(desglosarCodigoTarjeta('9999999999')).toEqual({ ok: false, motivo: 'excede-32-bits' })
  })

  it('sin código o con caracteres no numéricos no hay desglose', () => {
    expect(desglosarCodigoTarjeta('')).toEqual({ ok: false, motivo: 'invalido' })
    expect(desglosarCodigoTarjeta('12a')).toEqual({ ok: false, motivo: 'invalido' })
    expect(desglosarCodigoTarjeta(' 12')).toEqual({ ok: false, motivo: 'invalido' })
  })
})
