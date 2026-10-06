import { cn } from '@/lib/utils'
import { avatarTone, initialsOf } from '@/lib/initials'

const TONES = {
  1: 'bg-avatar-1 text-avatar-1-foreground',
  2: 'bg-avatar-2 text-avatar-2-foreground',
  3: 'bg-avatar-3 text-avatar-3-foreground',
  4: 'bg-avatar-4 text-avatar-4-foreground',
  5: 'bg-avatar-5 text-avatar-5-foreground',
  6: 'bg-avatar-6 text-avatar-6-foreground',
} as const

const SIZES = {
  sm: 'size-7 text-[11px]',
  md: 'size-9 text-xs',
  lg: 'size-11 text-sm',
} as const

export function Avatar({
  name,
  size = 'md',
}: {
  name: string | null | undefined
  size?: keyof typeof SIZES
}) {
  return (
    <span
      aria-hidden="true"
      title={name ?? undefined}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-medium select-none',
        SIZES[size],
        TONES[avatarTone(name)],
      )}
    >
      {initialsOf(name)}
    </span>
  )
}
