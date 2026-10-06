'use client'

import { useId, useMemo, useState, type ReactNode } from 'react'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUpDown,
  ChevronUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { EmptyState } from './empty-state'

type SortValue = string | number | null

export type Column<T> = {
  key: string
  header: string
  cell: (row: T) => ReactNode
  className?: string
  sortValue?: (row: T) => SortValue
  align?: 'left' | 'right'
  hideBelow?: 'md' | 'lg'
}

type SortState = { key: string; dir: 'asc' | 'desc' } | null

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50]

const HIDE_BELOW_CLASS = {
  md: 'hidden md:table-cell',
  lg: 'hidden lg:table-cell',
} as const

function columnClass<T>(c: Column<T>) {
  return cn(c.hideBelow && HIDE_BELOW_CLASS[c.hideBelow], c.align === 'right' && 'text-right', c.className)
}

function compareValues(a: SortValue | undefined, b: SortValue | undefined, dir: 'asc' | 'desc') {
  const aNull = a == null || (typeof a === 'number' && Number.isNaN(a))
  const bNull = b == null || (typeof b === 'number' && Number.isNaN(b))
  // Los nulos (y NaN) van siempre al final, sin importar la dirección.
  if (aNull || bNull) return aNull === bNull ? 0 : aNull ? 1 : -1
  const result =
    typeof a === 'number' && typeof b === 'number'
      ? a - b
      : String(a).localeCompare(String(b), 'es', { numeric: true, sensitivity: 'base' })
  return dir === 'asc' ? result : -result
}

/** Páginas visibles: 1, última y actual ±2; `null` marca un hueco (elipsis). */
function pageWindow(current: number, totalPages: number): (number | null)[] {
  const pages: (number | null)[] = []
  let prev = 0
  for (let p = 1; p <= totalPages; p++) {
    if (p !== 1 && p !== totalPages && Math.abs(p - current) > 2) continue
    if (p - prev > 1) pages.push(null)
    pages.push(p)
    prev = p
  }
  return pages
}

function ariaSort(sort: SortState, key: string) {
  if (sort?.key !== key) return 'none'
  return sort.dir === 'asc' ? 'ascending' : 'descending'
}

export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  pageSize = 10,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  entityLabel = 'registros',
  emptyTitle,
  emptyDescription,
  emptyAction,
  toolbar,
}: {
  columns: Column<T>[]
  rows: T[]
  getRowKey: (row: T) => string | number
  pageSize?: number
  pageSizeOptions?: number[]
  entityLabel?: string
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: ReactNode
  toolbar?: ReactNode
}) {
  const pageSizeId = useId()
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(pageSize)
  const [sort, setSort] = useState<SortState>(null)

  // Ajuste de estado durante el render: volver a la página 1 si cambian filas, orden o tamaño.
  const [prev, setPrev] = useState({ rows, sort, size })
  if (prev.rows !== rows || prev.sort !== sort || prev.size !== size) {
    setPrev({ rows, sort, size })
    setPage(1)
  }

  const sorted = useMemo(() => {
    if (!sort) return rows
    const getValue = columns.find((c) => c.key === sort.key)?.sortValue
    if (!getValue) return rows
    return rows
      .map((row) => ({ row, value: getValue(row) }))
      .sort((a, b) => compareValues(a.value, b.value, sort.dir))
      .map((entry) => entry.row)
  }, [rows, columns, sort])

  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
  }

  const total = sorted.length
  const totalPages = Math.max(1, Math.ceil(total / size))
  const current = Math.min(page, totalPages)
  const start = (current - 1) * size
  const visible = sorted.slice(start, start + size)
  const desde = start + 1
  const hasta = start + visible.length
  const isFirst = current <= 1
  const isLast = current >= totalPages

  function toggleSort(key: string) {
    setSort((s) => {
      if (s?.key !== key) return { key, dir: 'asc' }
      return s.dir === 'asc' ? { key, dir: 'desc' } : null
    })
  }

  return (
    <div>
      {toolbar ? <div className="px-4 py-3">{toolbar}</div> : null}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted hover:bg-muted">
              {columns.map((c) => {
                const active = sort?.key === c.key ? sort.dir : null
                const SortIcon = active === 'asc' ? ChevronUp : active === 'desc' ? ChevronDown : ChevronsUpDown
                return (
                  <TableHead
                    key={c.key}
                    className={columnClass(c)}
                    aria-sort={c.sortValue ? ariaSort(sort, c.key) : undefined}
                  >
                    {c.sortValue ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(c.key)}
                        className={cn(
                          'inline-flex min-h-10 items-center gap-1 rounded-sm font-medium outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                          active && 'text-foreground',
                        )}
                      >
                        {c.header}
                        <SortIcon className="size-3.5" aria-hidden="true" />
                      </button>
                    ) : (
                      c.header
                    )}
                  </TableHead>
                )
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((row) => (
              <TableRow key={getRowKey(row)}>
                {columns.map((c) => (
                  <TableCell key={c.key} className={columnClass(c)}>
                    {c.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col gap-3 border-t border-border px-4 py-3 md:flex-row md:items-center md:justify-between">
        <p className="text-[13px] text-muted-foreground">
          Mostrando {desde} a {hasta} de {total} {entityLabel}
        </p>
        <div className="hidden items-center gap-3 md:flex">
          <div className="flex items-center gap-2">
            <Label htmlFor={pageSizeId} className="text-[13px] font-normal text-muted-foreground">
              Filas por página
            </Label>
            <Select value={String(size)} onValueChange={(v) => setSize(Number(v))}>
              <SelectTrigger id={pageSizeId} className="w-[72px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((o) => (
                  <SelectItem key={o} value={String(o)}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <nav aria-label="Paginación" className="flex items-center gap-1">
            <Button variant="secondary" size="icon-sm" aria-label="Primera página" disabled={isFirst} onClick={() => setPage(1)}>
              <ChevronsLeft />
            </Button>
            <Button
              variant="secondary"
              size="icon-sm"
              aria-label="Página anterior"
              disabled={isFirst}
              onClick={() => setPage(current - 1)}
            >
              <ChevronLeft />
            </Button>
            {pageWindow(current, totalPages).map((p, i) =>
              p === null ? (
                <span key={`gap-${i}`} aria-hidden="true" className="px-1 text-[13px] text-muted-foreground">
                  …
                </span>
              ) : (
                <Button
                  key={p}
                  variant={p === current ? 'default' : 'secondary'}
                  size="icon-sm"
                  aria-label={`Página ${p}`}
                  aria-current={p === current ? 'page' : undefined}
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              ),
            )}
            <Button
              variant="secondary"
              size="icon-sm"
              aria-label="Página siguiente"
              disabled={isLast}
              onClick={() => setPage(current + 1)}
            >
              <ChevronRight />
            </Button>
            <Button
              variant="secondary"
              size="icon-sm"
              aria-label="Última página"
              disabled={isLast}
              onClick={() => setPage(totalPages)}
            >
              <ChevronsRight />
            </Button>
          </nav>
        </div>
        <div className="flex items-center justify-between gap-2 md:hidden">
          <Button variant="secondary" disabled={isFirst} onClick={() => setPage(current - 1)}>
            Anterior
          </Button>
          <span className="text-[13px] text-muted-foreground">
            Página {current} de {totalPages}
          </span>
          <Button variant="secondary" disabled={isLast} onClick={() => setPage(current + 1)}>
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  )
}
