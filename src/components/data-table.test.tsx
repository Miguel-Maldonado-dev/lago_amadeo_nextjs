import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DataTable, type Column } from './data-table'

const { push } = vi.hoisted(() => ({ push: vi.fn() }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }))

type Row = { id: number; name: string }
const columns: Column<Row>[] = [
  { key: 'name', header: 'Nombre', cell: (r) => r.name },
]
const makeRows = (n: number): Row[] =>
  Array.from({ length: n }, (_, i) => ({ id: i + 1, name: `Fila ${i + 1}` }))

type Persona = { id: number; nombre: string | null }
const personaColumns: Column<Persona>[] = [
  { key: 'id', header: 'ID', cell: (r) => `#${r.id}` },
  { key: 'nombre', header: 'Nombre', cell: (r) => r.nombre ?? '—', sortValue: (r) => r.nombre },
]
const personas: Persona[] = [
  { id: 1, nombre: 'Mario' },
  { id: 2, nombre: null },
  { id: 3, nombre: 'Zoe' },
  { id: 4, nombre: 'Ana' },
  { id: 5, nombre: 'beto' },
]
const nombreCells = () =>
  screen
    .getAllByRole('row')
    .slice(1)
    .map((row) => within(row).getAllByRole('cell')[1].textContent)

describe('DataTable', () => {
  it('muestra 10 filas por página y navega con Siguiente', async () => {
    render(<DataTable columns={columns} rows={makeRows(25)} getRowKey={(r) => r.id} />)
    expect(screen.getAllByRole('row')).toHaveLength(11)
    expect(screen.getByText('Página 1 de 3')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Anterior' })).not.toHaveClass('h-9')
    await userEvent.click(screen.getByRole('button', { name: 'Siguiente' }))
    expect(screen.getByText('Fila 11')).toBeInTheDocument()
    expect(screen.getByText('Fila 20')).toBeInTheDocument()
    expect(screen.queryByText('Fila 10')).not.toBeInTheDocument()
    expect(screen.queryByText('Fila 21')).not.toBeInTheDocument()
    expect(screen.getByText('Página 2 de 3')).toBeInTheDocument()
  })

  it('muestra EmptyState sin filas', () => {
    render(<DataTable columns={columns} rows={[]} getRowKey={(r) => r.id} />)
    expect(screen.getByText('Sin información disponible')).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('muestra emptyAction en el vacío y toolbar sobre la tabla', () => {
    const { rerender } = render(
      <DataTable
        columns={columns}
        rows={[]}
        getRowKey={(r) => r.id}
        emptyAction={<button>Crear</button>}
        toolbar={<span>Barra</span>}
      />,
    )
    expect(screen.getByRole('button', { name: 'Crear' })).toBeInTheDocument()
    rerender(
      <DataTable columns={columns} rows={makeRows(2)} getRowKey={(r) => r.id} toolbar={<span>Barra</span>} />,
    )
    expect(screen.getByText('Barra')).toBeInTheDocument()
  })

  it('ordena por columna asc → desc → sin orden con nulos al final', async () => {
    render(<DataTable columns={personaColumns} rows={personas} getRowKey={(r) => r.id} />)
    const header = screen.getByRole('columnheader', { name: 'Nombre' })
    expect(header).toHaveAttribute('aria-sort', 'none')
    expect(screen.getByRole('columnheader', { name: 'ID' })).not.toHaveAttribute('aria-sort')

    await userEvent.click(screen.getByRole('button', { name: 'Nombre' }))
    expect(header).toHaveAttribute('aria-sort', 'ascending')
    expect(nombreCells()).toEqual(['Ana', 'beto', 'Mario', 'Zoe', '—'])

    await userEvent.click(screen.getByRole('button', { name: 'Nombre' }))
    expect(header).toHaveAttribute('aria-sort', 'descending')
    expect(nombreCells()).toEqual(['Zoe', 'Mario', 'beto', 'Ana', '—'])

    await userEvent.click(screen.getByRole('button', { name: 'Nombre' }))
    expect(header).toHaveAttribute('aria-sort', 'none')
    expect(nombreCells()).toEqual(['Mario', '—', 'Zoe', 'Ana', 'beto'])
  })

  it('cambiar el orden reinicia a la página 1', async () => {
    const sortable: Column<Row>[] = [{ ...columns[0], sortValue: (r) => r.id }]
    render(<DataTable columns={sortable} rows={makeRows(25)} getRowKey={(r) => r.id} />)
    await userEvent.click(screen.getByRole('button', { name: 'Siguiente' }))
    expect(screen.getByText('Mostrando 11 a 20 de 25 registros')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Nombre' }))
    expect(screen.getByText('Mostrando 1 a 10 de 25 registros')).toBeInTheDocument()
  })

  it('elegir 25 filas por página muestra 25 de 30 con entityLabel en el pie', async () => {
    render(
      <DataTable columns={columns} rows={makeRows(30)} getRowKey={(r) => r.id} entityLabel="domicilios" />,
    )
    expect(screen.getByText('Mostrando 1 a 10 de 30 domicilios')).toBeInTheDocument()
    expect(screen.getByLabelText('Filas por página')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.click(screen.getByRole('option', { name: '25' }))
    expect(screen.getAllByRole('row')).toHaveLength(26)
    expect(screen.getByText('Mostrando 1 a 25 de 30 domicilios')).toBeInTheDocument()
  })

  it('el botón Última página lleva a la última', async () => {
    render(<DataTable columns={columns} rows={makeRows(25)} getRowKey={(r) => r.id} />)
    expect(screen.getByRole('button', { name: 'Primera página' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Página anterior' })).toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: 'Última página' }))
    expect(screen.getByText('Fila 21')).toBeInTheDocument()
    expect(screen.queryByText('Fila 20')).not.toBeInTheDocument()
    expect(screen.getByText('Mostrando 21 a 25 de 25 registros')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Página 3' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: 'Última página' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Página siguiente' })).toBeDisabled()
  })

  it('páginas numéricas con ventana ±2 y elipsis', async () => {
    render(<DataTable columns={columns} rows={makeRows(100)} getRowKey={(r) => r.id} />)
    const pageButtons = () =>
      screen.getAllByRole('button').filter((b) => /^\d+$/.test(b.textContent ?? '')).map((b) => b.textContent)
    expect(pageButtons()).toEqual(['1', '2', '3', '10'])
    await userEvent.click(screen.getByRole('button', { name: 'Página 3' }))
    await userEvent.click(screen.getByRole('button', { name: 'Página 5' }))
    expect(pageButtons()).toEqual(['1', '3', '4', '5', '6', '7', '10'])
    expect(screen.getAllByText('…')).toHaveLength(2)
    screen.getAllByText('…').forEach((gap) => expect(gap).toHaveAttribute('aria-hidden', 'true'))
  })

  it('el paginador de escritorio es una navegación etiquetada con páginas nombradas', () => {
    render(<DataTable columns={columns} rows={makeRows(25)} getRowKey={(r) => r.id} />)
    const nav = screen.getByRole('navigation', { name: 'Paginación' })
    expect(within(nav).getByRole('button', { name: 'Primera página' })).toBeInTheDocument()
    expect(within(nav).getByRole('button', { name: 'Página 1' })).toHaveAttribute('aria-current', 'page')
    expect(within(nav).getByRole('button', { name: 'Página 3' })).not.toHaveAttribute('aria-current')
  })

  it('un sortValue NaN se trata como nulo y queda al final en asc y en desc', async () => {
    type Monto = { id: number; monto: number }
    const montoColumns: Column<Monto>[] = [
      { key: 'id', header: 'ID', cell: (r) => `#${r.id}` },
      { key: 'monto', header: 'Monto', cell: (r) => String(r.monto), sortValue: (r) => r.monto },
    ]
    const montos: Monto[] = [
      { id: 1, monto: 30 },
      { id: 2, monto: Number.NaN },
      { id: 3, monto: 10 },
      { id: 4, monto: 20 },
    ]
    render(<DataTable columns={montoColumns} rows={montos} getRowKey={(r) => r.id} />)
    await userEvent.click(screen.getByRole('button', { name: 'Monto' }))
    expect(nombreCells()).toEqual(['10', '20', '30', 'NaN'])
    await userEvent.click(screen.getByRole('button', { name: 'Monto' }))
    expect(nombreCells()).toEqual(['30', '20', '10', 'NaN'])
  })

  it('hideBelow md añade hidden md:table-cell a cabecera y celda; align right añade text-right', () => {
    const cols: Column<Row>[] = [
      ...columns,
      { key: 'extra', header: 'Extra', cell: (r) => `x${r.id}`, hideBelow: 'md' },
      { key: 'monto', header: 'Monto', cell: (r) => `$${r.id}`, hideBelow: 'lg', align: 'right' },
    ]
    render(<DataTable columns={cols} rows={makeRows(1)} getRowKey={(r) => r.id} />)
    expect(screen.getByRole('columnheader', { name: 'Extra' })).toHaveClass('hidden', 'md:table-cell')
    expect(screen.getByText('x1').closest('td')).toHaveClass('hidden', 'md:table-cell')
    expect(screen.getByRole('columnheader', { name: 'Monto' })).toHaveClass('hidden', 'lg:table-cell', 'text-right')
    expect(screen.getByText('$1').closest('td')).toHaveClass('hidden', 'lg:table-cell', 'text-right')
    expect(screen.getByRole('columnheader', { name: 'Nombre' })).not.toHaveClass('hidden')
  })

  describe('rowHref', () => {
    const linkColumns: Column<Row>[] = [
      ...columns,
      { key: 'accion', header: 'Acción', cell: (r) => <button type="button">Menú {r.id}</button> },
    ]
    const renderLinked = (rowHref: (r: Row) => string | undefined = (r) => `/fila/${r.id}`) =>
      render(<DataTable columns={linkColumns} rows={makeRows(2)} getRowKey={(r) => r.id} rowHref={rowHref} />)

    afterEach(() => {
      push.mockClear()
      vi.restoreAllMocks()
    })

    it('al hacer clic en cualquier parte de la fila navega a su ruta', async () => {
      renderLinked()
      await userEvent.click(screen.getByText('Fila 2'))
      expect(push).toHaveBeenCalledWith('/fila/2')
      expect(screen.getByText('Fila 2').closest('tr')).toHaveClass('cursor-pointer')
    })

    it('los clics en botones o enlaces de la fila no navegan', async () => {
      renderLinked()
      await userEvent.click(screen.getByRole('button', { name: 'Menú 1' }))
      expect(push).not.toHaveBeenCalled()
    })

    it('con Ctrl/Cmd abre la ruta en otra pestaña', async () => {
      const open = vi.spyOn(window, 'open').mockReturnValue(null)
      renderLinked()
      const user = userEvent.setup()
      await user.keyboard('{Control>}')
      await user.click(screen.getByText('Fila 1'))
      expect(open).toHaveBeenCalledWith('/fila/1', '_blank', 'noopener')
      expect(push).not.toHaveBeenCalled()
    })

    it('si hay texto seleccionado no navega', async () => {
      vi.spyOn(window, 'getSelection').mockReturnValue({ toString: () => 'Fila' } as Selection)
      renderLinked()
      fireEvent.click(screen.getByText('Fila 1'))
      expect(push).not.toHaveBeenCalled()
    })

    it('una fila sin ruta no es clicable', async () => {
      renderLinked((r) => (r.id === 1 ? undefined : `/fila/${r.id}`))
      await userEvent.click(screen.getByText('Fila 1'))
      expect(push).not.toHaveBeenCalled()
      expect(screen.getByText('Fila 1').closest('tr')).not.toHaveClass('cursor-pointer')
    })

    it('sin rowHref las filas no son clicables', () => {
      render(<DataTable columns={columns} rows={makeRows(1)} getRowKey={(r) => r.id} />)
      expect(screen.getByText('Fila 1').closest('tr')).not.toHaveClass('cursor-pointer')
    })
  })
})
