export function normalize(s: string | null | undefined): string {
  return (s ?? '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim().replace(/\s+/g, ' ')
}

export function matches(haystack: (string | null | undefined)[], query: string): boolean {
  const q = normalize(query)
  return q === '' || haystack.some((h) => normalize(h).includes(q))
}
