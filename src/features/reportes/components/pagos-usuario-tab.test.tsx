import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import type { Views } from '@/lib/supabase/types'
import { PagosUsuarioResultado } from './pagos-usuario-resultado'

const row = (id: number, importe: number) =>
  ({
    id,
    referencia: `REF-${id}`,
    nombre_usuario: 'Ana',
    metodo_pago_nombre: 'Efectivo',
    importe,
    fecha_pago: '2026-01-10',
  }) as Views<'reporte_pagos_detalle'>

describe('PagosUsuarioResultado', () => {
  test('muestra el total', () => {
    render(<PagosUsuarioResultado rows={[row(1, 100), row(2, 50)]} />)
    expect(screen.getByText('Total')).toBeInTheDocument()
    expect(screen.getByText('$150.00')).toBeInTheDocument()
  })

  test('muestra EmptyState sin filas', () => {
    render(<PagosUsuarioResultado rows={[]} />)
    expect(screen.getByText('Sin información disponible')).toBeInTheDocument()
  })
})
