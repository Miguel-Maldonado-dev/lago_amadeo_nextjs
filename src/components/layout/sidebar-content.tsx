import { LogOut } from 'lucide-react'
import { Avatar } from '@/components/avatar'
import { BrandLogo } from '@/components/brand-logo'
import { Button } from '@/components/ui/button'
import { logout } from '@/features/auth/actions'
import type { RoleName } from '@/lib/constants'
import { NavList } from './nav-list'

/** Datos del usuario que cruzan al cliente: solo valores serializables. */
export type ShellUser = { userName: string; roleName: RoleName | null }

export function SidebarContent({ user, onNavigate }: { user: ShellUser; onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col bg-card">
      <div className="px-6 py-6">
        <BrandLogo size={40} withText />
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        <NavList roleName={user.roleName} onNavigate={onNavigate} />
      </div>
      <div className="flex items-center gap-3 border-t border-border p-4">
        <Avatar name={user.userName} size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{user.userName}</p>
          {user.roleName && <p className="truncate text-xs text-muted-foreground">{user.roleName}</p>}
        </div>
        <form action={logout}>
          <Button type="submit" variant="ghost" size="icon-sm" aria-label="Cerrar sesión">
            <LogOut />
          </Button>
        </form>
      </div>
    </div>
  )
}
