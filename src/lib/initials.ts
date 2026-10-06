export function initialsOf(name: string | null | undefined): string {
  const words = (name ?? '').trim().split(/\s+/).filter(Boolean).slice(0, 2)
  if (words.length === 0) return '?'
  return words.map((w) => Array.from(w)[0].toUpperCase()).join('')
}

export function avatarTone(name: string | null | undefined): 1 | 2 | 3 | 4 | 5 | 6 {
  const trimmed = (name ?? '').trim()
  if (!trimmed) return 6
  let sum = 0
  for (let i = 0; i < trimmed.length; i++) sum += trimmed.charCodeAt(i)
  return ((sum % 6) + 1) as 1 | 2 | 3 | 4 | 5 | 6
}
