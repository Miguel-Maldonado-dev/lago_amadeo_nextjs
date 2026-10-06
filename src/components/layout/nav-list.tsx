'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { RoleName } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { visibleNavItems } from './nav-items'

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href)
}

export function NavList({ roleName, onNavigate }: { roleName: RoleName | null; onNavigate?: () => void }) {
  const pathname = usePathname()
  const items = visibleNavItems(roleName)
  return (
    <nav className="flex flex-col gap-1 px-3">
      {items.map(({ label, href, icon: Icon }) => {
        const active = isActive(pathname, href)
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex h-11 items-center gap-3 rounded-[10px] px-3 text-sm font-medium transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              active
                ? 'bg-primary text-primary-foreground [&_svg]:text-primary-foreground'
                : 'text-secondary-foreground hover:bg-muted [&_svg]:text-muted-foreground',
            )}
          >
            <Icon className="size-5" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
