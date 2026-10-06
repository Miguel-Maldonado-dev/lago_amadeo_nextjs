import { Avatar } from '@/components/avatar'

export function PersonCell({
  name,
  secondary,
}: {
  name: string | null | undefined
  secondary?: string | null
}) {
  if (!name || name === 'Sin información') {
    return (
      <div className="flex items-center gap-3">
        <span className="text-muted-foreground">Sin información</span>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-3">
      <Avatar name={name} size="sm" />
      <div className="flex flex-col">
        <span className="text-sm font-medium">{name}</span>
        {secondary ? <span className="text-xs text-muted-foreground">{secondary}</span> : null}
      </div>
    </div>
  )
}
