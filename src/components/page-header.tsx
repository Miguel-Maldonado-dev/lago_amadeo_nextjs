import { PageBreadcrumb, type BreadcrumbEntry } from './page-breadcrumb'

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
}: {
  title: string
  description?: string
  breadcrumbs: BreadcrumbEntry[]
  actions?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="flex flex-col gap-2">
        <PageBreadcrumb items={breadcrumbs} />
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-sm text-secondary-foreground">{description}</p>}
      </div>
      {actions && (
        <div className="flex flex-col gap-2 sm:flex-row [&>*]:w-full sm:[&>*]:w-auto">{actions}</div>
      )}
    </div>
  )
}
