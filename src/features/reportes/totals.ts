export function totalImporte(rows: { importe: number | null }[]): number {
  return rows.reduce((acc, r) => acc + (r.importe ?? 0), 0)
}
