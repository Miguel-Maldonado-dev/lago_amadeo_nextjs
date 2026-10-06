export function BrandLogo({ size = 40, withText = false }: { size?: number; withText?: boolean }) {
  const mark = (
    <svg
      viewBox="0 0 40 40"
      width={size}
      height={size}
      role="img"
      aria-label="Lago Amadeo"
      className="shrink-0"
    >
      <circle cx="20" cy="20" r="20" className="fill-primary" />
      <polygon points="8,27 16,13 21,21 25,16 32,27" className="fill-white" />
      <ellipse cx="20" cy="29" rx="10" ry="3" className="fill-primary-light" />
    </svg>
  )
  if (!withText) return mark
  return (
    <div className="flex items-center gap-3">
      {mark}
      <div className="flex flex-col">
        <span className="text-lg font-semibold leading-tight text-primary">Lago Amadeo</span>
        <span className="text-[13px] leading-tight text-muted-foreground">Administración</span>
      </div>
    </div>
  )
}
